var pythonPanel = new function() {
  var self = this;

  this.unsaved = false;
  this.modified = false;
  this.blocklyModified = false;

  // Run on page load
  this.init = function() {
    self.$save = $('.savePython');

    self.$save.click(self.save);

    self.loadPythonEditor();
  };

  // Runs when panel is made active
  this.onActive = function() {
    if (self.modified == false) {
      self.loadPythonFromBlockly();
    }
  };

  // Load ace editor
  this.loadPythonEditor = function() {
    self.editor = ace.edit('pythonCode');
    self.editor.setTheme('ace/theme/monokai');
    self.editor.session.setMode('ace/mode/python');

    self.loadLocalStorage();

    self.editor.on('change', self.warnModify);

    setInterval(self.saveLocalStorage, 15 * 1000);
  };

  // Warn when changing python code
  this.warnModify = function() {
    if (self.blocklyModified) {
      return;
    }
    self.unsaved = true;
    self.showSave();

    if (! self.modified) {
      acknowledgeDialog({
        title: 'Warning!',
        message: 'Changes to Python code cannot be converted back into blocks!'
      });
      self.modified = true;
    }
  };

  // Load Python code from blockly
  this.loadPythonFromBlockly = function() {
    self.blocklyModified = true;
    let code = blockly.generator.genCode();
    self.editor.setValue(code, 1);
    self.blocklyModified = false;
  };

  // Save to local storage
  this.saveLocalStorage = function() {
    if (self.unsaved) {
      self.unsaved = false;
      self.hideSave();
      localStorage.setItem('pythonCode', self.editor.getValue());
      localStorage.setItem('pythonModified', self.modified);
    }
  };

  // Load from local storage
  this.loadLocalStorage = function() {
    var code = localStorage.getItem('pythonCode');
    if (code) {
      self.editor.setValue(code);
    }
    if (localStorage.getItem('pythonModified') == 'true') {
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

// Init class
pythonPanel.init();