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
    self.$worldsMenu = $('.worldsMenu');
    self.$helpMenu = $('.helpMenu');
    self.$projectName = $('#projectName');
    self.$languageMenu = $('.language');
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
    $('#blocklyPages').text(i18n.get('#main-main#'));

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
        {html: '한국어', line: false, callback: function() { setLang('ko'); }},
        {html: 'עברית', line: false, callback: function() { setLang('he'); }},
        {html: 'Nederlands', line: false, callback: function() { setLang('nl'); }},
        {html: 'Português', line: false, callback: function() { setLang('pt'); }},
        {html: 'tlhIngan', line: false, callback: function() { setLang('tlh'); }},
        {html: 'Русский', line: false, callback: function() { setLang('ru'); }},
        {html: 'Magyar', line: false, callback: function() { setLang('hu'); }},
        {html: 'Italiano', line: false, callback: function() { setLang('it'); }},
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
    hiddenElement.href = 'data:application/json;charset=UTF-8,' + encodeURIComponent(JSON.stringify(robot.options, null, 2));
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
          '<li>Русский: Pavel Khoroshevich &lt;khoroshevich.pa@gmail.com&gt;</li>' +
          '<li>Magyar: Niethammer Zoltán</li>' +
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
    // if (! pythonPanel.modified) {
    if (! filesManager.modified) {
      pythonPanel.loadPythonFromBlockly();
    }
  };

  // switch to pybricks
  this.switchToPybricks = function() {
    blockly.generator = pybricks_generator;
    blockly.generator.load();
    // if (! pythonPanel.modified) {
    if (! filesManager.modified) {
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
        {html: i18n.get('#main-export_zip#'), line: false, callback: self.saveZipToComputer},
        {html: i18n.get('#main-import_zip#'), line: false, callback: self.loadZipFromComputer}
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // New program
  this.newProgram = function() {
    confirmDialog(i18n.get('#main-start_new_warning#'), function() {
      blockly.loadDefaultWorkspace();
      filesManager.modified = false;
      localStorage.setItem('gearsPythonModified', false);
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
      pythonModified: filesManager.modified
    };

    var zip = new JSZip();
    zip.file('gearsBlocks.xml', blockly.getXmlText());
    if (filesManager.modified) {
      for (let filename in filesManager.files) {
        zip.file(filename, filesManager.files[filename]);
      };
    } else {
      zip.file('main.py', blockly.generator.genCode());
    }

    zip.file('gearsRobot.json', JSON.stringify(robot.options, null, 2));
    zip.file('meta.json', JSON.stringify(meta, null, 2));

    zip.generateAsync({type:'base64'})
    .then(function(content) {
      self.downloadFile(filename + '.zip', content, 'application/xml');
    });
  };

  this.loadZipFromComputer = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/zip,.zip';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();

        reader.onload = function(e) {
          JSZip.loadAsync(e.target.result)
            .then(async function(zip) {
              filesManager.deleteAll();

              let pythonModified = true;
              if ('meta.json' in zip.files) {
                const metaParams = await loadFile(zip, 'meta.json');
                const meta = JSON.parse(metaParams);

                pythonModified = meta.pythonModified;
                self.$projectName.val(meta.name);
                self.saveProjectName();
              }

              if ('gearsBlocks.xml' in zip.files) {
                const xmlText = await loadFile(zip, 'gearsBlocks.xml');
                blockly.loadXmlText(xmlText);
              }

              if ('gearsRobot.json' in zip.files) {
                const robotConf = await loadFile(zip, 'gearsRobot.json')
                self.loadRobot(robotConf)
              }

              // Load Python files
              for (filename in zip.files) {
                if (filename.endsWith('.py')) {
                  const pythonCode = await loadFile(zip, filename);
                  if (filename == 'gearsPython.py') {
                    filename = 'main.py';
                  }
                  filesManager.add(filename, pythonCode);
                }
              }

              filesManager.modified = pythonModified;
              if (pythonModified) {
                blocklyPanel.setDisable(true);
                filesManager.unsaved = true;
                filesManager.saveLocalStorage();
              }
            })
            .catch(function(err) {
              console.error('JSZip error:', err);
              showErrorModal(i18n.get('#main-invalid_zip_package#'));
            });
        };

        async function loadFile(zip, filename) {
          const file = zip.file(filename);
          if (file) {
            return await file.async('text');
          }
          console.warn('File not found in zip:', filename);
          return null;
        }

        reader.onerror = function(err) {
          console.error('FileReader error:', err);
          alert('Failed to read file.');
        };

        reader.readAsArrayBuffer(file);
      } else {
        console.log('No file selected.');
      }
    });
  };

  // save to computer
  this.saveToComputer = function() {
    let filename = self.$projectName.val();
    if (filename.trim() == '') {
      filename = 'gearsBot';
    }
    self.downloadFile(filename + '.xml', encodeURIComponent(blockly.getXmlText()), 'application/xml;', encoding='charset=UTF-8');
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

  // Download to single file
  this.downloadFile = function(filename, content, mimetype, encoding='base64') {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:' + mimetype + ';' + encoding + ',' + content;
    hiddenElement.target = '_blank';
    hiddenElement.download = filename;
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  }

  // Download to zip file
  this.downloadZipFile = function(filename, files) {
    var zip = new JSZip();
    for (let f in files) {
      zip.file(f, files[f]);
    }

    zip.generateAsync({
      type:'base64',
      compression: "DEFLATE"
    })
    .then(function(content) {
      self.downloadFile(filename + '.zip', content, 'application/zip');
    });
  }

  // save to computer
  this.savePythonToComputer = async function() {
    let filename = self.$projectName.val();
    if (filename.trim() == '') {
      filename = 'gearsBot';
    }

    if (filesManager.modified == false) {
      await pythonPanel.loadPythonFromBlockly();
    }
    filesManager.updateCurrentFile();

    self.downloadZipFile(filename, filesManager.files);
  };

  this.loadPythonFromComputer = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'text/x-python,.py,application/zip,.zip';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      let filename = e.target.files[0].name;
      if (filename.endsWith('.zip')) {
        self.loadPythonFromComputerZip(e);
      } else {
        self.loadSinglePythonFile(e);
      }
      self.$projectName.val(filename.replace(/\.py$/, ''));
      self.saveProjectName();
    });
  };

  this.loadPythonFromComputerZip = function(e) {
    async function loadFiles(zip) {
      filesManager.deleteAll();

      let filenames = [];
      zip.forEach(function(path, file) {
        filenames.push(path);
      });

      if (! filenames.includes('main.py') && ! filenames.includes('gearsPython.py')) {
        console.log('No main.py or gearsPython.py in zip archive');
        throw new Error();
      }

      for (let filename of filenames) {
        if (filename.endsWith('.py')) {
          await zip.file(filename).async('string')
            .then(function(content){
              if (filename == 'gearsPython.py') {
                filename = 'main.py';
              }
              filesManager.add(filename, content);
            });
        }
      }

      filesManager.modified = true;
      filesManager.unsaved = true;
      filesManager.saveLocalStorage();
      self.tabClicked('navPython');
    }

    JSZip.loadAsync(e.target.files[0])
      .then(loadFiles)
      .catch(error => showErrorModal(i18n.get('#main-invalid_python_file#')));
  }

  this.loadSinglePythonFile = function(e) {
    var reader = new FileReader();
    reader.onload = function() {
      filesManager.deleteAll()
      filesManager.add('main.py', this.result);
      filesManager.modified = true;
      filesManager.unsaved = true;
      filesManager.saveLocalStorage();

      self.tabClicked('navPython');
      pythonPanel.warnModify();
    };
    reader.onerror = function() {
      console.log(reader.error);
    };
    reader.readAsText(e.target.files[0]);
  };

  // Check for unsaved changes
  this.checkUnsaved = function (event) {
    if (blockly.unsaved || filesManager.unsaved) {
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

    // when deleting a python module, inActiveNav and inActive will be undefined
    inActiveNav = self.$navs.siblings('.active').attr('id');
    inActive = getPanelByNav(inActiveNav);
    active = getPanelByNav(match);

    self.$navs.removeClass('active');
    $('#' + match).addClass('active');

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
    let current = 20260203;
    let lastShown = localStorage.getItem('whatsNew');
    if (lastShown == null || parseInt(lastShown) < current || forceShow) {
      let options = {
        title: 'What\'s New',
        message:
          '<h3>3 Feb 2026 (WRO Future Engineer)</h3>' +
          '<p>' +
            'Added the playfield for WRO Future Engineer (2025 Playfield). ' +
            'Find it under "Worlds => Select World => Missions". ' +
            'See <a href="https://www.youtube.com/watch?v=jc1r_H7WTIU" target="_blank">this YouTube video</a> for a demo.' +
          '</p>' +
          '<h3>31 Jan 2026 (WRO RoboSport)</h3>' +
          '<p>' +
            'Added the playfield for WRO RoboSport (2025 Playfield). ' +
            'Find it under "Worlds => Select World => Missions". ' +
            'Also available in the multi-robot arena.' +
          '</p>' +
          '<p>' +
            'A sample robot for the RoboSport challenge has also been added. ' +
            'Find it under "Robot => Select Robot => WRO RoboSport". ' +
          '</p>' +
          '<h3>22 Jan 2026 (WRO 2026)</h3>' +
          '<p>' +
            'Added the playfield for WRO 2026 Robomission Junior. ' +
            'Find it under "Worlds => Select World => Missions". ' +
            'All robomission plafields (Elementary, Junior, and Senior) are now available.' +
          '</p>'
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
        '<h3>Open MINT Masters</h3>' +
        '<p>' +
        'Registration for the online Open MINT Masters is open for teams of up to 5 pax, age 10 to 19. ' +
        'The event is open to all teams around the world and registration closes on 31 May 2022.' +
        '</p><p>' +
        '<a href="http://m-learning.info" target="_blank">Find out more and register here.</a> (Site is in German, but readable via Google translate on Chrome.)' +
        '</p>'
    }
    acknowledgeDialog(options);
  };
}

// Init class
main.init();
