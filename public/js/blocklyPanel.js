var blocklyPanel = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$panel = $('.blocklyEditor');
    self.$save = $('.saveBlockly');
    self.$pagesMenu = $('#blocklyPages');
    self.currentPage = 'Main';
    self.pages = ['Main'];

    self.$save.click(self.save);
    self.$pagesMenu.click(self.togglePagesMenu);

    setInterval(blockly.saveLocalStorage, 30 * 1000);
  };

  // Toggle pages menu
  this.togglePagesMenu = function(e) {
    if ($('.pagesMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Add Page', line: false, callback: self.addPage},
        {html: 'Delete Current Page', line: true, callback: self.deletePage},
      ];

      for (let i=0; i<self.pages.length; i++) {
        menuItems.push({html: self.pages[i], line: false, callback: self.loadPageCB});
      }

      menuDropDown(self.$pagesMenu, menuItems, {className: 'pagesMenuDropDown', align: 'right', parentIsAbsolute: true});
    }
  };

  // Add a new page
  this.addPage = function($li) {
    var newPage = prompt('New page name');

    if (newPage.trim() == '') {
      return;
    }

    if (self.pages.filter(page => page == newPage).length > 0) {
      toastMsg('Page name "' + newPage + '" is already in use.');
      return;
    }
    self.pages.push(newPage);
    self.loadPage(newPage);
    toastMsg('Page "' + newPage + '" added.');
  };

  // Delete current page
  this.deletePage = function($li) {
    if (self.currentPage == 'Main') {
      toastMsg('Cannot delete Main page');
      return;
    }

    confirmDialog('Delete "' + self.currentPage + '" page?', function(){
      self.pages = self.pages.filter(page => page != self.currentPage);
      self.loadPage('Main');
    });
  };

  // Load selected page
  this.loadPageCB = function($li) {
    self.loadPage($li.text());
  };

  // Load selected page
  this.loadPage = function(page) {
    self.currentPage = page;
    self.$pagesMenu.find('span.currentPage').text(page);
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