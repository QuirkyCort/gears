var main = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panels = $('.panels .panel');
    self.$console = $('.console');
    self.$consoleBtn = $('.console .chevron');
    self.$consoleContent = $('.console .content');
    self.$runSim = $('.runSim');
    self.$world = $('.world');
    self.$reset = $('.reset');

    self.$navs.click(self.tabClicked);
    self.$consoleBtn.click(self.toggleConsole);
    self.$console.on('transitionend', self.scrollConsoleToBottom);
    self.$runSim.click(self.runSim);
    self.$world.click(self.selectWorld);
    self.$reset.click(self.resetSim);

    self.loadPythonEditor();
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

  // Reset simulator
  this.resetSim = function() {
    babylon.createScene();
  };

  // Run the simulator
  this.runSim = function() {
    self.loadPython();
    skulpt.runPython();
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

  // Load ace editor
  this.loadPythonEditor = function() {
    self.editor = ace.edit('pythonCode');
    self.editor.setTheme('ace/theme/monokai');
    self.editor.session.setMode('ace/mode/python');
  };

  // Clicked on tab
  this.tabClicked = function() {
    self.$navs.removeClass('active');
    $(this).addClass('active');

    self.$panels.removeClass('active');
    var match = $(this)[0].id;
    self.$panels.siblings('[aria-labelledby="' + match + '"]').addClass('active');

    if (match == 'navPython') {
      self.loadPython();
    }
  };

  // Load Python editor
  this.loadPython = function() {
    let code = blockly.genPython();
    self.editor.setValue(code);
  };
}

// Init class
main.init();
