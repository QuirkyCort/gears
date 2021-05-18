var configurator = new function() {
  var self = this;

  this.savedRobot = null;

  this.bodyTemplate = {
    defaultConfig: {
      bodyHeight: 4,
      bodyWidth: 14,
      bodyLength: 16,
      wheelDiameter: 5.6,
      wheelWidth: 0.8,
      wheelToBodyOffset: 0.2,
      bodyEdgeToWheelCenterY: 1,
      bodyEdgeToWheelCenterZ: 2,
      casterDiameter: 0,
      bodyMass: 1000,
      wheelMass: 200,
      casterMass: 0,
      wheelFriction: 10,
      bodyFriction: 0,
      casterFriction: 0,
      casterOffsetZ: 0,
    },
    optionsConfigurations: [
      {
        option: 'bodyHeight',
        type: 'slider',
        min: '1',
        max: '20',
        step: '0.5',
        reset: true
      },
      {
        option: 'bodyWidth',
        type: 'slider',
        min: '1',
        max: '20',
        step: '0.5',
        reset: true
      },
      {
        option: 'bodyLength',
        type: 'slider',
        min: '1',
        max: '30',
        step: '0.5',
        reset: true
      },
      {
        option: 'wheelDiameter',
        type: 'slider',
        min: '1',
        max: '10',
        step: '0.1',
        reset: true
      },
      {
        option: 'wheelWidth',
        type: 'slider',
        min: '0.2',
        max: '4',
        step: '0.1',
        reset: true
      },
      {
        option: 'wheelToBodyOffset',
        type: 'slider',
        min: '0.1',
        max: '2',
        step: '0.1',
        reset: true
      },
      {
        option: 'bodyEdgeToWheelCenterY',
        type: 'slider',
        min: '0.1',
        max: '5',
        step: '0.1',
        reset: true
      },
      {
        option: 'bodyEdgeToWheelCenterZ',
        type: 'slider',
        min: '0.1',
        max: '20',
        step: '0.1',
        reset: true
      },
      {
        option: 'casterDiameter',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Set to 0 to use wheel diameter'
      },
      {
        option: 'casterOffsetZ',
        type: 'slider',
        min: '0',
        max: '20',
        step: '0.5',
        reset: true,
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Select built-in image',
            callback: 'selectImage'
          }
        ]
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for robot body image. Will not work with most webhosts; Imgur will work.'
      },

    ]
  };

  this.componentTemplates = [
    {
      name: 'Box',
      defaultConfig: {
        type: 'Box',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          height: 1,
          width: 1,
          depth: 1,
          color: 'A3CF0D'
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'height',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'width',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'depth',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'color',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
      ]
    },
    {
      name: 'Cylinder',
      defaultConfig: {
        type: 'Cylinder',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          height: 1,
          diameter: 1,
          color: 'A3CF0D'
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'height',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'diameter',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'color',
          type: 'strText',
          help: 'Color in hex',
          reset: true
        },
      ]
    },
    {
      name: 'Sphere',
      defaultConfig: {
        type: 'Sphere',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          diameter: 1,
          color: 'A3CF0D'
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'diameter',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'color',
          type: 'strText',
          help: 'Color in hex',
          reset: true
        },
      ]
    },
    {
      name: 'ColorSensor',
      defaultConfig: {
        type: 'ColorSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'sensorMinRange',
          type: 'floatText',
          help: 'Anything nearer than this will not be detected. Leave blank to use default.'
        },
        {
          option: 'sensorMaxRange',
          type: 'floatText',
          help: 'Anything further than this will not be detected. Leave blank to use default.'
        },
        {
          option: 'sensorFov',
          type: 'floatText',
          help: 'Field of View in radians. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'UltrasonicSensor',
      defaultConfig: {
        type: 'UltrasonicSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'rayLength',
          type: 'floatText',
          help: 'Anything further than this will not be detected. Leave blank to use default.'
        },
        {
          option: 'rayIncidentLimit',
          type: 'floatText',
          help: 'Ignore object if angle of incident (radian) is greater than this. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'GyroSensor',
      defaultConfig: {
        type: 'GyroSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
      ]
    },
    {
      name: 'GPSSensor',
      defaultConfig: {
        type: 'GPSSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
      ]
    },
    {
      name: 'MagnetActuator',
      defaultConfig: {
        type: 'MagnetActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'maxRange',
          type: 'floatText',
          help: 'Anything further than this will not be attracted. Leave blank to use default.'
        },
        {
          option: 'maxPower',
          type: 'floatText',
          help: 'Maximum attraction force. Actual will be lower due to distance falloff. Leave blank to use default.'
        },
        {
          option: 'dGain',
          type: 'floatText',
          help: 'Positive gain used to reduce wobbling of objects being attracted. Leave blank to use default of none (0).'
        }
      ]
    },
    {
      name: 'ArmActuator',
      defaultConfig: {
        type: 'ArmActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        components: [],
        options: {
          armColor: 'A3CF0D'
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'armLength',
          type: 'floatText',
          help: 'Length of arm in cm. Leave blank to use default.',
          reset: true
        },
        {
          option: 'armColor',
          type: 'strText',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'minAngle',
          type: 'floatText',
          help: 'Lowest possible angle for arm. Leave blank to use default.'
        },
        {
          option: 'maxAngle',
          type: 'floatText',
          help: 'Highest possible angle for arm. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'LaserRangeSensor',
      defaultConfig: {
        type: 'LaserRangeSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'rayLength',
          type: 'floatText',
          help: 'Anything further than this will not be detected. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'SwivelActuator',
      defaultConfig: {
        type: 'SwivelActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        components: [],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
      ]
    },
    {
      name: 'PaintballLauncherActuator',
      defaultConfig: {
        type: 'PaintballLauncherActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'drawBackLimit',
          type: 'floatText',
          help: 'The limit that you can pull back the spring in degrees. Leave blank to use default.'
        },
        {
          option: 'powerScale',
          type: 'floatText',
          help: 'This is multiplied by the spring drawback to determine the initial velocity of the paintball. Leave blank to use default.'
        },
        {
          option: 'maxSpeed',
          type: 'floatText',
          help: 'Maximum rotation speed of the motor. NOT the maximum speed of the paintball. Leave blank to use default.'
        },
        {
          option: 'color',
          type: 'intText',
          help: 'Color of the paintball. From 0 to 5, they are Cyan, Green, Yellow, Red, Magenta, Blue. Leave blank to use default.'
        },
        {
          option: 'ttl',
          type: 'intText',
          help: 'Time-To-Live in milliseconds. After this duration, the paintball will be removed. Leave blank to use default.'
        },
        {
          option: 'ammo',
          type: 'intText',
          help: 'Amount of ammo available to the launcher at start. Set to "-1" for unlimited ammo. Leave blank to use default.'
        },
        {
          option: 'splatterTTL',
          type: 'intText',
          help: 'Time-To-Live in milliseconds for the paint splatter. After this duration, the paint splatter will be removed. Set a negative number to last forever. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'Pen',
      defaultConfig: {
        type: 'Pen',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          doubleSided: false
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'doubleSided',
          type: 'boolean',
          help: 'If true, the drawn trace will be visible from both sides.'
        }
      ]
    },
    {
      name: 'TouchSensor',
      defaultConfig: {
        type: 'TouchSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          width: 2,
          depth: 2,
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
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
          option: 'width',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'depth',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
      ]
    },
  ];

  // Run on page load
  this.init = function() {
    if (typeof babylon.scene == 'undefined') {
      setTimeout(self.init, 500);
      return;
    }

    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$fileMenu = $('.fileMenu');
    self.$robotName = $('#robotName');

    self.$addComponent = $('.addComponent');
    self.$deleteComponent = $('.deleteComponent');
    self.$componentList = $('.componentsList');
    self.$settingsArea = $('.settingsArea');
    self.$undo = $('.undo');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);

    self.$addComponent.click(self.addComponent);
    self.$deleteComponent.click(self.deleteComponent);
    self.$undo.click(self.undo);

    self.$robotName.change(self.setRobotName);

    babylon.scene.physicsEnabled = false;
    babylon.setCameraMode('arc')

    self.saveHistory();
    self.resetScene();
    self.saveRobotOptions();
  };

  // Save history
  this.saveHistory = function() {
    if (typeof self.editHistory == 'undefined') {
      self.editHistory = [];
    }

    self.editHistory.push(JSON.stringify(robot.options));
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
      robot.options = JSON.parse(lastDesign);
      self.resetScene();
    }
  };

  // Save robot options
  this.saveRobotOptions = function() {
    self.savedRobot = JSON.parse(JSON.stringify(robot.options));
  };

  // Load robot options
  this.loadRobotOptions = function() {
    robot.options = JSON.parse(JSON.stringify(self.savedRobot));
    self.resetScene();
  };

  // Set the robot name
  this.setRobotName = function() {
    robot.options.name = self.$robotName.val();
  };

  // Show options
  this.showComponentOptions = function(component) {
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

    function genButtons(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $buttonsBox = $('<div class="color"></div>');

      for (let button of opt.buttons) {
        let $button = $('<button></button>');
        $button.text(button.label);
        $button.click(function() {
          self[button.callback](currentOptions);
        });
        $buttonsBox.append($button);
      }

      $div.append($buttonsBox);

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

      if (typeof currentVal == 'undefined') {
        currentVal = '#f09c0d';
      }

      function setInputs(currentVal) {
        // Strip hex
        if (currentVal[0] == '#') {
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

        if (opt.option == 'rotation') {
          slider = genSliderBox(opt, currentOption / Math.PI * 180, function(val) {
            currentOptions[opt.option][i] = val / 180 * Math.PI;
          });
        } else {
          slider = genSliderBox(opt, currentOption, function(val) {
            currentOptions[opt.option][i] = val;
          });
        }
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


    let $componentName = $('<div class="componentName"></div>');
    if (typeof component.bodyMass != 'undefined') {
      $componentName.text('Body');
    } else {
      $componentName.text(component.type);
    }
    self.$settingsArea.append($componentName);

    if (typeof component.options == 'undefined' || component.options == null) {
      component.options = {};
    }

    function displayOptionsConfiguration(optionConfiguration, options) {
      if (optionConfiguration.type == 'vectors') {
        self.$settingsArea.append(genVectors(optionConfiguration, options));
      } else if (optionConfiguration.type == 'slider') {
        self.$settingsArea.append(genSlider(optionConfiguration, options));
      } else if (optionConfiguration.type == 'floatText') {
        self.$settingsArea.append(genFloatText(optionConfiguration, options));
      } else if (optionConfiguration.type == 'intText') {
        self.$settingsArea.append(genIntText(optionConfiguration, options));
      } else if (optionConfiguration.type == 'strText') {
        self.$settingsArea.append(genStrText(optionConfiguration, options));
      } else if (optionConfiguration.type == 'boolean') {
        self.$settingsArea.append(genBoolean(optionConfiguration, options));
      } else if (optionConfiguration.type == 'color') {
        self.$settingsArea.append(genColor(optionConfiguration, options));
      } else if (optionConfiguration.type == 'buttons') {
        self.$settingsArea.append(genButtons(optionConfiguration, options));
      }
    }

    if (typeof component.bodyMass != 'undefined') { // main body
      let bodyTemplate = self.bodyTemplate;
      bodyTemplate.optionsConfigurations.forEach(function(optionConfiguration){
        displayOptionsConfiguration(optionConfiguration, component);
      });
    } else {
      let componentTemplate = self.componentTemplates.find(componentTemplate => componentTemplate.name == component.type);
      componentTemplate.optionsConfigurations.forEach(function(optionConfiguration){
        let options = component.options;
        if (optionConfiguration.option == 'position' || optionConfiguration.option == 'rotation') {
          options = component;
        }
        displayOptionsConfiguration(optionConfiguration, options);
      });
    }
    if (component.type == 'Pen') {
      self.penSpecialCaseSetup(component);
    }
  };

  // Select built in images
  this.selectImage = function(objectOptions) {
    let $body = $('<div class="selectImage"></div>');
    let $filter = $(
      '<div class="filter">Filter by Type: ' +
        '<select>' +
          '<option selected value="any">Any</option>' +
          '<option value="box">Box</option>' +
          '<option value="cylinder">Cylinder</option>' +
          '<option value="sphere">Sphere</option>' +
          '<option value="ground">Ground</option>' +
          '<option value="robot">Robot</option>' +
        '</select>' +
      '</div>'
    );
    let $select = $filter.find('select');
    let $imageList = $('<div class="images"></div>');

    BUILT_IN_IMAGES.forEach(function(image){
      let basename = image.url.split('/').pop();

      let $row = $('<div class="row"></div>');
      $row.addClass(image.type);

      let $descriptionBox = $('<div class="description"></div>');
      let $basename = $('<p class="bold"></p>').text(basename + ' (' + image.type + ')');
      let $description = $('<p></p>').text(image.description);
      $descriptionBox.append($basename);
      $descriptionBox.append($description);

      let $selectBox = $('<div class="select"><button>Select</button></div>');
      let $select = $selectBox.find('button');
      $select.prop('url', image.url);

      $select.click(function(e){
        objectOptions.imageURL = e.target.url;
        self.resetScene(false);
        $dialog.close();
      });

      $row.append($descriptionBox);
      $row.append($selectBox);
      $imageList.append($row);
    });

    $body.append($filter);
    $body.append($imageList);

    $select.change(function(){
      let filter = $select.val();

      $imageList.find('.row').removeClass('hide');
      if (filter != 'any') {
        $imageList.find(':not(.row.' + filter + ')').addClass('hide');
      }
    });

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>'
    );

    let $dialog = dialog('Select Built-In Image', $body, $buttons);

    $buttons.click(function() { $dialog.close(); });
  };

  // Special case for the pen, add some buttons to move it to useful locations
  this.penSpecialCaseSetup = function(component) {

    function moveTo(x,z) {
      let $posDiv = self.$settingsArea.find("div.configurationTitle:contains('position')")
      // Get the input boxes for x/y/z so value changes can be made visible
      let $inputX = $posDiv.next().find('input[type=text]');
      let $inputY = $posDiv.next().next().find('input[type=text]');
      let $inputZ = $posDiv.next().next().next().find('input[type=text]');
      // change only X and Z vals, Y is height from ground
      self.saveHistory();
      $inputX.val(x)
      component.position[0]=x
      $inputZ.val(z)
      component.position[2]=z
      self.resetScene(false);
    };

    let $centerWheelAxisBtn = $('<div class="btn_pen">Center On Wheel Axis</div>');
    $centerWheelAxisBtn.click(function(){
      // move the pen to the center of the wheel axis
      wheelAxisCenter = robot.leftWheel.mesh.position.add(robot.rightWheel.mesh.position).scale(1/2.0)
      moveTo(wheelAxisCenter.x, wheelAxisCenter.z)
    });
    let $centerWheelBtn = $('<div class="btn_pen">Center On Wheel</div>');
    let nextWheelCenter = 'L';
    $centerWheelBtn.click(function(){
      // move the pen to the center of a wheel.
      // Alternate between L and R wheels (and castor?)
      if (nextWheelCenter == 'L') {
        nextWheelCenter = 'R';
        wheelCenter = robot.leftWheel.mesh.position;
      } else {
        nextWheelCenter = 'L';
        wheelCenter = robot.rightWheel.mesh.position;
      }
      moveTo(wheelCenter.x, wheelCenter.z)
    });
    let $centerCSBtn = $('<div class="btn_pen">Center On Color Sensor</div>');
    let nextColorSensor = 0;
    $centerCSBtn.click(function(){
      // Move the pen to the center of the color sensor.  If there is more
      // than one color sensor, move to the next one
      var colorSensors = []
      for (c of robot.components) {
        if (c.type == "ColorSensor") {
          colorSensors.push(c);
        }
      }
      if (colorSensors.length <= 0) {
        return;
      }
      csPos = colorSensors[nextColorSensor].position
      nextColorSensor++;
      if (nextColorSensor >= colorSensors.length) {
        nextColorSensor = 0;
      }
      moveTo(csPos.x, csPos.z)
    });

    let $btndiv = $('<div class="buttons"></div>')
    $btndiv.append($centerWheelAxisBtn);
    $btndiv.append($centerWheelBtn);
    $btndiv.append($centerCSBtn);
    self.$settingsArea.append($btndiv)
  }

  // Setup picking ray
  this.setupPickingRay = function() {
    babylon.scene.onPointerUp = function(e, hit) {
      if (e.button != 0) {
        return;
      }

      if (hit.pickedMesh != null) {
        function getComponent(mesh) {
          if (typeof mesh.component != 'undefined') {
            return mesh.component;
          } else if (mesh.parent != null) {
            return getComponent(mesh.parent);
          } else {
            return null;
          }
        }

        let $components = self.$componentList.find('li');
        $components.removeClass('selected');

        let component = getComponent(hit.pickedMesh);
        let $target = self.$componentList.find('li[componentIndex=' + component.componentIndex + ']');
        $target.addClass('selected');
        self.showComponentOptions($target[0].component);

        self.highlightSelected();
      }
    }
  };

  // Reset scene
  this.resetScene = function(reloadComponents=true) {
    if (typeof self.cameraRadius == 'undefined') {
      self.cameraRadius = 40;
    } else {
      self.cameraRadius = babylon.scene.cameras[0].radius;
    }
    babylon.resetScene();
    babylon.scene.physicsEnabled = false;
    self.setupPickingRay();
    babylon.scene.cameras[0].radius = self.cameraRadius;
    if (reloadComponents) {
      self.$robotName.val(robot.options.name);
      self.loadIntoComponentsWindow(robot.options);
      self.showComponentOptions(robot.options);
    }
    self.highlightSelected();
  }

  // Add a new component to selected
  this.addComponent = function() {
    let $selected = self.getSelectedComponent();
    if (
      $selected.text() != 'Body'
      && $selected[0].component.type != 'ArmActuator'
      && $selected[0].component.type != 'SwivelActuator'
    ) {
      toastMsg('Components can only be added to Body, ArmActuators, and SwivelActuators.');
      return;
    }

    let $body = $('<div class="selectComponent"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><div class="text"></div></div>');

    self.componentTemplates.forEach(function(componentTemplate){
      let $component = $('<option></option>');
      $component.prop('value', componentTemplate.name);
      $component.text(componentTemplate.name);
      $select.append($component);
    });

    $body.append($select);
    $body.append($description);

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>' +
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog('Select Component', $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      self.saveHistory();
      let component = self.componentTemplates.find(componentTemplate => componentTemplate.name == $select.val())
      $selected[0].component.components.push(JSON.parse(JSON.stringify(component.defaultConfig)));
      self.resetScene();
      $dialog.close();
    });
  };

  // Delete selected component
  this.deleteComponent = function() {
    let $selected = self.getSelectedComponent();
    if ($selected.text() == 'Body') {
      toastMsg('Cannot delete main body');
      return;
    }

    self.saveHistory();
    let i = $selected[0].componentParent.indexOf($selected[0].component);
    $selected[0].componentParent.splice(i, 1);
    self.resetScene();
  };

  // Get selected component
  this.getSelectedComponent = function() {
    return self.$componentList.find('li.selected');
  };

  // Select list item on click
  this.componentSelect = function(e) {
    if (typeof e.target.component != 'undefined') {
      self.$componentList.find('li').removeClass('selected');
      e.target.classList.add('selected');
      e.stopPropagation();

      self.showComponentOptions(e.target.component);
      self.highlightSelected();
    }
  };

  // Highlight selected component
  this.highlightSelected = function() {
    let $selected = self.$componentList.find('li.selected');
    if ($selected.length < 1) {
      return;
    }

    let wireframe = babylon.scene.getMeshByID('wireframeComponentSelector');
    if (wireframe != null) {
      wireframe.dispose();
    }
    let index = $selected[0].componentIndex;
    if (typeof index != 'undefined') {
      let body = robot.getComponentByIndex(index).body;
      let size = body.getBoundingInfo().boundingBox.extendSize;
      let options = {
        height: size.y * 2,
        width: size.x * 2,
        depth: size.z * 2
      };
      let wireframeMat = babylon.scene.getMaterialByID('wireframeComponentSelector');
      if (wireframeMat == null) {
        wireframeMat = new BABYLON.StandardMaterial('wireframeComponentSelector', babylon.scene);
        wireframeMat.alpha = 0;
      }

      wireframe = BABYLON.MeshBuilder.CreateBox('wireframeComponentSelector', options, babylon.scene);
      wireframe.material = wireframeMat;
      wireframe.position = body.absolutePosition;
      wireframe.rotationQuaternion = body.absoluteRotationQuaternion;
      wireframe.enableEdgesRendering();
      wireframe.edgesWidth = 10;
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

  // Load robot into components window
  this.loadIntoComponentsWindow = function(options) {
    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let ACTUATORS = ['MagnetActuator', 'ArmActuator', 'SwivelActuator', 'PaintballLauncherActuator'];
    let DUMB_BLOCKS = ['Box', 'Cylinder', 'Sphere'];
    let motorCount = 2;
    let sensorCount = 0;
    let componentIndex = 0;

    let $ul = $('<ul></ul>');
    let $li = $('<li class="selected">Body</li>');
    $li[0].component = options;
    $ul.append($li);

    function addComponents(components) {
      let $list = $('<ul></ul>');
      components.forEach(function(component){
        let $item = $('<li></li>');
        $item.attr('componentIndex', componentIndex);
        let text = component.type;

        if (DUMB_BLOCKS.indexOf(text) != -1) {
          ;
        } else if (ACTUATORS.indexOf(text) != -1) {
          text += ' (out' + PORT_LETTERS[(++motorCount)] + ')';
        } else {
          text += ' (in' + (++sensorCount) + ')';
        }

        $item.text(text);
        $item[0].componentParent = components;
        $item[0].component = component;
        $item[0].componentIndex = componentIndex++;
        $list.append($item);

        if (component.components instanceof Array) {
          $list.append(addComponents(component.components));
        }
      });

      if ($list.children().length > 0) {
        return $('<li class="ulHolder"></li>').append($list);
      } else {
        return null;
      }
    }

    $ul.append(addComponents(options.components));

    $ul.find('li').click(self.componentSelect);

    self.$componentList.empty();
    self.$componentList.append($ul);
  };

  // Save robot to json file
  this.saveRobot = function() {
    if (robotTemplates.findIndex(r => r.name == robot.options.name) != -1) {
      robot.options.name = robot.options.name + ' (Custom)';
      self.$robotName.val(robot.options.name);
    }

    robot.options.shortDescription = robot.options.name;
    robot.options.longDescription = '<p>Custom robot created in the configurator.</p>';

    let wheelSpacing = Math.round((robot.options.bodyWidth + robot.options.wheelWidth + robot.options.wheelToBodyOffset * 2) * 10) / 10;
    let sensors = '';
    var i = 1;
    var sensor = null;
    while (sensor = robot.getComponentByPort('in' + i)) {
      if (sensor.type == 'ColorSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-color#</li>';
      } else if (sensor.type == 'UltrasonicSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-ultrasonic#</li>';
      } else if (sensor.type == 'GyroSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-gyro#</li>';
      } else if (sensor.type == 'GPSSensor') {
        sensors += '<li>#robot-port# ' + i + ' : GPS</li>';
      } else if (sensor.type == 'LaserRangeSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-laser#</li>';
      } else if (sensor.type == 'TouchSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-touch#</li>';
      } else if (sensor.type == 'Pen') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-pen#</li>';
      } else {
        console.log(sensor);
      }
      i++;
    }
    let ports =
      '<li>#robot-port# A : #robot-leftWheel#</li>' +
      '<li>#robot-port# B : #robot-rightWheel#</li>';
    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    i = 3;
    var motor = null;
    while (motor = robot.getComponentByPort('out' + PORT_LETTERS[i])) {
      if (motor.type == 'ArmActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-motorizedArm#</li>';
      } else if (motor.type == 'SwivelActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-swivel#</li>';
      } else if (motor.type == 'PaintballLauncherActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-paintball#</li>';
      } else if (motor.type == 'MagnetActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-electromagnet#</li>';
      }
      i++;
    }

    robot.options.longerDescription =
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: ' + robot.options.wheelDiameter + ' cm</li>' +
        '<li>#robot-wheelSpacing#: ' + wheelSpacing + ' cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' + ports + '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' + sensors +'</ul>';

    robot.options.thumbnail = '';
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(robot.options, null, 2));
    hiddenElement.target = '_blank';
    hiddenElement.download = robot.options.name + '.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // Load robot from json file
  this.loadRobotLocal = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        robot.options = JSON.parse(this.result);
        self.clearHistory();
        self.saveHistory();
        self.resetScene();
      };
      reader.readAsText(e.target.files[0]);
    });
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
      robot.options = JSON.parse(JSON.stringify(robotTemplates.find(robotTemplate => robotTemplate.name == $select.val())));
      self.clearHistory();
      self.saveHistory();
      self.resetScene();
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

  // Toggle filemenu
  this.toggleFileMenu = function(e) {
    if ($('.fileMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Select Robot', line: true, callback: self.selectRobot},
        {html: 'Load from file', line: false, callback: self.loadRobotLocal},
        {html: 'Save to file', line: true, callback: self.saveRobot},
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // Clicked on tab
  this.tabClicked = function(tabNav) {
  };
}

// Init class
configurator.init();
