// This code started as a copy of pythonPanel.js
// It might be a good idea to go back and look at sharing code between them.
// Changed from the module pattern to factory pattern so we can have
// multiple instances.  After creating an instance, call x.init(),
// passing a unique module name.  If you repeat a module name between instances,
// they will share storage, which would be bad.
var pythonLibPanelFactory = function() {
  var self = this;

  this.unsaved = false;
  this.modified = false;

  // Run to initialize this instance of the class.
  // The module name may change.  The module ID must not change.
  this.init = function(moduleID, moduleName) {
    self.moduleID = moduleID;
    self.moduleName = moduleName;
    
    self.$save = $('.savePython');

    self.updateTextLanguage();

    self.$save.click(self.save);

    self.loadPythonEditor();
  };

  // Update text already in html
  this.updateTextLanguage = function() {
    self.$save.text(i18n.get('#python-save#'));
  };
  
  // Runs when panel is made active
  this.onActive = function() {
    if (self.modified == false) {
      // self.loadPythonFromBlockly();
    }
  };

  // Load ace editor
  this.loadPythonEditor = function() {
    let langTools = ace.require("ace/ext/language_tools");
    domElID = `pythonModule_${self.moduleID}`
    self.editor = ace.edit(domElID);
    self.editor.setTheme('ace/theme/monokai');
    self.editor.session.setMode('ace/mode/python');
    self.editor.setOptions({
      readOnly: false,
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: true
    });

    var staticWordCompleter = {
      getCompletions: function(editor, session, pos, prefix, callback) {
        var wordList = [
          'reflected_light_intensity', 'color', 'color_name', 'rgb', 'hsv', 'red', 'green', 'blue',
          'angle', 'rate', 'reset',
          'distance_centimeters',
          'position', 'x', 'y', 'altitude',
          'on_for_degrees', 'on_for_rotations', 'on_for_seconds', 'on', 'off'
        ];
        var list = wordList.map(function(word) {
          return {
            caption: word,
            value: word,
            meta: 'method'
          };
        })
        callback(null, list);
      }
    };
    langTools.addCompleter(staticWordCompleter);

    // Don't load local storage at start for py modules.
    // At this point we only have the default name, so we cant load
    // existing code on a page reload anyway.
    // self.loadLocalStorage();

    self.editor.on('change', self.warnModify);

    setInterval(self.saveLocalStorage, 15 * 1000);
  };

  // Warn when changing python code
  this.warnModify = function() {
    // TODO - not clear what to do about warnings for modifying python library
    if (self.blocklyModified) {
      return;
    }
    self.unsaved = true;
    self.showSave();

    if (! self.modified) {
      acknowledgeDialog({
        title: i18n.get('#python-warning#'),
        message: i18n.get('#python-cannot_change_back_warning#')
      });
      self.modified = true;
    }
  };

  // Save to local storage
  this.saveLocalStorage = function() {
    if (self.unsaved) {
      self.unsaved = false;
      self.hideSave();
      lsCodeKey = `pythonModuleCode.${self.moduleName}`;
      lsModifiedKey = `pythonModuleModified.${self.moduleName}`;
      localStorage.setItem(lsCodeKey, self.editor.getValue());
      localStorage.setItem(lsModifiedKey, self.modified);
    }
  };

  // Load from local storage
  this.loadLocalStorage = function() {
    lsCodeKey = `pythonModuleCode.${self.moduleName}`;
    lsModifiedKey = `pythonModuleModified.${self.moduleName}`;
    var code = localStorage.getItem(lsCodeKey);
    if (code) {
      self.editor.setValue(code, 1);
    }
    if (localStorage.getItem(lsModifiedKey) == 'true') {
      self.modified = true;
    }
  };

  // Save
  this.save = function() {
    self.saveLocalStorage();
  };

  // Hide save button
  this.hideSave = function() {
    self.$save.addClass('hide');
  };

  // Show save button
  this.showSave = function() {
    self.$save.removeClass('hide');
  };
}

// active panel objects.
pythonLibPanelFactory.pyModuleId2Panel = {}
// return a list of the names of active python modules.

pythonLibPanelFactory.getModuleNames = function() {
  moduleNames = []
  for (var panelModuleID in pythonLibPanelFactory.pyModuleId2Panel) {
    panel = pythonLibPanelFactory.pyModuleId2Panel[panelModuleID];
    moduleNames.push(panel.moduleName);
  }
  return moduleNames
}
  
// Init class instance after construcing, like this
// plp = new pythonLibPanelFactory()
// plp.init('library');
