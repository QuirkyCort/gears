var builder = new function() {
  var self = this;

  this.worldOptions = JSON.parse(JSON.stringify(worlds[0].options));

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
        type: 'strText',
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
        type: 'strText',
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
        type: 'strText',
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
        type: 'strText',
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
        sensors += '<li>#robot-port# ' + i + ' : ' + i18n.get('#robot-color#') + '</li>';
      } else if (sensor.type == 'UltrasonicSensor') {
        sensors += '<li>#robot-port# ' + i + ' : ' + i18n.get('#robot-ultrasonic#') + '</li>';
      } else if (sensor.type == 'GyroSensor') {
        sensors += '<li>#robot-port# ' + i + ' : ' + i18n.get('#robot-gyro#') + '</li>';
      } else if (sensor.type == 'GPSSensor') {
        sensors += '<li>#robot-port# ' + i + ' : GPS</li>';
      } else if (sensor.type == 'LaserRangeSensor') {
        sensors += '<li>#robot-port# ' + i + ' : ' + i18n.get('#robot-laser#') + '</li>';
      } else if (sensor.type == 'TouchSensor') {
        sensors += '<li>#robot-port# ' + i + ' : ' + i18n.get('#robot-touch#') + '</li>';
      } else if (sensor.type == 'Pen') {
        sensors += '<li>#robot-port# ' + i + ' : ' + i18n.get('#robot-pen#') + '</li>';
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
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : ' + i18n.get('#robot-motorizedArm#') + '</li>';
      } else if (motor.type == 'SwivelActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : ' + i18n.get('#robot-swivel#') + '</li>';
      } else if (motor.type == 'PaintballLauncherActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : ' + i18n.get('#robot-paintball#') + '</li>';
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
  this.loadRobot = function() {
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
