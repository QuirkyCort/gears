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

    self.loadCustomBlocks()
      .then(self.loadToolBox);
    self.generator.load();
    Blockly.Python['math_change'] = self.math_change;
  };

  // Load toolbox
  this.loadToolBox = function() {
    return fetch('toolbox.xml')
      .then(response => response.text())
      .then(function(response) {
        var xml = (new DOMParser()).parseFromString(response, "text/xml");
        options.toolbox = xml.getElementById('toolbox');
        self.workspace = Blockly.inject('blocklyHiddenDiv', options);
        self.displayedWorkspace = Blockly.inject('blocklyDiv', options);
        self.displayedWorkspace.addChangeListener(self.mirrorEvent);
        self.registerCustomToolboxes();

        self.loadDefaultWorkspace();

        self.workspace.addChangeListener(Blockly.Events.disableOrphans);
        self.loadLocalStorage();
        setTimeout(function(){
          self.workspace.addChangeListener(self.checkModified);
        }, 2000);
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
    var json = primaryEvent.toJson();
    var secondaryEvent = Blockly.Events.fromJson(json, self.workspace);
    secondaryEvent.run(true);
  };

  // Load default workspace
  this.loadDefaultWorkspace = function() {
    let xmlText =
      '<xml xmlns="https://developers.google.com/blockly/xml" id="workspaceBlocks" style="display: none">' +
        '<block type="when_started" id="Q!^ZqS4/(a/0XL$cIi-~" x="63" y="38" deletable="false"><data>Main</data></block>' +
      '</xml>';
    self.loadXmlText(xmlText);
  };

  // Load custom blocks
  this.loadCustomBlocks = function() {
    return fetch('customBlocks.json')
      .then(response => response.json())
      .then(function(response) {
        Blockly.defineBlocksWithJsonArray(response);
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
        var xml = Blockly.Xml.textToDom(xmlText);
        self.workspace.clear();
        Blockly.Xml.domToWorkspace(xml, self.workspace);
      }
      catch (err) {
        console.log(err);
        toastMsg('Invalid Blocks');
        self.loadXmlText(oldXmlText);
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
        block.dispose();
      }
    });
  };

  // Copy blocks of specified page into displayed workspace
  this.showPage = function(page) {
    self.mirror = false;
    self.displayedWorkspace.clear();
    self.workspace.getAllBlocks().forEach(function(block){
      if (block.parentBlock_ == null && block.data == page) {
        let dom = Blockly.Xml.blockToDomWithXY(block);
        let xy = block.getRelativeToSurfaceXY();
        let newBlock = Blockly.Xml.domToBlock(dom, self.displayedWorkspace);
        newBlock.moveBy(xy.x, xy.y);
      }
    });
    setTimeout(function() {
      self.mirror = true;
    }, 200);
  };

  // Assign orphen blocks to current page
  this.assignOrphenToPage = function(page) {
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      console.log(block.data)
      if (typeof block.data == 'undefined' || ! block.data) {
        block.data = page;
      }
    });
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

// Init class
blockly.init();
