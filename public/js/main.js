var simPanel = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$console = $('.console');
    self.$consoleBtn = $('.console .chevron');
    self.$consoleContent = $('.console .content');
    self.$consoleClear = $('.console .clear');
    self.$runSim = $('.runSim');
    self.$world = $('.world');
    self.$reset = $('.reset');
    self.$camera = $('.camera');

    self.$consoleBtn.click(self.toggleConsole);
    self.$console.on('transitionend', self.scrollConsoleToBottom);
    self.$consoleClear.click(self.clearConsole);
    self.$runSim.click(self.runSim);
    self.$world.click(self.selectWorld);
    self.$reset.click(self.resetSim);
    self.$camera.click(self.switchCamera);
  };

  // switch camera
  this.switchCamera = function() {
    if (babylon.cameraMode == 'arc') {
      babylon.setCameraMode('follow');
      self.$camera.html('&#x1f4f9; Follow');

    } else if (babylon.cameraMode == 'follow') {
      babylon.setCameraMode('orthoTop');
      self.$camera.html('&#x1f4f9; Top');

    } else if (babylon.cameraMode == 'orthoTop') {
      babylon.setCameraMode('arc');
      self.$camera.html('&#x1f4f9; Arc');
    }
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
    if (skulpt.running) {
      skulpt.hardInterrupt = true;
      self.setRunIcon('run');
    } else {
      if (! pythonPanel.modified) {
        pythonPanel.loadPythonFromBlockly();
      }
      robot.reset();
      skulpt.runPython();
      self.setRunIcon('stop');
    }
  };

  // Set run icon
  this.setRunIcon = function(type) {
    if (type == 'run') {
      self.$runSim.html('&#x25b6;');
    } else {
      self.$runSim.html('&#x23f9;');
    }
  };

  // Reset simulator
  this.resetSim = function() {
    babylon.removeMeshes(babylon.scene);
    babylon.loadMeshes(babylon.scene);
    skulpt.hardInterrupt = true;
    self.setRunIcon('run');
  };

  // Strip html tags
  this.stripHTML = function(text) {
    const regex = /</g;
    const regex2 = />/g;
    return text.replace(regex, '&lt;').replace(regex2, '&gt;');
  }

  // write to console
  this.consoleWrite = function(text) {
    text = simPanel.$consoleContent.html() + self.stripHTML(text);
    simPanel.$consoleContent.html(text);
    self.scrollConsoleToBottom();
  };

  // write to console
  this.consoleWriteErrors = function(text) {
    text = '<span class="error">' + self.stripHTML(text) + '</span>\n';
    text = simPanel.$consoleContent.html() + text;
    simPanel.$consoleContent.html(text);
    self.scrollConsoleToBottom();
  }

  // clear all content
  this.clearConsole = function() {
    simPanel.$consoleContent.html('');
  };

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

  // Run when panel is inactive
  this.onInActive = function() {
    Blockly.DropDownDiv.hide()
    Blockly.WidgetDiv.hide()
  };

  // Disable blockly by covering with blank div
  this.setDisable = function(state) {
    if (state == true) {
      if (self.$panel.find('.disable').length < 1) {
        self.$panel.append('<div class="disable"><div class="enable">Enable Blocks Mode</div></div>');
        if (Blockly.selected) {
          Blockly.selected.unselect();
        }
        Blockly.clipboardSource_ = null;
        Blockly.clipboardTypeCounts_ = null;
        Blockly.clipboardXml_ = null;

        self.$panel.find('.enable').click(self.enableBlocks);
      }
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
    self.$fileMenu = $('.fileMenu');
    self.$pythonMenu = $('.pythonMenu');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);
    self.$pythonMenu.click(self.togglePythonMenu);

    window.addEventListener('beforeunload', self.checkUnsaved);
    blocklyPanel.onActive();
  };

  // Toggle python
  this.togglePythonMenu = function(e) {
    if ($('.pythonMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Ev3dev Mode', line: false, callback: self.switchToEv3dev},
        {html: 'Pybricks Mode (Currently not working with simulator)', line: true, callback: self.switchToPybricks}
      ];
      var tickIndex;
      if (blockly.generator == ev3dev2_generator) {
        tickIndex = 0;
      } else if (blockly.generator == pybricks_generator) {
        tickIndex = 1;
      }
      menuItems[tickIndex].html = '<span class="tick">&#x2713;</span> ' + menuItems[tickIndex].html;

      menuDropDown(self.$pythonMenu, menuItems, {className: 'pythonMenuDropDown'});
    }
  };

  // switch to ev3dev
  this.switchToEv3dev = function() {
    blockly.generator = ev3dev2_generator;
    blockly.generator.load();
  };

  // switch to pybricks
  this.switchToPybricks = function() {
    blockly.generator = pybricks_generator;
    blockly.generator.load();
  };

  // Toggle filemenu
  this.toggleFileMenu = function(e) {
    if ($('.fileMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Load blocks from your computer', line: false, callback: self.loadFromComputer},
        {html: 'Save blocks to your computer', line: true, callback: self.saveToComputer},
        {html: 'Load Python from your computer', line: false, callback: self.loadPythonFromComputer},
        {html: 'Save Python to your computer', line: false, callback: self.savePythonToComputer},
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // save to computer
  this.saveToComputer = function() {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/xml;base64,' + btoa(blockly.getXmlText());
    hiddenElement.target = '_blank';
    hiddenElement.download = 'gearsBot.xml';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // load from computer
  this.loadFromComputer = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/xml,.xml';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        blockly.loadXmlText(this.result);
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // save to computer
  this.savePythonToComputer = function() {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/x-python;base64,' + btoa(pythonPanel.editor.getValue());
    hiddenElement.target = '_blank';
    hiddenElement.download = 'gearsBot.py';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // load from computer
  this.loadPythonFromComputer = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'text/x-python,.py';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        pythonPanel.editor.setValue(this.result);
        self.tabClicked('navPython');
        pythonPanel.warnModify();
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // Check for unsaved changes
  this.checkUnsaved = function (event) {
    if (blockly.unsaved || pythonPanel.unsaved) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  // Clicked on tab
  this.tabClicked = function(tabNav) {
    if (typeof tabNav == 'string') {
      var match = tabNav;
    } else {
      var match = $(this)[0].id;
    }

    function getPanelByNav(nav) {
      if (nav == 'navBlocks') {
        return blocklyPanel;
      } else if (nav == 'navPython') {
        return pythonPanel;
      } else if (nav == 'navSim') {
        return simPanel;
      }
    };

    inActiveNav = self.$navs.siblings('.active').attr('id');
    inActive = getPanelByNav(inActiveNav);
    active = getPanelByNav(match);

    self.$navs.removeClass('active');
    $('#' + match).addClass('active');

    self.$panels.removeClass('active');
    self.$panels.siblings('[aria-labelledby="' + match + '"]').addClass('active');

    self.$panelControls.removeClass('active');
    self.$panelControls.siblings('[aria-labelledby="' + match + '"]').addClass('active');

    if (typeof inActive.onInActive == 'function') {
      inActive.onInActive();
    }
    if (typeof active.onActive == 'function') {
      active.onActive();
    }
  };
}

// Init class
blocklyPanel.init();
pythonPanel.init();
simPanel.init();
main.init();
