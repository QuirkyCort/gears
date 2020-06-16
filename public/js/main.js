var simPanel = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$console = $('.console');
    self.$consoleBtn = $('.console .chevron');
    self.$consoleContent = $('.console .content');
    self.$runSim = $('.runSim');
    self.$world = $('.world');
    self.$reset = $('.reset');

    self.$consoleBtn.click(self.toggleConsole);
    self.$console.on('transitionend', self.scrollConsoleToBottom);
    self.$runSim.click(self.runSim);
    self.$world.click(self.selectWorld);
    self.$reset.click(self.resetSim);
  };

  // Select world map
  this.selectWorld = function() {
    let $select = $('<select></select>');
    worlds.forEach(function(world){
      let $world = $('<option></option>');
      $world.prop('value', world.name);
      $world.text(world.shortDescription);
      if (world.name == babylon.world.name) {
        $world.attr('selected', 'selected');
      }
      $select.append($world);
    });

    let options = {
      title: 'Select World',
      message: $select
    };
    confirmDialog(options, function(){
      console.log($select.val());
      babylon.world = worlds.find(world => world.name == $select.val());
      self.resetSim();
    });
  };

  // Run the simulator
  this.runSim = function() {
    if (! pythonPanel.modified) {
      pythonPanel.loadPythonFromBlockly();
    }
    robot.reset();
    skulpt.runPython();
  };

  // Reset simulator
  this.resetSim = function() {
    babylon.createScene();
  };

  // Strip html tags
  this.stripHTML = function(text) {
    const regex = /</g;
    const regex2 = />/g;
    return text.replace(regex, '&lt;').replace(regex2, '&gt;');
  }

  // write to console
  this.consoleWrite = function(text) {
    text = main.$consoleContent.html() + self.stripHTML(text);
    main.$consoleContent.html(text);
    self.scrollConsoleToBottom();
  };

  // write to console
  this.consoleWriteErrors = function(text) {
    text = '<span class="error">' + self.stripHTML(text) + '</span>\n';
    text = main.$consoleContent.html() + text;
    main.$consoleContent.html(text);
    self.scrollConsoleToBottom();
  }

  // Toggle opening and closing of console
  this.toggleConsole = function() {
    self.$console.toggleClass('open');
  };

  // Scroll console to bottom
  this.scrollConsoleToBottom = function() {
    var pre = self.$consoleContent[0];
    pre.scrollTop = pre.scrollHeight - pre.clientHeight
  };
}

var blocklyPanel = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$panel = $('.blocklyEditor');
    self.$save = $('.saveBlockly');

    self.$save.click(self.save);

    setInterval(blockly.saveLocalStorage, 30 * 1000);
  };

  // Run when panel made active
  this.onActive = function() {
    if (pythonPanel.modified) {
      self.setDisable(true);
    } else {
      self.setDisable(false);
    }
  };

  // Disable blockly by covering with blank div
  this.setDisable = function(state) {
    if (state == true) {
      self.$panel.append('<div class="disable"><div class="enable">Enable Blocks Mode</div></div>');
      if (Blockly.selected) {
        Blockly.selected.unselect();
      }
      Blockly.clipboardSource_ = null;
      Blockly.clipboardTypeCounts_ = null;
      Blockly.clipboardXml_ = null;

      self.$panel.find('.enable').click(self.enableBlocks);
    } else {
      self.$panel.find('.disable').remove();
    }
  };

  // Re-enable blocks mode
  this.enableBlocks = function(){
    confirmDialog('Enabling blocks mode will cause all Python changes to be lost.', function(){
      pythonPanel.modified = false;
      localStorage.setItem('pythonModified', false);
      self.setDisable(false);
    });
  }

  // Save
  this.save = function() {
    blockly.saveLocalStorage();
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

  // Load ace editor
  this.loadPythonEditor = function() {
    self.editor = ace.edit('pythonCode');
    self.editor.setTheme('ace/theme/monokai');
    self.editor.session.setMode('ace/mode/python');

    self.loadLocalStorage();

    self.editor.on('change', self.warnModify);

    setInterval(self.saveLocalStorage, 30 * 1000);
  };

  // Warn when changing python code
  this.warnModify = function() {
    if (self.blocklyModified) {
      return;
    }
    self.unsaved = true;
    self.showSave();

    if (! self.modified) {
      acknowledgeDialog('Changes to Python code cannot be converted back into blocks!');
      self.modified = true;
    }
  };

  // Load Python code from blockly
  this.loadPythonFromBlockly = function() {
    self.blocklyModified = true;
    let code = blockly.genPython();
    self.editor.setValue(code);
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

var main = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');

    self.$navs.click(self.tabClicked);

    window.addEventListener('beforeunload', self.checkUnsaved);
    blocklyPanel.onActive();
  };

  // Check for unsaved changes
  this.checkUnsaved = function (event) {
    if (blockly.unsaved || pythonPanel.unsaved) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  // Clicked on tab
  this.tabClicked = function() {
    var match = $(this)[0].id;

    self.$navs.removeClass('active');
    $(this).addClass('active');

    self.$panels.removeClass('active');
    self.$panels.siblings('[aria-labelledby="' + match + '"]').addClass('active');

    self.$panelControls.removeClass('active');
    self.$panelControls.siblings('[aria-labelledby="' + match + '"]').addClass('active');

    if (match == 'navPython' && pythonPanel.modified == false) {
      pythonPanel.loadPythonFromBlockly();
    } else if (match == 'navBlocks') {
      blocklyPanel.onActive();
    }
  };
}

// Init class
blocklyPanel.init();
pythonPanel.init();
simPanel.init();
main.init();
