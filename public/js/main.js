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

    self.$navs.click(self.tabClicked);
    self.$consoleBtn.click(self.toggleConsole);
    self.$console.on('transitionend', self.scrollConsoleToBottom);
    self.$runSim.click(self.runSim);

    self.loadPythonEditor();
  };


  //
  this.runSim = function() {
    self.loadPython();
    skulpt.runPython();
  };


  // write to console
  this.consoleWrite = function(text) {
    const regex = /</g;
    const regex2 = />/g;
    text = text.replace(regex, '&lt;').replace(regex2, '&gt;');
    text = main.$consoleContent.html() + text;
    main.$consoleContent.html(text);
    self.scrollConsoleToBottom();
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
