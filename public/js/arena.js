var arena = new function() {
  var self = this;

  self.showFPS = false;

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$optionsMenu = $('.optionsMenu');
    self.$worldsMenu = $('.worldsMenu');
    self.$worldsMenu.click(self.toggleWorldsMenu);

    self.showNames = false;

    self.$navs.click(self.tabClicked);

    self.$optionsMenu.click(self.toggleOptionsMenu);
  };

  // Toggle worlds menu
  this.toggleWorldsMenu = function(e) {
    if ($('.worldsMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: i18n.get('#main-select_world#'), line: true, callback: arenaPanel.selectWorld},
        {html: i18n.get('#main-world_load_file#'), line: false, callback: arenaPanel.loadWorld},
        {html: i18n.get('#main-world_save_file#'), line: false, callback: arenaPanel.saveWorld},
      ];

      menuDropDown(self.$worldsMenu, menuItems, {className: 'worldsMenuDropDown'});
    }
  };

  // Toggle options
  this.toggleOptionsMenu = function(e) {
    if ($('.optionsMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Show Names', line: false, callback: self.toggleShowName},
        {html: i18n.get('#main-display_fps#'), line: false, callback: arenaPanel.toggleFPS }
      ];
      if (self.showNames) {
        menuItems[0].html = '<span class="tick">&#x2713;</span> ' + menuItems[0].html;
      }
      if (self.showFPS) {
        menuItems[1].html = '<span class="tick">&#x2713;</span> ' + menuItems[1].html;
      }

      menuDropDown(self.$optionsMenu, menuItems, {className: 'optionsMenuDropDown'});
    }
  };

  // Toggle display of name
  this.toggleShowName = function() {
    if (self.showNames) {
      self.showNames = false;
      robots.forEach(robot => {
        robot.hideLabel();
      });
    } else {
      self.showNames = true;
      robots.forEach(robot => {
        robot.showLabel();
      });
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
      if (nav == 'navBots') {
        return botsPanel;
      } else if (nav == 'navArena') {
        return arenaPanel;
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
arena.init();
