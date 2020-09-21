// This code started as a copy of pythonPanel.js
// It might be a good idea to go back and look at sharing code between them.
var pythonLibPanel = new function() {
  var self = this;

  this.unsaved = false;
  this.modified = false;

  // Run on page load
  this.init = function() {
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
    self.editor = ace.edit('pythonLibCode');
    self.editor.setTheme('ace/theme/monokai');
    self.editor.session.setMode('ace/mode/python');
    self.editor.setOptions({
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

    self.loadLocalStorage();

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
      localStorage.setItem('pythonLibCode', self.editor.getValue());
      localStorage.setItem('pythonLibModified', self.modified);
    }
  };

  // Load from local storage
  this.loadLocalStorage = function() {
    var code = localStorage.getItem('pythonLibCode');
    if (code) {
      self.editor.setValue(code);
    }
    if (localStorage.getItem('pythonLibModified') == 'true') {
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
pythonLibPanel.init();
