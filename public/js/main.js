var main = new function() {
  var self = this;
  // mapping of nav panel id to panel object, for py module panels.
  // We add it to the pythonLibPanelFactory instead of to an instance.
  pythonLibPanelFactory.pyModuleId2Panel = {}
  // syntatic sugar, make it look local
  self.pyModuleId2Panel = pythonLibPanelFactory.pyModuleId2Panel;

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$fileMenu = $('.fileMenu');
    self.$pythonMenu = $('.pythonMenu');
    self.$robotMenu = $('.robotMenu');
    self.$worldsMenu = $('.worldsMenu');
    self.$helpMenu = $('.helpMenu');
    self.$projectName = $('#projectName');
    self.$languageMenu = $('.language');
    // python icon controls
    self.$icons_py_upload = $('nav li .upload-py-mod');
    self.$icons_py_download = $('nav li .download-py-mod');
    self.$icons_py_add = $('nav li .add-py-mod');
    self.$icons_py_del = $('nav li .del-py-mod');
    //self.$icons_py_rename = $('nav li .rename-py-mod');
    //self.$py_name_edit = $('nav li .name-edit');
    self.$newsButton = $('.news');

    self.updateTextLanguage();

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);
    self.$pythonMenu.click(self.togglePythonMenu);
    self.$robotMenu.click(self.toggleRobotMenu);
    self.$worldsMenu.click(self.toggleWorldsMenu);
    self.$helpMenu.click(self.toggleHelpMenu);
    self.$languageMenu.click(self.toggleLanguageMenu);
    self.$newsButton.click(self.showNews);

    self.$projectName.change(self.saveProjectName);

    // connect py icon click events to callbacks
    self.$icons_py_upload.click(self.pyUploadModule)
    self.$icons_py_download.click(self.pyDownloadModule)
    self.$icons_py_add.click(self.pyAddModule)
    self.$icons_py_del.click(self.pyDelModule)
    // self.$icons_py_rename.click(self.pyRenameModule)
    // self.$py_name_edit.focusout(self.pyRenameModule)

    window.addEventListener('beforeunload', self.checkUnsaved);
    blocklyPanel.onActive();
    self.loadProjectName();

    self.showWhatsNew();
  };

  // Update text already in html
  this.updateTextLanguage = function() {
    $('#navBlocks').text(i18n.get('#main-blocks#'));
    $('#navSim').text(i18n.get('#main-sim#'));
    self.$fileMenu.text(i18n.get('#main-file#'));
    self.$robotMenu.text(i18n.get('#main-robot#'));
    self.$worldsMenu.text(i18n.get('#main-worlds#'));
    self.$helpMenu.text(i18n.get('#main-help#'));
  };

  // Toggle language menu
  this.toggleLanguageMenu = function(e) {
    if ($('.languageMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      function setLang(lang) {
        localStorage.setItem('LANG', lang);
        window.location.reload();
      }

      let menuItems = [
        {html: 'Deutsch', line: false, callback: function() { setLang('de'); }},
        {html: 'Ελληνικά', line: false, callback: function() { setLang('el'); }},
        {html: 'English', line: false, callback: function() { setLang('en'); }},
        {html: 'Español', line: false, callback: function() { setLang('es'); }},
        {html: 'Français', line: false, callback: function() { setLang('fr'); }},
        {html: 'עברית', line: false, callback: function() { setLang('he'); }},
        {html: 'Nederlands', line: false, callback: function() { setLang('nl'); }},
        {html: 'Português', line: false, callback: function() { setLang('pt'); }},
        {html: 'tlhIngan', line: false, callback: function() { setLang('tlh'); }},
      ];

      menuDropDown(self.$languageMenu, menuItems, {className: 'languageMenuDropDown', align: 'right'});
    }
  };

  // Open a window with a link to the arena page
  this.arenaWindow = function() {
    let options = {
      title: i18n.get('#main-arenaTitle#'),
      message: i18n.get('#main-arenaDescription#'),
      confirm: i18n.get('#main-arenaGo#')
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

  // Load robot
  this.loadRobot = function(json) {
    try {
      data = JSON.parse(json);

      // Is it a world file?
      if (typeof data.worldName != 'undefined') {
        showErrorModal(i18n.get('#main-invalid_robot_file_world#'));
        return;
      }

      // Is it a robot file?
      if (typeof data.bodyHeight == 'undefined') {
        showErrorModal(i18n.get('#main-invalid_robot_file_robot#'));
        return;
      }

      robot.options = data;
      let i = robotTemplates.findIndex(r => r.name == robot.options.name);
      if (i == -1) {
        robotTemplates.push({...data});
      } else {
        robotTemplates[i] = {...data};
      }
      babylon.resetScene();
      skulpt.hardInterrupt = true;
      simPanel.setRunIcon('run');
      simPanel.initSensorsPanel();
    } catch (e) {
      showErrorModal(i18n.get('#main-invalid_robot_file_json#'));
    }

  };

  // Load robot from local json file
  this.loadRobotLocal = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        self.loadRobot(this.result);
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // Load robot from URL
  this.loadRobotURL = function(url) {
    return fetch(url)
      .then(function(response) {
        if (response.ok) {
          return response.text();
        } else {
          toastMsg(i18n.get('#sim-not_found#'));
          return Promise.reject(new Error('invalid_robot'));
        }
      })
      .then(function(response) {
        self.loadRobot(response);
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
        '<p>Contributions from:</p>' +
        '<ul>' +
          '<li>Steven Murray</li>' +
          '<li>humbug99</li>' +
          '<li>Yuvix25</li>' +
        '</ul>' +
        '<p>Translations Contributed By:</p>' +
        '<ul>' +
          '<li>Français: Sébastien CANET &lt;scanet@libreduc.cc&gt;</li>' +
          '<li>Nederlands: Henry Romkes</li>' +
          '<li>Ελληνικά: <a href="https://eduact.org/en" target="_blank">Eduact</a></li>' +
          '<li>Español: edurobotic</li>' +
          '<li>Deutsch: Annette-Gymnasiums-Team (Johanna,Jule,Felix), germanicianus</li>' +
          '<li>עברית: Koby Fruchtnis</li>' +
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
        {html: 'URL Generator', line: false, callback: function() { self.openPage('genURL.html'); }},
        {html: i18n.get('#main-whats_new#'), line: false, callback: function() { self.showWhatsNew(true); }},
        {html: i18n.get('#main-privacy#'), line: false, callback: function() { self.openPage('privacy.html'); }},
        {html: i18n.get('#main-about#'), line: true, callback: self.openAbout },
        {html: i18n.get('#main-display_fps#'), line: false, callback: simPanel.toggleFPS }
      ];
      if (simPanel.showFPS) {
        menuItems[6].html = '<span class="tick">&#x2713;</span> ' + menuItems[6].html;
      }

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
      $description.find('.text').html(i18n.get(robot.longDescription));
      if (robot.thumbnail) {
        $description.find('.thumbnail').attr('src', robot.thumbnail);
      } else {
        $description.find('.thumbnail').attr('src', 'images/robots/default_thumbnail.png');
      }

      $configurations.html(i18n.replace(robot.longerDescription));
    }

    robotTemplates.forEach(function(robotTemplate){
      let $robot = $('<option></option>');
      $robot.prop('value', robotTemplate.name);
      $robot.text(i18n.get(robotTemplate.shortDescription));
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

    let $dialog = dialog(i18n.get('#main-select_robot#'), $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      robot.options = {};
      Object.assign(robot.options, robotTemplates.find(robotTemplate => robotTemplate.name == $select.val()));
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
      title: i18n.get('#main-robot_position#'),
      message: $(
        '<p>' + i18n.get('#main-position#') + ': ' + x + ', ' + y + '</p>' +
        '<p>' + i18n.get('#main-rotation#') + ': ' + rot + ' ' + i18n.get('#main-degrees#') + '</p>'
      )
    })
  };

  // Save current position
  this.savePosition = function() {
    let x = Math.round(robot.body.position.x * 10) / 10;
    let y = Math.round(robot.body.position.z * 10) / 10;
    let angles = robot.body.absoluteRotationQuaternion.toEulerAngles();
    let rot = Math.round(angles.y / Math.PI * 1800) / 10;

    if (typeof babylon.world.defaultOptions.startPosXYZStr != 'undefined') {
      babylon.world.options.startPosXYZStr = x + ',' +y;
    } else if (typeof babylon.world.defaultOptions.startPosXY != 'undefined') {
      babylon.world.options.startPosXY = x + ',' +y;
    } else {
      toastMsg(i18n.get('#main-cannot_save_position#'));
      return;
    }
    if (typeof babylon.world.defaultOptions.startRotStr != 'undefined') {
      babylon.world.options.startRotStr = rot.toString();
    } else if (typeof babylon.world.defaultOptions.startRot != 'undefined') {
      babylon.world.options.startRot = rot.toString();
    } else {
      toastMsg(i18n.get('#main-cannot_save_rotation#'));
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
      title: i18n.get('#main-configurator_title#'),
      message: i18n.get('#main-configurator_description#'),
      confirm: i18n.get('#main-configurator_go#')
    };
    confirmDialog(options, function(){
      self.openPage('configurator.html');
    });
  };

  // Open a window with a link to the world builder page
  this.worldBuilderWindow = function() {
    let options = {
      title: i18n.get('#main-worldBuilder_title#'),
      message: i18n.get('#main-worldBuilder_description#'),
      confirm: i18n.get('#main-worldBuilder_go#')
    };
    confirmDialog(options, function(){
      self.openPage('builder.html');
    });
  };

  // Toggle robot menu
  this.toggleRobotMenu = function(e) {
    if ($('.robotMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: i18n.get('#main-select_robot#'), line: false, callback: self.selectRobot},
        {html: i18n.get('#main-robot_configurator#'), line: true, callback: self.configuratorWindow},
        {html: i18n.get('#main-robot_load_file#'), line: false, callback: self.loadRobotLocal},
        {html: i18n.get('#main-robot_save_file#'), line: true, callback: self.saveRobot},
        {html: i18n.get('#main-display_position#'), line: false, callback: self.displayPosition},
        {html: i18n.get('#main-save_position#'), line: false, callback: self.savePosition},
        {html: i18n.get('#main-clear_position#'), line: false, callback: self.clearPosition},
      ];

      menuDropDown(self.$robotMenu, menuItems, {className: 'robotMenuDropDown'});
    }
  };

  // Toggle worlds menu
  this.toggleWorldsMenu = function(e) {
    if ($('.worldsMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: i18n.get('#main-select_world#'), line: false, callback: simPanel.selectWorld},
        {html: i18n.get('#main-world_builder#'), line: false, callback: self.worldBuilderWindow},
        {html: i18n.get('#main-arena#'), line: true, callback: self.arenaWindow},
        {html: i18n.get('#main-world_load_file#'), line: false, callback: simPanel.loadWorldLocal},
        {html: i18n.get('#main-world_save_file#'), line: false, callback: simPanel.saveWorld},
      ];

      menuDropDown(self.$worldsMenu, menuItems, {className: 'worldsMenuDropDown'});
    }
  };

  // Toggle python
  this.togglePythonMenu = function(e) {
    if ($('.pythonMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Ev3dev Mode', line: false, callback: self.switchToEv3dev},
        {html: 'Pybricks Mode', line: true, callback: self.switchToPybricks},
        {html: 'Zoom In', line: false, callback: pythonPanel.zoomIn},
        {html: 'Zoom Out', line: false, callback: pythonPanel.zoomOut},
        {html: 'Reset Zoom', line: false, callback: pythonPanel.zoomReset},
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
    if (! pythonPanel.modified) {
      pythonPanel.loadPythonFromBlockly();
    }
  };

  // switch to pybricks
  this.switchToPybricks = function() {
    blockly.generator = pybricks_generator;
    blockly.generator.load();
    if (! pythonPanel.modified) {
      pythonPanel.loadPythonFromBlockly();
    }
  };

  // Toggle filemenu
  this.toggleFileMenu = function(e) {
    if ($('.fileMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: i18n.get('#main-new_program#'), line: true, callback: self.newProgram},
        {html: i18n.get('#main-load_blocks#'), line: false, callback: self.loadFromComputer},
        {html: i18n.get('#main-import_functions#'), line: false, callback: self.importFunctionsFromFile},
        {html: i18n.get('#main-save_blocks#'), line: true, callback: self.saveToComputer},
        {html: i18n.get('#main-load_python#'), line: false, callback: self.loadPythonFromComputer},
        {html: i18n.get('#main-save_python#'), line: true, callback: self.savePythonToComputer},
        {html: i18n.get('#main-export_zip#'), line: true, callback: self.saveZipToComputer}
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // New program
  this.newProgram = function() {
    confirmDialog(i18n.get('#main-start_new_warning#'), function() {
      blockly.loadDefaultWorkspace();
      pythonPanel.modified = false;
      localStorage.setItem('pythonModified', false);
      blocklyPanel.setDisable(false);
      self.$projectName.val('');
      self.saveProjectName();
    });
  };

  // save Zip to computer
  this.saveZipToComputer = function() {
    let filename = self.$projectName.val();
    if (filename.trim() == '') {
      filename = 'gearsBot';
    }

    let meta = {
      name: filename,
      pythonModified: pythonPanel.modified
    };

    var zip = new JSZip();
    zip.file('gearsBlocks.xml', blockly.getXmlText());
    if (pythonPanel.modified) {
      zip.file('gearsPython.py', pythonPanel.editor.getValue());
    } else {
      zip.file('gearsPython.py', blockly.generator.genCode());
    }
    // add each python module to the zip

    for (var moduleID in self.pyModuleId2Panel) {
      panel = pythonLibPanelFactory.pyModuleId2Panel[moduleID];
      var module_code = panel.editor.getValue()
      // NOTE - It seems to me that loading a zip file should restore
      // the state of the editor windows.  Therefore, if a module is
      // empty at zip export time, save it as an empty file.
      // if (module_code.trim() === "") {
      moduleFilename = panel.moduleName + '.py'
      zip.file(moduleFilename, module_code);
    }

    zip.file('gearsRobot.json', JSON.stringify(robot.options, null, 2));
    zip.file('meta.json', JSON.stringify(meta, null, 2));

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
        toastMsg(i18n.get('#main-functions_imported'));
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
        // second arg: 0 select all, -1 start, 1 end
        pythonPanel.editor.setValue(this.result, 1);
        self.tabClicked('navPython');
        pythonPanel.warnModify();
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
      reader.readAsText(e.target.files[0]);
      let filename = e.target.files[0].name.replace(/\.py/, '');
      self.$projectName.val(filename);
      self.saveProjectName();
    });
  };

  // save library.py to computer
  this.savePythonModuleToComputer = function(moduleID) {
    pythonLibPanel = self.pyModuleId2Panel[moduleID];
    moduleName = pythonLibPanel.moduleName
    // let filename = 'library'
    let code = null;
    code = pythonLibPanel.editor.getValue();
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/x-python;base64,' + btoa(code);
    hiddenElement.target = '_blank';
    hiddenElement.download = moduleName + '.py';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // load python module from computer to pythonLibPanel
  this.loadPythonModuleFromComputer = function(moduleID) {
    pythonLibPanel = self.pyModuleId2Panel[moduleID];
    // console.log('starting load of library.py');
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'text/x-python,.py';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        // console.log('read library.py text:');
        // console.log(this.result);
        // second arg: 0 replace all, -1 start, 1 end
        pythonLibPanel.editor.setValue(this.result, 0);
        // At the moment this is only called from the module tab, don't click
        // self.tabClicked('libPython');
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
      reader.readAsText(e.target.files[0]);
      let moduleName = e.target.files[0].name.replace(/.py/, '');
      pythonLibPanel.moduleName = moduleName;
      // and change the name on the tab
      selector = "nav li#" + moduleID;
      moduleTabEls = $(selector);
      nameSpanEls = moduleTabEls.find('span.name-edit');
      nameSpanEls[0].innerText = moduleName;
    });
  };

  // Check for unsaved changes
  this.checkUnsaved = function (event) {
    if (blockly.unsaved || pythonPanel.unsaved) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  // used for both main and module tabs.
  this.pyUploadModule = function(event) {
    tabNodes = $( event.target.parentNode.parentNode );
    if (tabNodes.hasClass("pythonMain")) {
      self.loadPythonFromComputer();
    } else {
      moduleID = tabNodes[0].id
      self.loadPythonModuleFromComputer(moduleID);
    }
  }

  // used for both main and module tabs.
  this.pyDownloadModule = function(event) {
    tabNodes = $( event.target.parentNode.parentNode );
    if (tabNodes.hasClass("pythonMain")) {
      self.savePythonToComputer();
    } else {
      moduleID = tabNodes[0].id
      self.savePythonModuleToComputer(moduleID);
    }
  }

  // event callback used for both main and module tabs.
  this.pyAddModule = function(event) {
    self.addPythonModule();
  }

  // used for module tabs only, called on focusoout
  this.pyRenameModule = function(event) {
    tabNodes = $( event.target.parentNode.parentNode );
    moduleID = tabNodes[0].id;
    // first, clean / validate the new name
    newName = event.target.innerText;
    newName = newName.replace(/\s+/g, "").trim();
    pythonLibPanel = self.pyModuleId2Panel[moduleID];
    oldModuleName = pythonLibPanel.moduleName;
    isValid = true
    errMsg = `Unable to change python module name to ${newName}`
    if (oldModuleName != newName) {
      panelModuleNames = pythonLibPanelFactory.getModuleNames()
      if (panelModuleNames.includes(newName)) {
        // the new name is a duplicate, don't accept it
        isValid = false;
        errMsg = `Unable to change python module name to ${newName}, as it would be the same as another module`
      }
      // TODO, better validation to py module name rules
      if (isValid) {
        pythonLibPanel.moduleName = newName;
        console.log(`renamed module ${oldModuleName} to ${newName}`);
      } else {
        // Show UI indication that we failed.
        self.showDialog('Warning', errMsg)
        // set the name back to what it was before the edit
        event.target.innerText = oldModuleName;
      }
    }
  }

  // Remove a python module tab and its editor
  this.pyDelModule = function(event) {
    tabNodes = $( event.target.parentNode.parentNode );
    moduleID = tabNodes[0].id;
    pythonLibPanel = self.pyModuleId2Panel[moduleID];
    moduleName = pythonLibPanel.moduleName;
    // remove all event handlers for the tab
    $(tabNodes[0]).off()
    // remove tab and panel from the DOM.
    tabNodes[0].remove();
    modulePanel = self.$panels.siblings('[aria-labelledby="' + moduleID + '"]')
    modulePanel.remove();
    self.recalcElementSets();
    // TODO, do we need to remove the ACE editor / other associated cleanup?
    pythonLibPanel.editor.destroy()
    // remove from the hash table
    delete self.pyModuleId2Panel[moduleID];
    console.log(`deleted module ID ${moduleID} NAME ${moduleName}`);
    // switch tabs away from the deleted one
    self.tabClicked('navPython');
  }

  // function that we call from the callback and from init code
  // if moduleName is given, attempt to use it, but if it is already taken,
  // then default to the regular pattern.
  this.addPythonModule = function(moduleName) {
    // find an unused module ID
    candIDNum = 0
    while (true) {
      candIDNum += 1
      moduleID = `pythonModule${candIDNum}`
      if (! (moduleID in self.pyModuleId2Panel) ) {
        break;
      }
    }
    // find an unused module name
    candNum = 0
    while (true) {
      // inc at top of loop so continue in loop gets the next candidate.
      candNum += 1
      if ((candNum>1) || (moduleName === undefined)) {
        moduleName = `module${candNum}`
      }
      panelModuleNames = pythonLibPanelFactory.getModuleNames()
      if (! (panelModuleNames.includes(moduleName)) ) {
        break;
      }
    }
    newTabHtml = `<li id="${moduleID}" class="pythonModule">
          <span class="py-mod-name">
            <span class="name-edit">${moduleName}</span>
            <span>.py</span>
          </span>
          <span class="py-mod-controls">
            <i class="fa fa-cloud-upload upload-py-mod"
               title="Upload python module"></i>
            <i class="fa fa-cloud-download download-py-mod"
               title="Download python module"></i>
            <i class="fa fa-minus-circle del-py-mod"
               title="Delete this python module"></i>
          </span>
        </li>`
    // add it just before the simulator Tab
    simTabEl = $('nav li#navSim')
    // before() returns the same element it was called on.
    newTabEl = simTabEl.before(newTabHtml).prev()
    // now add event handlers.  TODO, duplicates code in init()
    newTabEl.click(self.tabClicked)
    //newModuleEl.find('.upload-py-mod').click(self.pyUploadModule)
    upIcon = newTabEl.find('.upload-py-mod')
    upIcon.click(self.pyUploadModule)
    newTabEl.find('.download-py-mod').click(self.pyDownloadModule)
    newTabEl.find('.del-py-mod').click(self.pyDelModule)
    newTabEl.find('span.name-edit').focusout(self.pyRenameModule)
    // add panel element to the parent
    newPanelHtml = `<div class="panel" aria-labelledby="${moduleID}">
                      <div class="pythonModule" id="pythonModule_${moduleID}"></div>
                    </div>`
    // ACE uses the id to attach the editor to the correct DOM element
    simPanelEl = $('div.panels div#simPanel')
    // before() returns the same element it was called on.
    newPanelEl = simPanelEl.before(newPanelHtml).prev()
    // now add event handlers.  TODO, duplicates code in init()
    pyLibPanel = new pythonLibPanelFactory()
    pyLibPanel.init(moduleID, moduleName); // without the .py extn
    self.pyModuleId2Panel[moduleID] = pyLibPanel;
    console.log(`added py panel ${moduleID} for ${moduleName}`);
    self.recalcElementSets();
    // TODO in theory this should transfer focus to the panel... but something
    // about the event handling seems to be causing a later click on navPython
    self.tabClicked(moduleID);
  }

  // recalculate jquery dom element sets each time we modify the dom
  this.recalcElementSets = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
  }

  // Clicked on tab
  this.tabClicked = function(tabNav) {
    if (typeof tabNav == 'string') {
      var match = tabNav;
    } else {
      var match = $(this)[0].id;
    }

    function getPanelByNav(nav) {
      // the python module panels are all in the dict, look there first
      if (nav in self.pyModuleId2Panel) {
        return self.pyModuleId2Panel[nav];
      } else if (nav == 'navBlocks') {
        return blocklyPanel;
      } else if (nav == 'navPython') {
        return pythonPanel;
      } else if (nav == 'navSim') {
        return simPanel;
      }
    };

    // when deleting a python module, inActiveNav and inActive will be undefined
    inActiveNav = self.$navs.siblings('.active').attr('id');
    inActive = getPanelByNav(inActiveNav);
    active = getPanelByNav(match);

    self.$navs.removeClass('active');
    self.$navs.find('span.name-edit').attr('contenteditable', false);
    $('#' + match).addClass('active');
    $('#' + match).find('span.name-edit').attr('contenteditable', true);

    self.$panels.removeClass('active');
    self.$panels.siblings('[aria-labelledby="' + match + '"]').addClass('active');

    self.$panelControls.removeClass('active');
    self.$panelControls.siblings('[aria-labelledby="' + match + '"]').addClass('active');

    if ((inActive !== undefined) &&
        (typeof inActive.onInActive == 'function')) {
      inActive.onInActive();
    }
    if (typeof active.onActive == 'function') {
      active.onActive();
    }
  };

  this.showDialog = function(title, message) {
    let options = {
      title: title,
      message: message
    }
    acknowledgeDialog(options, function(){});
  }

  // Display what's new if not seen before
  this.showWhatsNew = function(forceShow=false) {
    let current = 20220205;
    let lastShown = localStorage.getItem('whatsNew');
    if (lastShown == null || parseInt(lastShown) < current || forceShow) {
      let options = {
        title: 'What\'s New',
        message:
          '<h3>5 Feb 2022 (Hub Buttons, Movement Motors)</h3>' +
          '<ul>' +
          '<li>Hub buttons are now available for use. Find the blocks in the sensors category, and control the buttons in the simulator panel.</li>' +
          '<li>' +
          'You can now set the movement motors using blocks. ' +
          'For most people, this will be unnecessary as it will default to motors A and B which all the built-in robots uses, but it may still be useful for those with a specially configured robot.' +
          '</li>' +
          '</ul>' +
          '<h3>1 Feb 2022 (WRO 2022)</h3>' +
          '<ul>' +
          '<li>Robot missions for WRO 2022 have been added to Missions World.</li>' +
          '<li>Note that the blue water blocks for the Junior mission are not present as those are placed on the robot by hand in the actual competition.</li>' +
          '</ul>' +
          '<h3>6 Jan 2022 (Pybricks)</h3>' +
          '<ul>' +
          '<li>Pybricks code are now runnable, with support for most methods in DriveBase, Motors, TouchSensor, ColorSensor, UltrasonicSensor, and GyroSensor.</li>' +
          '<li>Some components such as the Pen and GPS are currently not supported in Pybricks.</li>' +
          '<li>You can mix Pybricks and Ev3dev Python code in the simulator, but that won\'t run on a real device.</li>' +
          '<li>The auto-generated Pybricks code have also been fixed.</li>' +
          '<li><a href="https://github.com/QuirkyCort/gears/wiki/Pybricks-API-Support" target="_blank">See here for the status of the Pybricks API.</a></li>' +
          '</ul>'
      }
      acknowledgeDialog(options, function(){
        localStorage.setItem('whatsNew', current);
      });
    }
  };

  // Display news
  this.showNews = function() {
    let options = {
      title: 'News',
      message:
        '<h3>Lebanese Virtual Robotics Championship 2021</h3>' +
        '<p>'+
        'Congrats to the 1st Lebanese Virtual Robotics Championship for a successful event! <br>' +
        '<a href="https://www.facebook.com/VirtualRoboticsChampionship/posts/127415569590434" target="_blank">Results</a> ' +
        '<a href="https://www.facebook.com/watch/live/?v=343850580554643&ref=watch_permalink" target="_blank">Video 1</a> ' +
        '<a href="https://www.facebook.com/watch/live/?v=818894112024336&ref=watch_permalink" target="_blank">Video 2</a> ' +
        '</p>'
    }
    acknowledgeDialog(options);
  };
}

// Init class
main.init();
