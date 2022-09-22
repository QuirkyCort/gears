var blocklyPanel = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$panel = $('.blocklyEditor');
    self.$save = $('.saveBlockly');
    self.$pagesMenu = $('#blocklyPages');

    self.updateTextLanguage();

    self.$save.click(self.save);
    self.$pagesMenu.click(self.togglePagesMenu);

    self.loadPagesOptions();

    setInterval(blockly.saveLocalStorage, 15 * 1000);
  };

  // Update text already in html
  this.updateTextLanguage = function() {
    self.$save.text(i18n.get('#blockly-save#'));
  };

  // Load pages options menu. This is used here and by blockly.js when loading a save.
  this.loadPagesOptions = function(pages, currentPage) {
    if (typeof pages == 'undefined') {
      self.pages = ['Main'];
    } else {
      self.pages = pages;
    }
    self.pages.sort(function(a,b) {
      if (a == 'Main') {
        return -1;
      } else if (b == 'Main') {
        return 1;
      } else {
        return a > b;
      }
    });

    if (typeof currentPage == 'undefined') {
      self.currentPage = 'Main';
    } else {
      self.currentPage = currentPage;
    }
  };

  // Toggle pages menu
  this.togglePagesMenu = function(e) {
    if ($('.pagesMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: i18n.get('#blockly-add_page#'), line: false, callback: self.addPage},
        {html: i18n.get('#blockly-copy_page#'), line: false, callback: self.copyCurrentPage},
        {html: i18n.get('#blockly-move_selected#'), line: false, callback: self.moveSelected},
        {html: i18n.get('#blockly-rename_page#'), line: false, callback: self.renameCurrentPage},
        {html: i18n.get('#blockly-delete_page#'), line: true, callback: self.deleteCurrentPage}
      ];

      for (let i=0; i<self.pages.length; i++) {
        menuItems.push({html: self.pages[i], line: false, callback: self.loadPageCB});
      }

      menuDropDown(self.$pagesMenu, menuItems, {className: 'pagesMenuDropDown', align: 'right', parentIsAbsolute: true});
    }
  };

  // Add a new page
  this.addPage = function($li) {
    var newPage = prompt(i18n.get('#blockly-new_page_name#'));
    if (!newPage) {
      return;
    }

    newPage = newPage.trim();
    if (newPage == '') {
      return;
    }

    if (self.pages.filter(page => page == newPage).length > 0) {
      toastMsg(i18n.get('#blockly-page_name#') + ' "' + newPage + '" ' + i18n.get('#blockly-is_in_use#'));
      return;
    }
    self.pages.push(newPage);
    self.loadPage(newPage);
    toastMsg(i18n.get('#blockly-page#') + ' "' + newPage + '" ' + i18n.get('#blockly-added#'));
  };

  // Copy page
  this.copyCurrentPage = function() {
    var destinationName = prompt(i18n.get('#blockly-copy_to_page_name#'), self.currentPage);
    if (!destinationName) {
      return;
    }

    destinationName = destinationName.trim();
    if (destinationName == '') {
      return;
    }

    if (self.pages.filter(page => page == destinationName).length == 0) {
      self.pages.push(destinationName);
    }
    blockly.assignOrphenToPage(self.currentPage);
    blockly.copyPage(self.currentPage, destinationName);
    toastMsg(i18n.get('#blockly-page#') + ' "' + self.currentPage + '" ' + i18n.get('#blockly-copied_to#') + ' "' + destinationName + '".');
    self.loadPage(destinationName);
  };

  // Move selected blocks
  this.moveSelected = function() {
    let block = Blockly.selected;
    if (block == null) {
      toastMsg(i18n.get('#blockly-no_selected#'));
      return;
    }
    if (block.type == 'when_started') {
      toastMsg(i18n.get('#blockly-cannot_move#')) ;
      return;
    }
    if (block.parentBlock_ != null) {
      toastMsg(i18n.get('#blockly-cannot_move_child#'));
      return;
    }

    var destinationName = prompt(i18n.get('#blockly-move_to_page_name#'), self.currentPage);
    if (!destinationName) {
      return;
    }

    destinationName = destinationName.trim();
    if (destinationName == '') {
      return;
    }

    if (self.pages.filter(page => page == destinationName).length == 0) {
      self.pages.push(destinationName);
    }
    blockly.assignOrphenToPage(self.currentPage);
    blockly.moveSelected(block, destinationName);
    toastMsg(i18n.get('#blockly-moved_to#') + ' "' + destinationName + '".');
    self.loadPage(self.currentPage);
  };

  // Rename page
  this.renameCurrentPage = function() {
    if (self.currentPage == 'Main') {
      toastMsg(i18n.get('#blockly-cannot_rename_main#'));
      return;
    }

    var newName = prompt(i18n.get('#blockly-new_page_name#'), self.currentPage);
    if (!newName) {
      return;
    }

    newName = newName.trim();
    if (newName == '') {
      return;
    }
    if (self.pages.filter(page => page == newName).length > 0) {
      toastMsg(i18n.get('#blockly-page_name#') + ' "' + newName + '" ' + i18n.get('#blockly-is_in_use#'));
      return;
    }

    let i = self.pages.indexOf(self.currentPage);
    self.pages[i] = newName;
    blockly.changePageName(self.currentPage, newName);
    self.loadPage(newName);
  };

  // Delete current page
  this.deleteCurrentPage = function() {
    if (self.currentPage == 'Main') {
      toastMsg(i18n.get('#blockly-cannot_delete_main#'));
      return;
    }

    confirmDialog(i18n.get('#blockly-delete#') + ' "' + self.currentPage + '"? ' + i18n.get('#blockly-all_blocks_lost_warning#'), function(){
      self.pages = self.pages.filter(page => page != self.currentPage);
      blockly.assignOrphenToPage(self.currentPage);
      blockly.deleteAllInPage(self.currentPage);
      self.loadPage('Main');
    });
  };

  // Load selected page
  this.loadPageCB = function($li) {
    self.loadPage($li.text());
  };

  // Load selected page
  this.loadPage = function(page) {
    blockly.assignOrphenToPage(self.currentPage);
    self.currentPage = page;
    self.$pagesMenu.find('span.currentPage').text(page);
    blockly.showPage(self.currentPage);
  };

  // Run when panel made active
  this.onActive = function() {
    if (pythonPanel.modified) {
      self.setDisable(true);
    } else {
      self.setDisable(false);
    }
    self.$panel.removeClass('hide');
    window.dispatchEvent(new Event('resize'));
  };

  // Run when panel is inactive
  this.onInActive = function() {
    Blockly.DropDownDiv.hide()
    Blockly.WidgetDiv.hide()
    self.$panel.addClass('hide');
  };

  // Disable blockly by covering with blank div
  this.setDisable = function(state) {
    if (state == true) {
      if (self.$panel.find('.disable').length < 1) {
        self.$panel.append('<div class="disable"><div class="enable">' + i18n.get('#blockly-enable_blocks#') + '</div></div>');
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
    confirmDialog(i18n.get('#blockly-python_lost_warning#'), function(){
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