var blockly = new function() {
  var self = this;
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
    media : 'https://blockly-demo.appspot.com/static/media/',
    rtl : false,
    scrollbars : true,
    sounds : true,
    oneBasedIndex : true
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
    script.src = 'blockly/3.20200402.1/msg/' + LANG + '.js';
    script.addEventListener('load', function() {
      self.loadCustomBlocks()
        .then(self.loadToolBox)
        .then(self.generator.load());
      Blockly.Python['math_change'] = self.math_change;

    });
    document.head.appendChild(script);
  };

  // Load toolbox
  this.loadToolBox = function() {
    return fetch('toolbox.xml?v=b5b47249')
      .then(response => response.text())
      .then(function(response) {
        response = i18n.replace(response);
        var xml = (new DOMParser()).parseFromString(response, "text/xml");
        options.toolbox = xml.getElementById('toolbox');
        self.workspace = Blockly.inject('blocklyHiddenDiv', options);
        self.displayedWorkspace = Blockly.inject('blocklyDiv', options);
        self.displayedWorkspace.addChangeListener(self.mirrorEvent);
        self.registerCustomToolboxes();

        self.loadDefaultWorkspace();

        self.workspace.addChangeListener(Blockly.Events.disableOrphans);
        self.displayedWorkspace.addChangeListener(Blockly.Events.disableOrphans);
        self.loadLocalStorage();
        setTimeout(function(){
          self.workspace.addChangeListener(self.checkModified);
        }, 1000);
      });
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
          self.displayedWorkspace.toolbox_.refreshSelection()
        }, 100);
      });

      xmlList.push(button);

      var blockList = Blockly.Variables.flyoutCategoryBlocks(self.workspace);
      xmlList = xmlList.concat(blockList);
      return xmlList;
    });

    self.displayedWorkspace.registerToolboxCategoryCallback('PROCEDURE2', function(workspace){
      return self.workspace.toolboxCategoryCallbacks_.PROCEDURE(self.workspace);
    });
  };

  // mirror from displayed to actual (hidden) workspace
  this.mirrorEvent = function(primaryEvent) {
    if (self.mirror == false) {
      return;
    }
    if (primaryEvent instanceof Blockly.Events.Ui) {
      return;
    }
    if (
      primaryEvent instanceof Blockly.Events.Create
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
    var json = primaryEvent.toJson();
    var secondaryEvent = Blockly.Events.fromJson(json, self.workspace);
    secondaryEvent.run(true);

    if (primaryEvent instanceof Blockly.Events.Create) {
      self.assignOrphenToPage(blocklyPanel.currentPage);
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
    return fetch('customBlocks.json?v=4284de75')
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
      try {
        let dom = Blockly.Xml.textToDom(xmlText);
        self.workspace.clear();
        Blockly.Xml.domToWorkspace(dom, self.workspace);
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
      catch (err) {
        console.log(err);
        if (err.name == 'Error') {
          toastMsg('Invalid Blocks');
          self.loadXmlText(oldXmlText);
        }
      }
    }
  };

  // import functions from xmlText to workspace
  this.importXmlTextFunctions = function(xmlText) {
    if (xmlText) {
      try {
        let procs = [];
        let dom = Blockly.Xml.textToDom(xmlText);

        // Save all functions
        dom.querySelectorAll('[type="procedures_defnoreturn"]').forEach(function(block){
          procs.push(block);
        });
        dom.querySelectorAll('[type="procedures_defreturn"]').forEach(function(block){
          procs.push(block);
        });

        // Empty dom
        dom = Blockly.Xml.textToDom('<xml xmlns="https://developers.google.com/blockly/xml"></xml>');
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

  //
  // Special generators
  //
  this.math_change = function(block) {
    var argument0 = Blockly.Python.valueToCode(block, 'DELTA',
        Blockly.Python.ORDER_ADDITIVE) || '0';
    var varName = Blockly.Python.variableDB_.getName(block.getFieldValue('VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);
    return varName + ' += ' + argument0 + '\n';
  };
}

