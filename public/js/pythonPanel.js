var pythonPanel = new function() {
  var self = this;

  this.ignoreChange = 0;

  // Run on page load
  this.init = function() {
    self.$pythonCode = $('#pythonCode');
    // self.$save = $('.savePython');

    // self.updateTextLanguage();

    // self.$save.click(self.save);

    self.loadPythonEditor();
  };

  // Increase font size
  this.zoomIn = function() {
    let currentSize = parseFloat(self.$pythonCode.css('font-size'));
    self.$pythonCode.css('font-size', currentSize * 1.25);
  };

  // Decrease font size
  this.zoomOut = function() {
    let currentSize = parseFloat(self.$pythonCode.css('font-size'));
    self.$pythonCode.css('font-size', currentSize * 0.8);
  };

  // Reset font size
  this.zoomReset = function() {
    self.$pythonCode.css('font-size', '120%');
  };

  // // Update text already in html
  // this.updateTextLanguage = function() {
  //   self.$save.text(i18n.get('#python-save#'));
  // };

  // Runs when panel is made active
  this.onActive = function() {
    // if (self.modified == false) {
    if (filesManager.modified == false) {
      self.loadPythonFromBlockly();
    }
    self.$pythonCode.removeClass('hide');
  };

  // Run when panel is inactive
  this.onInActive = function() {
    self.$pythonCode.addClass('hide');
  };

  // Load ace editor
  this.loadPythonEditor = function() {
    let langTools = ace.require("ace/ext/language_tools");
    self.editor = ace.edit('pythonCode');
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

    self.editor.on('change', self.warnModify);
  };

  // Warn when changing python code
  this.warnModify = function() {
    if (self.ignoreChange > 0) {
      return;
    }
    filesManager.unsaved = true;

    if (! filesManager.modified) {
      acknowledgeDialog({
        title: i18n.get('#python-warning#'),
        message: i18n.get('#python-cannot_change_back_warning#')
      });
      filesManager.modified = true;
    }
  };

  // Load Python code from blockly
  this.loadPythonFromBlockly = function() {
    self.ignoreChange++;
    filesManager.setToDefault();
    filesManager.select('main.py');
    let code = blockly.generator.genCode();
    self.editor.setValue(code, 1);
    filesManager.updateCurrentFile();
    self.ignoreChange--;
  };

  // // Save
  // this.save = function() {
  //   self.saveLocalStorage();
  // };

  // // Hide save button
  // this.hideSave = function() {
  //   self.$save.addClass('hide');
  // };

  // // Show save button
  // this.showSave = function() {
  //   self.$save.removeClass('hide');
  // };
}

// Init class
pythonPanel.init();