var configurator = new function() {
  var self = this;

  this.componentTemplates = [
    {
      name: 'ColorSensor',
      shortDescription: 'Color Sensor',
      defaultConfig: {
        type: 'ColorSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          title: 'Position',
          type: 'vector3',
          min: '-20',
          max: '20',
          step: '1'
        },
        {
          option: 'rotation',
          title: 'Rotation',
          type: 'vector3',
          min: '-180',
          max: '180',
          step: '5'
        },
      ]
    }
  ];

  // Run on page load
  this.init = function() {
    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$fileMenu = $('.fileMenu');
    self.$robotName = $('#robotName');

    self.$addComponent = $('.addComponent');
    self.$deleteComponent = $('.deleteComponent');
    self.$componentList = $('.componentsList');
    self.$settingsWindow = $('.settingsWindow');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);

    self.$addComponent.click(self.addComponent);
    self.$deleteComponent.click(self.deleteComponent);

    window.addEventListener('beforeunload', self.checkUnsaved);

    self.resetScene();
  };

  // Show options
  this.showComponentOptions = function(component) {
    self.$settingsWindow.empty();

    function genVector3(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');

      function getTitle(opt) {
        let $title = $('<div class="configurationTitle"></div>');
        let $toolTip = $('<span> </span><div class="tooltip">?<div class="tooltiptext"></div></div>');
        $title.text(opt.title);
  
        if (opt.help) {
          $toolTip.find('.tooltiptext').text(opt.help);
          $title.append($toolTip);
        }
        if (opt.helpSide) {
          $toolTip.addClass(opt.helpSide);
        } else {
          $toolTip.addClass('right');
        }
  
        return $title;
      }  

      function sliderBox(opt, currentValue, callback) {
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
          callback($slider.val());
          $input.val($slider.val());
        });
        $input.change(function(){
          callback($slider.val());
          $slider.val($input.val());
        });

        return $sliderBox;
      }

      $div.append(getTitle(opt));
      currentOptions.forEach(function(currentOption, i){
        $div.append(
          sliderBox(opt, currentOption, function(val) {
            currentOptions[i] = val;
          })
        );  
      })

      return $div;
    }

    let componentTemplate = self.componentTemplates.find(componentTemplate => componentTemplate.name == component.type);
    componentTemplate.optionsConfigurations.forEach(function(option){
      if (option.type == 'vector3') {
        self.$settingsWindow.append(genVector3(option, component[option.option]));
      }
    });
  };

  // Reset scene
  this.resetScene = function() {
    babylon.resetScene();
    babylon.scene.physicsEnabled = false;
    babylon.scene.cameras[0].radius = 40;
    self.loadIntoComponentsWindow(robot.options);
  }

  // Add a new component to selected
  this.addComponent = function() {
    let $selected = self.getSelectedComponent();
    if (
      $selected.text() != 'Body'
      && $selected[0].component.type != 'ArmActuator'
      && $selected[0].component.type != 'SwivelActuator'
    ) {
      toastMsg('Cannot add to this component');
      return;
    }

    let $body = $('<div class="selectComponent"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><div class="text"></div></div>');

    function displayRobotDescriptions(component) {
      $description.find('.text').html(component.name);
    }

    self.componentTemplates.forEach(function(componentTemplate){
      let $component = $('<option></option>');
      $component.prop('value', componentTemplate.name);
      $component.text(componentTemplate.name);
      $select.append($component);
    });

    $body.append($select);
    $body.append($description);

    $select.change(function(){
      let componentTemplate = componentTemplates.find(componentTemplate => componentTemplate.name == $select.val());
      displayRobotDescriptions(componentTemplate);
    });

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>' +
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog('Select Component', $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      let component = self.componentTemplates.find(componentTemplate => componentTemplate.name == $select.val())
      $selected[0].component.components.push(component.defaultConfig);
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
    self.$componentList.find('li').removeClass('selected');
    e.target.classList.add('selected');
    e.stopPropagation();

    self.showComponentOptions(e.target.component);
  };

  // Load robot into components window
  this.loadIntoComponentsWindow = function(options) {
    let $ul = $('<ul><ul>');
    let $li = $('<li class="selected">Body</li>');
    $li[0].component = options;
    $ul.append($li);

    function addComponents(components) {
      let $list = $('<ul></ul>');
      components.forEach(function(component){
        let $item = $('<li></li>');
        $item.text(component.type);
        $item[0].componentParent = components;
        $item[0].component = component;
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
        {html: 'Load from file', line: false, callback: self.loadRobot},
        {html: 'Save to file', line: true, callback: self.saveRobot},
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // Check for unsaved changes
  this.checkUnsaved = function (event) {
    if (false) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  // Clicked on tab
  this.tabClicked = function(tabNav) {
  };
}

// Init class
configurator.init();
