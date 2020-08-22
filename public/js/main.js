var main = new function() {
  var self = this;

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$fileMenu = $('.fileMenu');
    self.$pythonMenu = $('.pythonMenu');
    self.$robotMenu = $('.robotMenu');
    self.$arenaButton = $('.arenaButton');
    self.$helpMenu = $('.helpMenu');
    self.$projectName = $('#projectName');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);
    self.$pythonMenu.click(self.togglePythonMenu);
    self.$robotMenu.click(self.toggleRobotMenu);
    self.$arenaButton.click(self.arenaWindow);
    self.$helpMenu.click(self.toggleHelpMenu);
    self.$projectName.change(self.saveProjectName);

    window.addEventListener('beforeunload', self.checkUnsaved);
    blocklyPanel.onActive();
    self.loadProjectName();

    self.showWhatsNew();
  };

  // Open a window with a link to the arena page
  this.arenaWindow = function() {
    let options = {
      title: 'GearsBot Arena',
      message:
        '<p>The GearsBot Arena allows up to 4 robots to compete or coorporate with each other.</p>' +
        '<p>Program your robot using the normal GearsBot page (...where you are now), and export your program and robot as a zip package (Files -> Export Zip...). ' +
        'You can then load the zip package into the GearsBot Arena and run it against other players.</p>',
      confirm: 'Go to Arena'
    };
    confirmDialog(options, function(){
      self.openPage('arena.html');
    });
  };

  // Load project name from local storage
  this.loadProjectName = function() {
    self.$projectName.val(localStorage.getItem('projectName'));
  };

  // Remove problematic characters then save project name
  this.saveProjectName = function() {
    let filtered = self.$projectName.val().replace(/[^0-9a-zA-Z_\- ]/g, '').trim();
    self.$projectName.val(filtered);
    localStorage.setItem('projectName', filtered);
  };

  // Save robot to json file
  this.saveRobot = function() {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(robot.options, null, 2));
    hiddenElement.target = '_blank';
    hiddenElement.download = robot.options.name + 'Robot.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // Load robot from json file
  this.loadRobot = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        robot.options = JSON.parse(this.result);
        babylon.resetScene();
        skulpt.hardInterrupt = true;
        simPanel.setRunIcon('run');
        simPanel.initSensorsPanel();
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // About page
  this.openAbout = function() {
    let $body = $(
      '<div class="about">' +
        '<div></div>' +
        '<h3>Credits</h3>' +
        '<p>Created by Cort @ <a href="https://aposteriori.com.sg" target="_blank">A Posteriori</a>.</p>' +
        '<p>This simulator would not have been possible without the great people behind:</p>' +
        '<ul>' +
          '<li><a href="https://www.babylonjs.com/" target="_blank">Babylon.js</a></li>' +
          '<li><a href="https://developers.google.com/blockly" target="_blank">Blockly</a></li>' +
          '<li><a href="https://ace.c9.io/" target="_blank">Ace Editor</a></li>' +
          '<li><a href="https://skulpt.org/" target="_blank">Skulpt</a></li>' +
          '<li><a href="https://github.com/kripken/ammo.js/" target="_blank">Ammo.js</a> (port of <a href="https://pybullet.org/wordpress/" target="_blank">Bullet</a>)</li>' +
        '</ul>' +
        '<h3>Contact</h3>' +
        '<p>Please direct all complaints or requests to <a href="mailto:cort@aposteriori.com.sg">Cort</a>.</p>' +
        '<p>If you\'re in the market for STEM training, do consider <a href="https://aposteriori.com.sg" target="_blank">A Posteriori</a>.</p>' +
        '<h3>License</h3>' +
        '<p>GNU General Public License v3.0</p>' +
        '<p>Gears is a Free and Open Source Software</p>' +
      '</div>'
    );

    let $buttons = $(
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog('About', $body, $buttons);

    $buttons.click(function(){
      console.log('f')
      $dialog.close();
    });
  };

  // Open page in new tab
  this.openPage = function(url) {
    window.open(url, '_blank');
  };

  // Toggle help
  this.toggleHelpMenu = function(e) {
    if ($('.helpMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Wiki', line: false, callback: function() { self.openPage('https://github.com/QuirkyCort/gears/wiki'); }},
        {html: 'Github', line: false, callback: function() { self.openPage('https://github.com/QuirkyCort/gears'); }},
        {html: 'What\'s New', line: false, callback: function() { self.showWhatsNew(true); }},
        {html: 'About', line: false, callback: self.openAbout }
      ];

      menuDropDown(self.$helpMenu, menuItems, {className: 'helpMenuDropDown'});
    }
  };

  // Select robot from templates
  this.selectRobot = function() {
    let $body = $('<div class="selectRobot"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><img class="thumbnail" width="200" height="200"><div class="text"></div></div>');
    let $configurations = $('<div class="configurations"></div>');

    function displayRobotDescriptions(robot) {
      $description.find('.text').html(robot.longDescription);
      if (robot.thumbnail) {
        $description.find('.thumbnail').attr('src', robot.thumbnail);
      } else {
        $description.find('.thumbnail').attr('src', 'images/robots/default_thumbnail.png');
      }

      $configurations.html(robot.longerDescription);
    }

    robotTemplates.forEach(function(robotTemplate){
      let $robot = $('<option></option>');
      $robot.prop('value', robotTemplate.name);
      $robot.text(robotTemplate.shortDescription);
      if (robotTemplate.name == robot.options.name) {
        $robot.attr('selected', 'selected');
        displayRobotDescriptions(robotTemplate);
      }
      $select.append($robot);
    });

    $body.append($select);
    $body.append($description);
    $body.append($configurations);

    $select.change(function(){
      let robotTemplate = robotTemplates.find(robotTemplate => robotTemplate.name == $select.val());
      displayRobotDescriptions(robotTemplate);
    });

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>' +
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog('Select Robot', $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      robot.options = robotTemplates.find(robotTemplate => robotTemplate.name == $select.val());
      babylon.resetScene();
      skulpt.hardInterrupt = true;
      simPanel.setRunIcon('run');
      simPanel.initSensorsPanel();
      $dialog.close();
    });
  };

  // Display current position
  this.displayPosition = function() {
    let x = Math.round(robot.body.position.x * 10) / 10;
    let y = Math.round(robot.body.position.z * 10) / 10;
    let angles = robot.body.absoluteRotationQuaternion.toEulerAngles();
    let rot = Math.round(angles.y / Math.PI * 1800) / 10;

    acknowledgeDialog({
      title: 'Robot Position',
      message: $(
        '<p>Position: ' + x + ', ' + y + '</p>' +
        '<p>Rotation: ' + rot + ' degrees</p>'
      )
    })
  };

  // Save current position
  this.savePosition = function() {
    let x = Math.round(robot.body.position.x * 10) / 10;
    let y = Math.round(robot.body.position.z * 10) / 10;
    let angles = robot.body.absoluteRotationQuaternion.toEulerAngles();
    let rot = Math.round(angles.y / Math.PI * 1800) / 10;

    if (typeof babylon.world.defaultOptions.startPosXY != 'undefined') {
      babylon.world.options.startPosXY = x + ',' +y;
    } else {
      toastMsg('Current world doesn\'t allow saving of position');
      return;
    }
    if (typeof babylon.world.defaultOptions.startRot != 'undefined') {
      babylon.world.options.startRot = rot.toString();
    } else {
      toastMsg('Current world doesn\'t allow saving of rotation');
    }
    babylon.world.setOptions();
  };

  // Clear current position
  this.clearPosition = function() {
    if (babylon.world.options.startPosXY) {
      babylon.world.options.startPosXY = '';
    }
    if (babylon.world.options.startRot) {
      babylon.world.options.startRot = '';
    }
    babylon.world.setOptions();
  };

  // Open a window with a link to the robot configurator page
  this.configuratorWindow = function() {
    let options = {
      title: 'GearsBot Robot Configurator',
      message:
        '<p>The GearsBot Robot Configurator allows you to customize an existing robot or create a new robot design.</p>' +
        '<p>After you have completed your customization, save your creation to file and return here to load it.</p>',
      confirm: 'Go to Configurator'
    };
    confirmDialog(options, function(){
      self.openPage('configurator.html');
    });
  };

  // Toggle robot
  this.toggleRobotMenu = function(e) {
    if ($('.robotMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Select Robot', line: false, callback: self.selectRobot},
        {html: 'Robot Configurator (experimental)', line: true, callback: self.configuratorWindow},
        {html: 'Load from file', line: false, callback: self.loadRobot},
        {html: 'Save to file', line: true, callback: self.saveRobot},
        {html: 'Display current position', line: false, callback: self.displayPosition},
        {html: 'Save current position to settings', line: false, callback: self.savePosition},
        {html: 'Clear position in settings', line: false, callback: self.clearPosition},
      ];

      menuDropDown(self.$robotMenu, menuItems, {className: 'robotMenuDropDown'});
    }
  };

  // Toggle python
  this.togglePythonMenu = function(e) {
    if ($('.pythonMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Ev3dev Mode', line: false, callback: self.switchToEv3dev},
        {html: 'Pybricks Mode (Currently not working with simulator)', line: false, callback: self.switchToPybricks}
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
        {html: 'New Program', line: true, callback: self.newProgram},
        {html: 'Load blocks from your computer', line: false, callback: self.loadFromComputer},
        {html: 'Import functions from blocks file', line: false, callback: self.importFunctionsFromFile},
        {html: 'Save blocks to your computer', line: true, callback: self.saveToComputer},
        {html: 'Load Python from your computer', line: false, callback: self.loadPythonFromComputer},
        {html: 'Save Python to your computer', line: true, callback: self.savePythonToComputer},
        {html: 'Export zip package to your computer', line: true, callback: self.saveZipToComputer},
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // New program
  this.newProgram = function() {
    confirmDialog('Starting a new program will cause all unsaved work to be lost.', function() {
      blockly.loadDefaultWorkspace();
      pythonPanel.modified = false;
      localStorage.setItem('pythonModified', false);
      blocklyPanel.setDisable(false);
    });
  };

  // save Zip to computer
  this.saveZipToComputer = function() {
    let filename = self.$projectName.val();
    if (filename.trim() == '') {
      filename = 'gearsBot';
    }

    var zip = new JSZip();
    zip.file('gearsBlocks.xml', blockly.getXmlText());
    if (pythonPanel.modified) {
      zip.file('gearsPython.py', pythonPanel.editor.getValue());
    } else {
      zip.file('gearsPython.py', blockly.generator.genCode());
    }
    zip.file('gearsRobot.json', JSON.stringify(robot.options, null, 2));

    zip.generateAsync({type:'base64'})
    .then(function(content) {
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:application/xml;base64,' + content;
      hiddenElement.target = '_blank';
      hiddenElement.download = filename + '.zip';
      hiddenElement.dispatchEvent(new MouseEvent('click'));
    });
  };

  // save to computer
  this.saveToComputer = function() {
    let filename = self.$projectName.val();
    if (filename.trim() == '') {
      filename = 'gearsBot';
    }

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/xml;base64,' + btoa(blockly.getXmlText());
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.xml';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // import functions from file
  this.importFunctionsFromFile = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/xml,.xml';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        blockly.importXmlTextFunctions(this.result);
        toastMsg('Functions imported');
      };
      reader.readAsText(e.target.files[0]);
    });
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
      let filename = e.target.files[0].name.replace(/.xml/, '');
      self.$projectName.val(filename);
      self.saveProjectName();
    });
  };

  // save to computer
  this.savePythonToComputer = function() {
    let filename = self.$projectName.val();
    if (filename.trim() == '') {
      filename = 'gearsBot';
    }

    let code = null;
    if (pythonPanel.modified) {
      code = pythonPanel.editor.getValue();
    } else {
      code = blockly.generator.genCode();
    }
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/x-python;base64,' + btoa(code);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.py';
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
        pythonPanel.editor.setValue(this.result, 1);
        self.tabClicked('navPython');
        pythonPanel.warnModify();
      };
      reader.readAsText(e.target.files[0]);
      let filename = e.target.files[0].name.replace(/.py/, '');
      self.$projectName.val(filename);
      self.saveProjectName();
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

  // Display what's new if not seen before
  this.showWhatsNew = function(forceShow=false) {
    let current = 20200813;
    let lastShown = localStorage.getItem('whatsNew');
    if (lastShown == null || parseInt(lastShown) < current || forceShow) {
      let options = {
        title: 'What\'s New',
        message:
          '<h3>13 Aug 2020</h3>' +
          '<p>Added a ruler for measuring distance, angle, and position.</p>' +
          '<h3>11 Aug 2020</h3>' +
          '<p>Biggest new addition is the GearsBot arena, which lets you run up to 4 robots simultaneously, either competing or coorperating with each other to complete a mission.</p>' +
          '<p>To use the GearsBot arena...</p>' +
          '<ul><li>Write your program in the normal GearsBot page (...where you are now)</li>' +
          '<li>Test it out using the new "Arena" world.</li>' +
          '<li>Export your program and robot as a zip package (Files -> Export Zip...)</li>' +
          '<li>Load the zip package in the GearsBot Arena, and run it against other players.</li></ul>' +
          '<p>Other new stuff...</p>' +
          '<ul><li>Added FLL 2020-2021 (RePLAY) to image world</li>' +
          '<li>Added WRO 2020 Junior to image world</li>' +
          '<li>Set project name (optional, but it helps name your save file)</li>' +
          '<li>Lots of bug fixes</li></ul>'
      }
      acknowledgeDialog(options, function(){
        localStorage.setItem('whatsNew', current);
      });
    }
  };
}

// Init class
main.init();
