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

  this.pagesWorkspace = [];

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
        self.workspace = Blockly.inject('blocklyDiv', options);

        self.loadDefaultWorkspace();

        self.workspace.addChangeListener(Blockly.Events.disableOrphans);
        self.loadLocalStorage();
        setTimeout(function(){
          self.workspace.addChangeListener(self.checkModified);
        }, 2000);
      });
  };

  // Load default workspace
  this.loadDefaultWorkspace = function() {
    let xmlText =
      '<xml xmlns="https://developers.google.com/blockly/xml" id="workspaceBlocks" style="display: none">' +
        '<block type="when_started" id="Q!^ZqS4/(a/0XL$cIi-~" x="63" y="38" deletable="false"></block>' +
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

  // New workspace page
  this.addWorkspacePage = function(pageName) {
    self.workspacePages.push({
      name: pageName,
      XML: ''
    })
  };

  // load workspace page
  this.loadWorkspacePage = function(pageName) {
    self.currentPage.XML = Blockly.Xml.workspaceToDom(self.workspace);

    self.currentPage = self.workspacePages.find(page => page.name == pageName);

    let dom = Blockly.Xml.textToDom(self.currentPage.XML);
    self.workspace.clear();
    Blockly.Xml.domToWorkspace(dom, self.workspace);
  }

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
