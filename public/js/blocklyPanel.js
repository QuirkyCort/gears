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

// Init class
blocklyPanel.init();