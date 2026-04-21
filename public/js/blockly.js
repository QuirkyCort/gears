var blockly = new function() {
  var self = this;

  self.theme = Blockly.Theme.defineTheme('customTheme', {
    'base': Blockly.Themes.Classic,
    'startHats': true
  });

  var options = {
    toolbox : null,
    zoom: {
      controls: true
    },
    move: {
      wheel: true
    },
    collapse : true,
    comments : true,
    disable : true,
    maxBlocks : Infinity,
    trashcan : false,
    horizontalLayout : false,
    toolboxPosition : 'start',
    css : true,
    media: 'blockly-9.0.0/media',
    rtl : RTL,
    scrollbars : true,
    sounds : true,
    oneBasedIndex : false,
    theme: self.theme
  };

  this.unsaved = false;
  this.generator = ev3dev2_generator;

  this.mirror = true;

  // Run on page load
  this.init = function() {
    Blockly.geras.Renderer.prototype.makeConstants_ = function() {
      var constants = new Blockly.geras.ConstantProvider();
      constants.ADD_START_HATS = true;
      return constants;
    };

    const script = document.createElement('script');
    script.src = 'blockly-9.0.0/msg/js/' + LANG + '.js';
    script.addEventListener('load', function() {
      self.loadCustomBlocks()
        .then(self.loadToolBox)
        .then(self.generator.load());
    });
    document.head.appendChild(script);
  };

  // Load toolbox
  this.loadToolBox = function() {
    return fetch('toolbox.xml?v=b53ac963')
      .then(response => response.text())
      .then(function(response) {
        response = i18n.replace(response);
        self.toolboxXml = (new DOMParser()).parseFromString(response, "text/xml");
        options.toolbox = self.toolboxXml.getElementById('toolbox');
        self.displayedWorkspace = Blockly.inject('blocklyDiv', options);

        // Strip search from toolbox as it cannot be loaded twice
        for (let i=0; i<options.toolbox.childNodes.length; i++) {
          if (options.toolbox.childNodes[i].tagName == 'search') {
            options.toolbox.removeChild(options.toolbox.childNodes[i]);
            break;
          }
        }

        self.workspace = Blockly.inject('blocklyHiddenDiv', options);
        // self.minimap = new Minimap(self.displayedWorkspace);
        // self.minimap.init();
        self.displayedWorkspace.addChangeListener(self.mirrorEvent);
        self.registerCustomToolboxes();

        self.loadDefaultWorkspace();

        self.workspace.addChangeListener(Blockly.Events.disableOrphans);
        self.displayedWorkspace.addChangeListener(Blockly.Events.disableOrphans);
        // self.loadLocalStorage();
        setTimeout(self.loadLocalStorage, 200);
        setTimeout(function(){
          self.workspace.addChangeListener(self.checkModified);
        }, 1000);
      });
  };

  // Filter blocks from toolbox. Load from URL.
  this.loadToolboxFilterURL = function(url) {
    return fetch(url)
      .then(function(response) {
        if (response.ok) {
          return response.text();
        } else {
          toastMsg(i18n.get('#sim-not_found#'));
          return Promise.reject(new Error('invalid_blocks_filter'));
        }
      })
      .then(function(response) {
        self.loadToolboxFilter(JSON.parse(response));
      });
  };

  // Filter blocks from toolbox
  this.loadToolboxFilter = function(filter) {
    if (typeof self.displayedWorkspace == 'undefined') {
      setTimeout(function(){ self.loadToolboxFilter(filter); }, 500);
      return;
    }

    let filteredXml = self.toolboxXml.cloneNode(true);

    let removedCategories = [];
    let removedBlocks = [];

    if (typeof filter.deny != 'undefined') {
      if (typeof filter.deny.categories != 'undefined') {
        for (let deny of filter.deny.categories) {
          let toHide = filteredXml.querySelector('[id="' + deny + '"]');
          if (toHide) {
            removedCategories.push(toHide);
            for (let i=0; i<toHide.children.length; i++) {
              if (toHide.children[i].tagName == 'block') {
                removedBlocks.push(toHide.children[i]);
              }
            }
          }
        }
      }
      if (typeof filter.deny.blocks != 'undefined') {
        for (let deny of filter.deny.blocks) {
          let toHide = filteredXml.querySelector('[type="' + deny + '"]');
          if (toHide) {
            removedBlocks.push(toHide);
          }
        }
      }
    }

    if (typeof filter.show != 'undefined') {
      if (typeof filter.show.categories != 'undefined') {
        for (let show of filter.show.categories) {
          let toShow = filteredXml.querySelector('[id="' + show + '"]');
          if (toShow) {
            removedCategories = removedCategories.filter(function(item) {
              return item != toShow;
            });
          }
        }
      }
      if (typeof filter.show.blocks != 'undefined') {
        for (let show of filter.show.blocks) {
          let toShow = filteredXml.querySelectorAll('[type="' + show + '"]');
          if (toShow.length > 0) {
            for (let i=0; i<toShow.length; i++) {
              if (toShow[i].tagName == 'block') {
                let parent = toShow[i].parentNode;
                removedCategories = removedCategories.filter(function(item) {
                  return item != parent;
                });
                removedBlocks = removedBlocks.filter(function(item) {
                  return item != toShow[i];
                });
              }
            }
          }
        }
      }
    }

    for (let category of removedCategories) {
      category.setAttribute('hidden', true);
    }
    for (let block of removedBlocks) {
      block.remove();
    }

    self.displayedWorkspace.updateToolbox(filteredXml.getElementById('toolbox'));
  };

  // Register variables and procedures toolboxes callbacks
  this.registerCustomToolboxes = function() {
    self.displayedWorkspace.registerToolboxCategoryCallback('VARIABLE2', function(workspace) {
      var xmlList = [];
      var button = document.createElement('button');
      button.setAttribute('text', '%{BKY_NEW_VARIABLE}');
      button.setAttribute('callbackKey', 'CREATE_VARIABLE');

      workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
        Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
        setTimeout(function(){
          self.displayedWorkspace.toolbox.refreshSelection()
        }, 100);
      });

      xmlList.push(button);

      var blockList = Blockly.Variables.flyoutCategoryBlocks(self.workspace);
      xmlList = xmlList.concat(blockList);
      return xmlList;
    });

    self.displayedWorkspace.registerToolboxCategoryCallback('PROCEDURE2', function(workspace){
      let blocks = self.workspace.getToolboxCategoryCallback('PROCEDURE')(self.workspace);
      for (let block of blocks) {
        if (block.type == 'procedures_callnoreturn' || block.type == 'procedures_callreturn') {
          block.inline = true;
          block.inputs = {};
          for (let i=0; i<block.extraState.params.length; i++) {
            block.inputs['ARG' + i] = {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 0
                }
              }
            }
          }
        }
      }
      return blocks;
    });
  };

  // mirror from displayed to actual (hidden) workspace
  this.mirrorEvent = function(primaryEvent) {
    if (self.mirror == false) {
      return;
    }
    if (primaryEvent.isUiEvent) {
      return;
    }
    if (
      primaryEvent.type == Blockly.Events.BLOCK_CREATE
      && primaryEvent.xml.tagName == 'shadow'
    ) {
      let id1 = primaryEvent.blockId;
      let parentId = self.displayedWorkspace.getBlockById(id1).parentBlock_.id;
      let blockIds = [];
      self.displayedWorkspace.getAllBlocks().forEach(function(block){
        blockIds.push(block.id);
      });

      let block2 = null;
      self.workspace.getAllBlocks().forEach(function(block){
        if (
          block.isShadow_
          && block.parentBlock_.id == parentId
          && blockIds.indexOf(block.id) == -1
        ) {
          block2 = block;
        }
      });

      if (block2 != null) {
        let id2 = block2.id;

        block2.id = id1;
        self.workspace.blockDB_[id1] = self.workspace.blockDB_[id2];
        delete self.workspace.blockDB_[id2];

        return;
      }
    }
    if (typeof primaryEvent.varType != 'undefined') {
      primaryEvent.varType = ' ';
    }
    var json = primaryEvent.toJson();
    json.varType = '';
    var secondaryEvent = Blockly.Events.fromJson(json, self.workspace);
    try {
      secondaryEvent.run(true);
    } catch (err) {
      console.log(err);
    }

    if (primaryEvent.type == Blockly.Events.BLOCK_CREATE) {
      self.assignOrphenToPage(blocklyPanel.currentPage);
    }
    if (primaryEvent.type == Blockly.Events.VAR_DELETE) {
      self.displayedWorkspace.getToolbox().refreshSelection()
    }
  };

  // Load default workspace
  this.loadDefaultWorkspace = function() {
    let xmlText =
      '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="when_started" id="Q!^ZqS4/(a/0XL$cIi-~" x="63" y="38" deletable="false"><data>Main</data></block>' +
      '</xml>';
    self.loadXmlText(xmlText);
  };

  // Load custom blocks
  this.loadCustomBlocks = function() {
    return fetch('customBlocks.json?v=3cd8436f')
      .then(response => response.text())
      .then(function(response) {
        let json = JSON.parse(i18n.replace(response));
        Blockly.defineBlocksWithJsonArray(json);
      });
  };

  // Mark workspace as unsaved
  this.checkModified = function(e) {
    if (e.type != Blockly.Events.UI) {
      self.unsaved = true;
      blocklyPanel.showSave();
    }
  };

  // get xmlText
  this.getXmlText = function() {
    var xml = Blockly.Xml.workspaceToDom(self.workspace);
    return Blockly.Xml.domToText(xml);
  };

  // Save to local storage
  this.saveLocalStorage = function() {
    if (self.workspace && self.unsaved) {
      self.unsaved = false;
      blocklyPanel.hideSave();
      localStorage.setItem('blocklyXML', self.getXmlText());
    }
  };

  // load xmlText to workspace
  this.loadXmlText = function(xmlText) {
    let oldXmlText = self.getXmlText();
    if (xmlText) {
      let dom;
      try {
        dom = Blockly.utils.xml.textToDom(xmlText);
      } catch (err) {
        console.log(err);
        toastMsg('File does not appear to be a valid XML');
        return;
      }

      // Attempt to cleanup Dom
      let whenStartedLoaded = false;
      for (let i=0; i<dom.childNodes.length; i++) {
        if (dom.childNodes[i].tagName == 'shadow') {
          dom.removeChild(dom.childNodes[i]);
          i--;
        }
        try {
          if (dom.childNodes[i].getAttribute('type') == 'when_started') {
            if (whenStartedLoaded) {
              dom.removeChild(dom.childNodes[i]);
              i--;
            }
            whenStartedLoaded = true;
          }
        } catch (err) {
          // Ignore
        }
      }

      self.workspace.clear();

      try {
        Blockly.Xml.domToWorkspace(dom, self.workspace);
      } catch (err) {
        console.log(err);
        toastMsg('Error loading blocks');
        self.loadXmlText(oldXmlText);
      }

      self.assignOrphenToPage('Main');
      self.showPage('Main');

      let pages = [];
      self.workspace.getAllBlocks().forEach(function(block){
        if (pages.indexOf(block.data) == -1) {
          pages.push(block.data);
        }
      });
      blocklyPanel.loadPagesOptions(pages);
    }
  };

  // import functions from xmlText to workspace
  this.importXmlTextFunctions = function(xmlText) {
    if (xmlText) {
      try {
        let procs = [];
        let dom = Blockly.utils.xml.textToDom(xmlText);

        // Save all functions
        dom.querySelectorAll('[type="procedures_defnoreturn"]').forEach(function(block){
          procs.push(block);
        });
        dom.querySelectorAll('[type="procedures_defreturn"]').forEach(function(block){
          procs.push(block);
        });

        // Empty dom
        dom = Blockly.utils.xml.textToDom('<xml xmlns="https://developers.google.com/blockly/xml"></xml>');
        procs.forEach(function(block){
          dom.append(block);
        });

        Blockly.Xml.domToWorkspace(dom, self.workspace);
        self.assignOrphenToPage('Main');

        let pages = [];
        self.workspace.getAllBlocks().forEach(function(block){
          if (pages.indexOf(block.data) == -1) {
            pages.push(block.data);
          }
        });
        blocklyPanel.loadPagesOptions(pages);

        self.showPage('Main');
      }
      catch (err) {
        console.log(err);
        toastMsg('Invalid Blocks');
      }
    }
  };

  // Load from local storage
  this.loadLocalStorage = function() {
    self.loadXmlText(localStorage.getItem('blocklyXML'));
  };

  // Clear all blocks from displayed workspace
  this.clearDisplayedWorkspace = function() {
    self.mirror = false;
    self.displayedWorkspace.clear();
    setTimeout(function() {
      self.mirror = true;
    }, 200);
  };

  // Delete all blocks in page
  this.deleteAllInPage = function(page) {
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (block.data == page) {
        block.data = '';
        block.dispose();
      }
    });
    self.unsaved = true;
    blocklyPanel.showSave();
  };

  // Copy blocks of specified page into displayed workspace
  this.showPage = function(page) {
    self.mirror = false;
    self.displayedWorkspace.clear();

    let xy = null;
    self.workspace.getAllBlocks().forEach(function(block){
      if (block.parentBlock_ == null && block.data == page) {
        let dom = Blockly.Xml.blockToDomWithXY(block);
        xy = block.getRelativeToSurfaceXY();
        let displayedBlock = Blockly.Xml.domToBlock(dom, self.displayedWorkspace);
        displayedBlock.moveBy(xy.x, xy.y);
      }
    });
    self.workspace.getAllBlocks().forEach(function(block){
      if (
        block.data != page
        && (block.type == 'procedures_defnoreturn' || block.type == 'procedures_defreturn')
      ) {
        let dom = Blockly.Xml.blockToDom(block);
        let displayedBlock = Blockly.Xml.domToBlock(dom, self.displayedWorkspace);
        if (xy) {
          displayedBlock.moveBy(xy.x, xy.y);
        }
        displayedBlock.setMovable(false);
        displayedBlock.setCollapsed(true);
        displayedBlock.setDeletable(false);
        displayedBlock.getDescendants().forEach(function(desc){
          desc.setDeletable(false);
        });
        displayedBlock.svgGroup_.style.display = 'none';
      }
    });
    self.displayedWorkspace.scrollCenter();
    setTimeout(function() {
      self.mirror = true;
    }, 200);
  };

  // Assign orphen blocks to current page
  this.assignOrphenToPage = function(page) {
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (typeof block.data == 'undefined' || ! block.data) {
        block.data = page;
      }
    });
  };

  // Change page name
  this.changePageName = function(from, to) {
    self.assignOrphenToPage(from);
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (block.data == from) {
        block.data = to;
      }
    });
    self.unsaved = true;
    blocklyPanel.showSave();
  };

  // Copy page
  this.copyPage = function(from, to) {
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (block.parentBlock_ == null && block.data == from && block.type != 'when_started') {
        let dom = Blockly.Xml.blockToDom(block);
        let newBlock = Blockly.Xml.domToBlock(dom, self.workspace);
        newBlock.data = to;
        newBlock.getDescendants().forEach(function(desc){
          desc.data = to;
        })
        let xy = block.getRelativeToSurfaceXY();
        newBlock.moveBy(xy.x, xy.y);
      }
    });
    self.unsaved = true;
    blocklyPanel.showSave();
  };

  // Move blocks
  this.moveSelected = function(selected, to) {
    function moveBlock(block, to) {
      block.data = to;
      block.getChildren().forEach(function(desc) {
        moveBlock(desc, to);
      });
    }

    moveBlock(self.workspace.getBlockById(selected.id), to);
  };
}

