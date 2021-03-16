var builder = new function() {
  var self = this;

  this.worldOptions = JSON.parse(JSON.stringify(worlds[0].defaultOptions));

  this.groundTemplate = {
    optionsConfigurations: [
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for ground image. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'groundType',
        type: 'select',
        options: [
          ['Box', 'box'],
          ['Cylinder', 'cylinder'],
          ['None', 'none']
        ],
        reset: true,
        help: 'Walls only work with a Box ground. If None is selected, there will be no ground! This is only useful if a custom object is added to act as the ground.'
      },
      {
        option: 'imageScale',
        type: 'slider',
        min: '0.1',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Scales the image (eg. when set to 2, each pixel will equal 2mm).'
      },
      {
        option: 'uScale',
        type: 'slider',
        min: '0.1',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Repeats the image horizontally (eg. when set to 2, each image will appear twice).'
      },
      {
        option: 'vScale',
        type: 'slider',
        min: '0.1',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Repeats the image vertically (eg. when set to 2, each image will appear twice).'
      },
      {
        option: 'groundFriction',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
      },
      {
        option: 'groundRestitution',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
        help: 'Affects the bounciness of the ground'
      },
    ]
  };

  this.wallTemplate = {
    optionsConfigurations: [
      {
        option: 'wall',
        type: 'boolean',
        reset: true
      },
      {
        option: 'wallHeight',
        type: 'slider',
        min: '0.1',
        max: '30',
        step: '0.1',
        reset: true
      },
      {
        option: 'wallThickness',
        type: 'slider',
        min: '0.1',
        max: '30',
        step: '0.1',
        reset: true
      },
      {
        option: 'wallColor',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'wallFriction',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
      },
      {
        option: 'wallRestitution',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
        help: 'Affects the bounciness of the ground'
      },
    ]
  };

  this.timerTemplate = {
    optionsConfigurations: [
      {
        option: 'timer',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Count up from zero', 'up'],
          ['Count down from duration', 'down']
        ],
        reset: true,
      },
      {
        option: 'timerDuration',
        type: 'slider',
        min: '1',
        max: '300',
        step: '1',
        reset: true,
      },
      {
        option: 'timerEnd',
        type: 'select',
        options: [
          ['Continue running', 'continue'],
          ['Stop the timer only', 'stopTimer'],
          ['Stop the timer and robot', 'stopRobot']
        ],
      },
    ]
  };

  this.robotTemplate = {
    optionsConfigurations: [
      {
        option: 'startPosXYZ',
        type: 'vectors',
        min: '-200',
        max: '200',
        step: '1',
        reset: true
      },
      {
        option: 'startRot',
        type: 'slider',
        min: '-180',
        max: '180',
        step: '5',
        reset: true,
      },
    ]
  };

  this.boxTemplate = {
    optionsConfigurations: [
      {
        option: 'position',
        type: 'vectors',
        min: '-200',
        max: '200',
        step: '1',
        reset: true
      },
      {
        option: 'size',
        type: 'vectors',
        min: '1',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageType',
        type: 'select',
        options: [
          ['Repeat on every face', 'repeat'],
          ['Only on top face', 'top'],
          ['Only on front face', 'front'],
          ['Map across all faces', 'all']
        ],
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'select',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', false]
        ],
      },
      {
        option: 'magnetic',
        type: 'boolean',
      },
      {
        option: 'laserDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'ultrasonicDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
    ]
  };

  this.cylinderTemplate = {
    optionsConfigurations: [
      {
        option: 'position',
        type: 'vectors',
        min: '-200',
        max: '200',
        step: '1',
        reset: true
      },
      {
        option: 'size',
        type: 'vectors',
        min: '1',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'select',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', false]
        ],
      },
      {
        option: 'magnetic',
        type: 'boolean',
      },
      {
        option: 'laserDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'ultrasonicDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
    ]
  };

  this.sphereTemplate = {
    optionsConfigurations: [
      {
        option: 'position',
        type: 'vectors',
        min: '-200',
        max: '200',
        step: '1',
        reset: true
      },
      {
        option: 'size',
        type: 'vectors',
        min: '1',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'select',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', false]
        ],
      },
      {
        option: 'magnetic',
        type: 'boolean',
      },
      {
        option: 'laserDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'ultrasonicDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
    ]
  };

  this.objectDefault = {
    type: 'box',
    position: [0,0,0],
    size: [10,10,10],
    rotation: [0,0,0],
    color: '#80E680',
    imageType: 'repeat',
    imageURL: '',
    physicsOptions: 'fixed',
    magnetic: false,
    laserDetection: null,
    ultrasonicDetection: null
  };

  this.boxDefault = {
    type: 'box',
    position: [0,0,20],
    size: [10,10,10],
    rotation: [0,0,0],
    color: '#80E680',
    imageType: 'repeat',
    imageURL: '',
    physicsOptions: 'fixed',
    magnetic: false,
    laserDetection: null,
    ultrasonicDetection: null
  };

  this.cylinderDefault = {
    type: 'cylinder',
    position: [0,0,20],
    size: [10,10],
    rotation: [0,0,0],
    color: '#80E680',
    imageType: 'cylinder',
    imageURL: '',
    physicsOptions: 'fixed',
    magnetic: false,
    laserDetection: null,
    ultrasonicDetection: null
  };

  this.sphereDefault = {
    type: 'sphere',
    position: [0,0,20],
    size: [10],
    rotation: [0,0,0],
    color: '#80E680',
    imageType: 'sphere',
    imageURL: '',
    physicsOptions: 'fixed',
    magnetic: false,
    laserDetection: null,
    ultrasonicDetection: null
  };

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$fileMenu = $('.fileMenu');

    self.$addObject = $('.addObject');
    self.$cloneObject = $('.cloneObject');
    self.$deleteObject = $('.deleteObject');
    self.$objectsList = $('.objectsList');
    self.$settingsArea = $('.settingsArea');
    self.$undo = $('.undo');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);

    self.$addObject.click(self.addObject);
    self.$cloneObject.click(self.cloneObject);
    self.$deleteObject.click(self.deleteObject);
    self.$undo.click(self.undo);

    babylon.setCameraMode('arc')

    self.saveHistory();
    self.resetScene();
    // self.saveRobotOptions();
  };

  // Save history
  this.saveHistory = function() {
    if (typeof self.editHistory == 'undefined') {
      self.editHistory = [];
    }

    self.editHistory.push(JSON.stringify(self.worldOptions));
  };

  // Clear history
  this.clearHistory = function() {
    if (typeof self.editHistory != 'undefined') {
      self.editHistory = [];
    }
  };

  // Undo
  this.undo = function() {
    if (typeof self.editHistory != 'undefined' && self.editHistory.length > 0) {
      var lastDesign = self.editHistory.pop();
      self.worldOptions = JSON.parse(lastDesign);
      self.resetScene();
    }
  };

  // Show options
  this.showObjectOptions = function(li) {
    let name = li.name;
    let object = li.object;
    self.$settingsArea.empty();

    function getTitle(opt) {
      let $title = $('<div class="configurationTitle"></div>');
      let $toolTip = $('<span> </span><div class="tooltip">?<div class="tooltiptext"></div></div>');
      $title.text(opt.option);

      if (opt.help) {
        $toolTip.find('.tooltiptext').text(opt.help);
        $title.append($toolTip);
      }
      if (opt.helpSide) {
        $toolTip.addClass(opt.helpSide);
      } else {
        $toolTip.addClass('left');
      }

      return $title;
    }

    function genLabel(opt) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"></div>');
      $textBox.text(opt.text);

      $div.append($textBox);

      return $div;
    }

    function genColor(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $colorBox = $('<div class="color"><input type="color"><input type="text"></div>');
      let $alphaBox = $('<div class="slider">Opacity: <input type="range"></div>');
      let $color = $colorBox.find('input[type=color]');
      let $text = $colorBox.find('input[type=text]');
      let $alpha = $alphaBox.find('input');
      $alpha.attr('min', 0);
      $alpha.attr('max', 255);
      $alpha.attr('step', 1);
      let currentVal = currentOptions[opt.option];

      function setInputs(currentVal) {
        // Strip hex
        if (currentVal[0] = '#') {
          currentVal = currentVal.slice(1);
        }

        // Convert 3/4 notation to 6/8
        if (currentVal.length < 6) {
          let tmp = '';
          for (let c of currentVal) {
            tmp = c + c;
          }
          currentVal = tmp;
        }

        // Split into color and alpha
        let currentValColor = currentVal.slice(0,6).toLowerCase();
        let currentValAlpha = currentVal.slice(6,8);
        if (currentValAlpha == '') {
          currentValAlpha = 255;
        } else {
          currentValAlpha = parseInt(currentValAlpha, 16);
        }

        $color.val('#' + currentValColor);
        $alpha.val(currentValAlpha);
        $text.val('#' + currentValColor + ('0' + currentValAlpha.toString(16)).slice(-2));
      }

      setInputs(currentVal);

      function setColor() {
        let valColor = $color.val();
        let valAlpha = $alpha.val();
        valAlpha = ('0' + parseInt(valAlpha).toString(16)).slice(-2);

        let val = valColor + valAlpha;
        self.saveHistory();
        currentOptions[opt.option] = val;
        $text.val(val);
        if (opt.reset) {
          self.resetScene(false);
        }
      }

      $color.change(setColor);
      $alpha.change(setColor);
      $text.change(function(){
        let val = $text.val();
        setInputs(val);
        self.saveHistory();
        currentOptions[opt.option] = val;
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($colorBox);
      $div.append($alphaBox);

      return $div;
    }

    function genSliderBox(opt, currentValue, callback) {
      let $sliderBox = $(
        '<div class="slider">' +
          '<input type="range">' +
          '<input type="text">' +
        '</div>'
      );
      let $slider = $sliderBox.find('input[type=range]');
      let $input = $sliderBox.find('input[type=text]');

      $slider.attr('min', opt.min);
      $slider.attr('max', opt.max);
      $slider.attr('step', opt.step);
      $slider.attr('value', currentValue);
      $input.val(currentValue);

      $slider.on('input', function(){
        $input.val($slider.val());
      });
      $slider.on('change', function(){
        self.saveHistory();
        callback(parseFloat($slider.val()));
        if (opt.reset) {
          self.resetScene(false);
        }
      })
      $input.change(function(){
        self.saveHistory();
        callback(parseFloat($input.val()));
        $slider.val($input.val());
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      return $sliderBox;
    }

    function genVectors(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');

      $div.append(getTitle(opt));

      if (currentOptions[opt.option] == null) {
        currentOptions[opt.option] = [0,0,0];
      }

      currentOptions[opt.option].forEach(function(currentOption, i){
        let slider = null;

        slider = genSliderBox(opt, currentOption, function(val) {
          currentOptions[opt.option][i] = val;
        });
        $div.append(slider);
      })

      return $div;
    }

    function genSlider(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');

      $div.append(getTitle(opt));
      $div.append(genSliderBox(opt, currentOptions[opt.option], function(val) {
        currentOptions[opt.option] = val;
      }));

      return $div;
    }

    function genFloatText(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.val(currentVal);

      $input.change(function(){
        let val = parseFloat($input.val())
        if (isNaN(val)) {
          toastMsg('Not a valid number');
        } else {
          self.saveHistory();
          currentOptions[opt.option] = val;
          if (opt.reset) {
            self.resetScene(false);
          }
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genIntText(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.val(currentVal);

      $input.change(function(){
        let val = parseInt($input.val())
        if (isNaN(val)) {
          toastMsg('Not a valid number');
        } else {
          self.saveHistory();
          currentOptions[opt.option] = val;
          if (opt.reset) {
            self.resetScene(false);
          }
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genStrText(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.val(currentVal);

      $input.change(function(){
        self.saveHistory();
        currentOptions[opt.option] = $input.val();
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genBoolean(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $checkBox = $('<div class="text"><input type="checkbox"></div>');
      let $input = $checkBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.prop('checked', currentVal);

      $input.change(function(){
        self.saveHistory();
        currentOptions[opt.option] = $input.prop('checked');
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($checkBox);

      return $div;
    }

    function genSelect(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $select = $('<select></select>');
      let currentVal = currentOptions[opt.option];

      opt.options.forEach(function(option){
        let $opt = $('<option></option>');
        $opt.prop('value', option[1]);
        $opt.text(option[0]);
        if (option[1] == currentVal) {
          $opt.attr('selected', true);
        }

        $select.append($opt);
      });

      $select.change(function(){
        self.saveHistory();
        currentOptions[opt.option] = $select.val();
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($select);

      return $div;
    }

    function displayOptionsConfigurations(template) {
      template.optionsConfigurations.forEach(function(optionConfiguration){
        if (optionConfiguration.type == 'label') {
          self.$settingsArea.append(genLabel(optionConfiguration));
        } else if (optionConfiguration.type == 'vectors') {
          self.$settingsArea.append(genVectors(optionConfiguration, object));
        } else if (optionConfiguration.type == 'slider') {
          self.$settingsArea.append(genSlider(optionConfiguration, object));
        } else if (optionConfiguration.type == 'floatText') {
          self.$settingsArea.append(genFloatText(optionConfiguration, object));
        } else if (optionConfiguration.type == 'intText') {
          self.$settingsArea.append(genIntText(optionConfiguration, object));
        } else if (optionConfiguration.type == 'strText') {
          self.$settingsArea.append(genStrText(optionConfiguration, object));
        } else if (optionConfiguration.type == 'boolean') {
          self.$settingsArea.append(genBoolean(optionConfiguration, object));
        } else if (optionConfiguration.type == 'select') {
          self.$settingsArea.append(genSelect(optionConfiguration, object));
        } else if (optionConfiguration.type == 'color') {
          self.$settingsArea.append(genColor(optionConfiguration, object));
        }
      });
    }

    if (name == 'ground') {
      displayOptionsConfigurations(self.groundTemplate);
    } else if (name == 'wall') {
      displayOptionsConfigurations(self.wallTemplate);
    } else if (name == 'timer') {
      displayOptionsConfigurations(self.timerTemplate);
    } else if (name == 'robot') {
      displayOptionsConfigurations(self.robotTemplate);
    } else if (name == 'box') {
      displayOptionsConfigurations(self.boxTemplate);
    } else if (name == 'cylinder') {
      displayOptionsConfigurations(self.cylinderTemplate);
    } else if (name == 'sphere') {
      displayOptionsConfigurations(self.sphereTemplate);
    }
  };

  // Reset scene
  this.resetScene = function(reloadComponents=true) {
    simPanel.hideWorldInfoPanel();
    worlds[0].setOptions(self.worldOptions).then(function(){
      babylon.resetScene();
      babylon.scene.physicsEnabled = false;
      if (reloadComponents) {
        self.loadIntoObjectsWindow(self.worldOptions);
        self.showObjectOptions($('div.objectsList > ul >li')[0]);
      }
      self.highlightSelected();
    });
  }

  // Add a new object to selected
  this.addObject = function() {
    let $body = $('<div class="selectObject"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><div class="text"></div></div>');

    let objectTypes = ['Box', 'Cylinder', 'Sphere'];

    objectTypes.forEach(function(type){
      let $object = $('<option></option>');
      $object.prop('value', type);
      $object.text(type);
      $select.append($object);
    });

    $body.append($select);
    $body.append($description);

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>' +
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog('Select Object Type', $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      self.saveHistory();
      let object = null;
      if ($select.val() == 'Box') {
        object = JSON.parse(JSON.stringify(self.boxDefault));
      } else if ($select.val() == 'Cylinder') {
        object = JSON.parse(JSON.stringify(self.cylinderDefault));
      } else if ($select.val() == 'Sphere') {
        object = JSON.parse(JSON.stringify(self.sphereDefault));
      }
      self.worldOptions.objects.push(object);
      self.resetScene();
      $dialog.close();
    });
  };

  // Clone selected object
  this.cloneObject = function() {
    let $selected = self.getSelectedComponent();
    let VALID_OBJECTS = ['box', 'cylinder', 'sphere']
    if (VALID_OBJECTS.indexOf($selected[0].name) == -1) {
      toastMsg('Only objects can be cloned');
      return;
    }

    self.saveHistory();
    let object = JSON.parse(JSON.stringify($selected[0].object));
    self.worldOptions.objects.push(object);
    self.resetScene();
  };

  // Delete selected object
  this.deleteObject = function() {
    let $selected = self.getSelectedComponent();
    let VALID_OBJECTS = ['box', 'cylinder', 'sphere']
    if (VALID_OBJECTS.indexOf($selected[0].name) == -1) {
      toastMsg('Only objects can be deleted');
      return;
    }

    self.saveHistory();
    self.worldOptions.objects.splice($selected[0].objectIndex, 1);
    self.resetScene();
  };

  // Get selected component
  this.getSelectedComponent = function() {
    return self.$objectsList.find('li.selected');
  };

  // Select list item on click
  this.objectSelect = function(e) {
    self.$objectsList.find('li').removeClass('selected');
    e.target.classList.add('selected');
    e.stopPropagation();

    self.showObjectOptions(e.target);
    self.highlightSelected();
  };

  // Highlight selected component
  this.highlightSelected = function() {
    let $selected = self.$objectsList.find('li.selected');
    if ($selected.length < 1) {
      return;
    }

    let wireframe = babylon.scene.getMeshByID('wireframeObjectSelector');
    if (wireframe != null) {
      wireframe.dispose();
    }
    let index = $selected[0].objectIndex;
    if (typeof index != 'undefined') {
      let id = 'worldBaseObject_' + $selected[0].name + index;
      let body = babylon.scene.getMeshByID(id);
      let size = body.getBoundingInfo().boundingBox.extendSize;
      let options = {
        height: size.y * 2,
        width: size.x * 2,
        depth: size.z * 2
      };
      let wireframeMat = babylon.scene.getMaterialByID('wireframeObjectSelector');
      if (wireframeMat == null) {
        wireframeMat = new BABYLON.StandardMaterial('wireframeObjectSelector', babylon.scene);
        wireframeMat.alpha = 0;
      }

      wireframe = BABYLON.MeshBuilder.CreateBox('wireframeObjectSelector', options, babylon.scene);
      wireframe.material = wireframeMat;
      wireframe.position = body.absolutePosition;
      wireframe.rotationQuaternion = body.absoluteRotationQuaternion;
      wireframe.enableEdgesRendering();
      wireframe.edgesWidth = 50;
      let wireframeAnimation = new BABYLON.Animation(
        'wireframeAnimation',
        'edgesColor',
        30,
        BABYLON.Animation.ANIMATIONTYPE_COLOR4,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );
      var keys = [];
      keys.push({
        frame: 0,
        value: new BABYLON.Color4(0, 0, 1, 1)
      });
      keys.push({
        frame: 15,
        value: new BABYLON.Color4(1, 0, 0, 1)
      });
      keys.push({
        frame: 30,
        value: new BABYLON.Color4(0, 0, 1, 1)
      });
      wireframeAnimation.setKeys(keys);
      wireframe.animations.push(wireframeAnimation);
      babylon.scene.beginAnimation(wireframe, 0, 30, true);
    }
  }

  // Load world into objectss window
  this.loadIntoObjectsWindow = function(options) {
    let objectIndex = 0;

    let $ul = $('<ul></ul>');
    let $li = $('<li class="selected">Ground</li>');
    $li[0].name = 'ground';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Wall</li>');
    $li[0].name = 'wall';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Timer</li>');
    $li[0].name = 'timer';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Robot</li>');
    $li[0].name = 'robot';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Objects</li>');
    $li[0].name = 'objects';
    $li[0].object = {};
    $ul.append($li);

    let $list = $('<ul></ul>');
    options.objects.forEach(function(object){
      for (let key in self.objectDefault) {
        if (typeof object[key] == 'undefined') {
          object[key] = self.objectDefault[key];
        }
      }

      let $item = $('<li></li>');

      $item.text(object.type);
      $item[0].name = object.type;
      $item[0].object = object;
      $item[0].objectIndex = objectIndex++;
      $list.append($item);
    });

    if ($list.children().length > 0) {
      $ul.append($('<li class="ulHolder"></li>').append($list));
    }

    $ul.find('li').click(self.objectSelect);

    self.$objectsList.empty();
    self.$objectsList.append($ul);
  };

  // Save world to json file
  this.saveWorld = function() {
    let world = {
      worldName: 'custom',
      options: self.worldOptions
    };

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(world, null, 2));
    hiddenElement.target = '_blank';
    hiddenElement.download = 'custom_world.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // New world using defaults
  this.newWorld = function() {
    let options = {
      message: 'Create a new empty world? You will lose all unsaved changes.',
    };
    confirmDialog(options, function(){
      self.worldOptions = JSON.parse(JSON.stringify(worlds[0].defaultOptions));
      self.clearHistory();
      self.saveHistory();
      self.resetScene();
    });
  };

  // Load robot from json file
  this.loadWorld = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        self.worldOptions = JSON.parse(this.result).options;
        self.clearHistory();
        self.saveHistory();
        self.resetScene();
      };
      reader.readAsText(e.target.files[0]);
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

  // Toggle filemenu
  this.toggleFileMenu = function(e) {
    if ($('.fileMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'New World', line: true, callback: self.newWorld},
        {html: 'Load from file', line: false, callback: self.loadWorld},
        {html: 'Save to file', line: true, callback: self.saveWorld},
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // Clicked on tab
  this.tabClicked = function(tabNav) {
  };
}

// Init class
builder.init();
