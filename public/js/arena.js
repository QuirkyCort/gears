var arena = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$optionsMenu = $('.optionsMenu');

    self.showNames = false;

    self.$navs.click(self.tabClicked);

    self.$optionsMenu.click(self.toggleOptionsMenu);
  };

  // Toggle options
  this.toggleOptionsMenu = function(e) {
    if ($('.optionsMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Show Names', line: false, callback: self.toggleShowName},
      ];
      if (self.showNames) {
        menuItems[0].html = '<span class="tick">&#x2713;</span> ' + menuItems[0].html;
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
