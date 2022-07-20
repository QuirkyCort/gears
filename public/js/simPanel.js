var simPanel = new function() {
  var self = this;

  this.sensors = [];

  self.rulerState = 0;
  self.pickedPoints = [null, null];
  self.touchDevice = false;
  self.drag = false;
  self.showFPS = false;

  // Run on page load
  this.init = function() {
    self.$console = $('.console');
    self.$consoleBtn = $('.console .chevron');
    self.$consoleContent = $('.console .content');
    self.$consoleClear = $('.console .clear');
    self.$runSim = $('.runSim');
    self.$world = $('.world');
    self.$reset = $('.reset');
    self.$cameraSelector = $('.cameraSelector');
    self.$camera = $('.camera');
    self.$cameraOptions = $('.cameraOptions');
    self.$sensors = $('.sensors');
    self.$ruler = $('.ruler');
    self.$joystick = $('.joystick');
    self.$joystickIcon = $('.joystick > .icon');
    self.$virtualJoystick = $('.icon-virtualJoystick');
    self.$virtualJoystickIndicator = $('.icon-virtualJoystickIndicator');
    self.$hubButtons = $('.hubButtons');
    self.$hubButtonsIcon = $('.hubButtons > .icon');
    self.$keyboard = $('.keyboard');
    self.$fps = $('.fps');

    setOnClickAnimation([self.$runSim, self.$world, self.$reset, self.$camera, self.$ruler, self.$sensors, self.$joystickIcon, self.$hubButtonsIcon]);

    self.$sensorsPanel = $('.sensorReadings');
    self.$worldInfoPanel = $('.worldInfo');

    self.$consoleBtn.click(self.toggleConsole);
    self.$console.on('transitionend', self.scrollConsoleToBottom);
    self.$consoleClear.click(self.clearConsole);
    self.$runSim.click(self.runSim);
    self.$world.click(self.selectWorld);
    self.$reset.click(function() {
      if (babylon.cameraMode == 'follow') {
        self.resetSim().then(function(){
          babylon.resetCamera();
        });
      } else {
        self.resetSim();
      }
    });
    self.$camera.click(self.toggleCameraSelector);
    self.$cameraOptions.click(self.switchCamera);
    self.$sensors.click(self.toggleSensorsPanel);

    if (self.$hubButtons.length > 0) {
      self.$hubButtonsIcon.click(self.toggleHubButtons);
      self.setupHubButtons();
    }

    if (self.$virtualJoystick.length > 0) {
      self.$joystickIcon.click(self.toggleJoystick);
      self.$keyboard.click(self.keyboardHelp);
      self.setupJoystick();
      self.setupJoystickKeyControls();
    }

    self.$ruler[0].addEventListener('pointerup', function(e){
      if (e.pointerType == 'touch') {
        self.touchDevice = true;
      } else {
        self.touchDevice = false;
        babylon.marker1.isVisible = true;
      }
      self.toggleRuler();
      e.preventDefault();
      e.stopPropagation();
    });
    window.addEventListener('pointerdown', function(){
      self.drag = false;
    });
    window.addEventListener('pointermove', function(){
      self.drag = true;
    });
    window.addEventListener('pointerup', function(e){
      if (self.drag == false) {
        self.recordMeasurements();
      }
    });
    setInterval(self.displayMeasurements, 50);

    self.updateSensorsPanelTimer = setInterval(self.updateSensorsPanel, 250);
  };

  // Run when the simPanel in inactive
  this.onInActive = function() {
    if (! skulpt.running) {
      babylon.engine.stopRenderLoop();
    }
  };

  // Run when the simPanel in active
  this.onActive = function() {
    if (babylon.engine._activeRenderLoops.length == 0)
    babylon.engine.runRenderLoop(function(){
      babylon.scene.render();
    });
  };

  // Setup virtual joystick
  this.setupJoystick = function() {
    function moveSteering(steering, speed) {
      if (typeof babylon.world.manualMoved == 'function') {
        babylon.world.manualMoved();
      }

      if (steering > 1) {
        steering = 1;
      } else if (steering < -1) {
        steering = -1;
      }
      if (speed > 1) {
        speed = 1;
      } else if (speed < -1) {
        speed = -1;
      }

      if (steering > 0) {
        robot.leftWheel.speed_sp = speed * 1000;
        robot.rightWheel.speed_sp = speed * 1000 * (1 - steering * 2);
        robot.leftWheel.runForever();
        robot.rightWheel.runForever();
      } else {
        robot.leftWheel.speed_sp = speed * 1000 * (1 + steering * 2)
        robot.rightWheel.speed_sp = speed * 1000;
        robot.leftWheel.runForever();
        robot.rightWheel.runForever();
      }
    }
    function stop() {
      robot.leftWheel.speed_sp = 0;
      robot.rightWheel.speed_sp = 0;
      robot.leftWheel.stop();
      robot.rightWheel.stop();
    }

    self.$virtualJoystick[0].addEventListener('pointermove', function(e){
      if (e.buttons & 1) {
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        self.$virtualJoystickIndicator[0].style.left = (x - 75) + 'px';
        self.$virtualJoystickIndicator[0].style.top = (y - 75) + 'px';
        y = (75 - y) / 75;
        x = (x - 75) / 75;

        let steering = 1 - 2 * Math.abs(Math.atan2(y, x) / Math.PI);
        let speed = Math.sqrt(y**2 + x**2);
        if (y < 0) {
          speed = -speed;
          steering = -steering;
        }

        moveSteering(steering, speed);
      }
    });

    function resetJoystick(e) {
      self.$virtualJoystickIndicator[0].style.left = '0px';
      self.$virtualJoystickIndicator[0].style.top = '0px';
      stop();
    }
    self.$virtualJoystick[0].addEventListener('pointerup', resetJoystick);
    self.$virtualJoystick[0].addEventListener('pointerleave', resetJoystick);
  };

  // Key controls for joystick
  this.setupJoystickKeyControls = function() {
    let left, right, up, down;

    function moveTank(leftWheel, rightWheel) {
      if (typeof babylon.world.manualMoved == 'function') {
        babylon.world.manualMoved();
      }

      robot.leftWheel.speed_sp = leftWheel;
      robot.rightWheel.speed_sp = rightWheel;
      if (leftWheel == 0) {
        robot.leftWheel.stop();
      } else {
        robot.leftWheel.runForever();
      }
      if (rightWheel == 0) {
        robot.rightWheel.stop();
      } else {
        robot.rightWheel.runForever();
      }
    }

    function drive() {
      let l, r;
      let SPEED = 200;

      if (up) {
        l = SPEED;
        r = SPEED;
        if (left) {
          l = 0;
        } else if (right) {
          r = 0;
        }
      } else if (down) {
        l = -SPEED;
        r = -SPEED;
        if (left) {
          r = 0;
        } else if (right) {
          l = 0;
        }
      } else if (left) {
        l = -SPEED / 2;
        r = SPEED / 2;
      } else if (right) {
        l = SPEED / 2;
        r = -SPEED / 2;
      }

      moveTank(l, r);
    }

    self.$joystick[0].addEventListener('keydown', event => {
      if (event.isComposing) {
        return;
      }
      if (self.$joystick.hasClass('closed')) {
        return;
      }

      if (event.key == 'ArrowLeft') {
        left = true;
      } else if (event.key == 'ArrowUp') {
        up = true;
      } else if (event.key == 'ArrowRight') {
        right = true;
      } else if (event.key == 'ArrowDown') {
        down = true;
      }
      drive();

      event.preventDefault();
    });

    self.$joystick[0].addEventListener('keyup', event => {
      if (event.isComposing) {
        return;
      }
      if (self.$joystick.hasClass('closed')) {
        return;
      }
      if (event.key == 'ArrowLeft') {
        left = false;
      } else if (event.key == 'ArrowUp') {
        up = false;
      } else if (event.key == 'ArrowRight') {
        right = false;
      } else if (event.key == 'ArrowDown') {
        down = false;
      }
      drive();
    });

    self.$joystick[0].addEventListener('focusout', event => {
      left = false;
      right = false;
      up = false;
      down = false;
      drive();
    });
  };

  // Help message for keyboard controls
  self.keyboardHelp = function() {
    let options = {
      title: 'Keyboard Controls',
      message:
        '<p>' +
        'Use the arrow keys to manually drive the robot. ' +
        'The virtual joystick window must be opened and selected (...click on it) for keyboard controls to work. ' +
        '</p>'
    }
    acknowledgeDialog(options);
  };

  // Toggle virtual joystick
  this.toggleJoystick = function() {
    self.$joystick.toggleClass('closed');
  };

  // Setup hub buttons
  this.setupHubButtons = function() {
    let backspace = 'backspace';
    let up = 'up';
    let down = 'down';
    let left = 'left';
    let right = 'right';
    let enter = 'enter';

    let buttons = {};
    buttons[backspace] = $('.hubButtons .icon-buttonsBackspace');
    buttons[up] = $('.hubButtons .icon-buttonsUp');
    buttons[down] = $('.hubButtons .icon-buttonsDown');
    buttons[left] = $('.hubButtons .icon-buttonsLeft');
    buttons[right] = $('.hubButtons .icon-buttonsRight');
    buttons[enter] = $('.hubButtons .icon-buttonsEnter');

    function setBtn(key, state) {
      return function(evt) {
        if (state) {
          evt.target.classList.add('pressed');
        } else {
          evt.target.classList.remove('pressed');
        }
        robot.setHubButton(key, state);
      }
    }

    for (let btn in buttons) {
      buttons[btn][0].addEventListener('pointerdown', setBtn(btn, true));
      buttons[btn][0].addEventListener('pointerup', setBtn(btn, false));
      buttons[btn][0].addEventListener('pointerout', setBtn(btn, false));
    }
  };

  // Toggle hub buttons
  this.toggleHubButtons = function() {
    self.$hubButtons.toggleClass('closed');
  };

  // toggle ruler
  this.toggleRuler = function() {
    if (self.$ruler.hasClass('closed')) {
      self.$ruler.removeClass('closed');
      self.rulerState = 1;
    } else {
      self.$ruler.addClass('closed');
      babylon.marker1.isVisible = false;
      babylon.marker2.isVisible = false;
      self.rulerState = 0;
    }
  };

  // display ruler measurements
  this.displayMeasurements = function(point) {
    if (self.rulerState == 0 || self.rulerState == 3) {
      return;
    }

    if (typeof point == 'undefined') {
      if (self.touchDevice) {
        return;
      }
      point = babylon.scene.pick(babylon.scene.pointerX, babylon.scene.pointerY);
    }
    if (!point.pickedPoint) {
      return;
    }

    if (self.touchDevice == false) {
      if (self.rulerState == 1) {
        babylon.marker1.position.x = point.pickedPoint.x;
        babylon.marker1.position.y = point.pickedPoint.y + 2;
        babylon.marker1.position.z = point.pickedPoint.z;
      } else if (self.rulerState == 2) {
        babylon.marker2.position.x = point.pickedPoint.x;
        babylon.marker2.position.y = point.pickedPoint.y + 2;
        babylon.marker2.position.z = point.pickedPoint.z;
      }
    }

    let prevPoint = null;
    if (self.rulerState == 1) {
      prevPoint = robot.body.absolutePosition;
    } else if (self.rulerState == 2) {
      prevPoint = self.pickedPoints[0];
    }

    let x = Math.round(point.pickedPoint.x * 10) / 10;
    let y = Math.round(point.pickedPoint.y * 10) / 10;
    let z = Math.round(point.pickedPoint.z * 10) / 10;
    let dist = Math.round(point.pickedPoint.subtract(prevPoint).length() * 10) / 10;
    let dx = point.pickedPoint.x - prevPoint.x;
    let dy = point.pickedPoint.z - prevPoint.z;
    let angle = Math.atan(dx / dy);
    if (dy < 0) {
      if (dx < 0) {
        angle = angle - Math.PI;
      } else {
        angle = Math.PI + angle;
      }
    }
    angle = Math.round(angle / Math.PI * 180 * 10) / 10;

    self.$ruler.find('.x').text('X: ' + x + ' cm');
    self.$ruler.find('.y').text('Y: ' + z + ' cm');
    self.$ruler.find('.alt').text(i18n.get('#sim-alt#') + ': ' + y + ' cm');
    self.$ruler.find('.dist').text(i18n.get('#sim-distance#') + ': ' + dist + ' cm');
    self.$ruler.find('.angle').text(i18n.get('#sim-angle#') + ': ' + angle + '°');
  };

  // Record ruler measurements
  this.recordMeasurements = function() {
    if (self.rulerState == 0) {
      return;
    }

    if (self.rulerState == 1) {
      let point = babylon.scene.pick(babylon.scene.pointerX, babylon.scene.pointerY);
      if (point.pickedPoint) {
        babylon.marker1.position.x = point.pickedPoint.x;
        babylon.marker1.position.y = point.pickedPoint.y + 2;
        babylon.marker1.position.z = point.pickedPoint.z;
        babylon.marker1.isVisible = true;

        if (self.touchDevice) {
          self.displayMeasurements(point);
        } else {
          babylon.marker2.position.x = point.pickedPoint.x;
          babylon.marker2.position.y = point.pickedPoint.y + 2;
          babylon.marker2.position.z = point.pickedPoint.z;
          babylon.marker2.isVisible = true;
        }
        self.rulerState = 2;
        self.pickedPoints[0] = point.pickedPoint;
      }
    } else if (self.rulerState == 2) {
      let point = babylon.scene.pick(babylon.scene.pointerX, babylon.scene.pointerY);
      if (point.pickedPoint) {
        babylon.marker2.position.x = point.pickedPoint.x;
        babylon.marker2.position.y = point.pickedPoint.y + 2;
        babylon.marker2.position.z = point.pickedPoint.z;
        babylon.marker2.isVisible = true;

        self.displayMeasurements(point);
        self.rulerState = 3;
        self.pickedPoints[1] = point.pickedPoint;
      }
    } else if (self.rulerState == 3) {
      self.rulerState = 2;
      self.pickedPoints[0] = self.pickedPoints[1];
      babylon.marker1.position.x = self.pickedPoints[0].x;
      babylon.marker1.position.y = self.pickedPoints[0].y + 2;
      babylon.marker1.position.z = self.pickedPoints[0].z;
      if (self.touchDevice) {
        babylon.marker2.isVisible = false;
      }
    }
  };

  // clear world info
  this.clearWorldInfoPanel = function() {
    self.$worldInfoPanel.empty();
  };

  // draw world info
  this.drawWorldInfo = function(html) {
    self.$worldInfoPanel.append(html);
  };

  // show world info
  this.showWorldInfoPanel = function() {
    self.$worldInfoPanel.removeClass('hide');
  };

  // hide world info
  this.hideWorldInfoPanel = function() {
    self.$worldInfoPanel.addClass('hide');
  };

  // init sensor panel
  this.initSensorsPanel = function() {
    function genDiv(sensorType, values) {
      let $div = $(
        '<div class="sensorReading">' +
          '<div class="sensorType"></div>' +
          '<table class="sensorValues"></table>' +
        '</div>'
      );

      $div.find('.sensorType').text(sensorType);
      let $table = $div.find('.sensorValues');
      valuesElements = [];
      values.forEach(function(value) {
        let $line = $('<tr><td class="sensorValueName">' + value + '</td><td class="sensorValue">-</td></tr>');
        valuesElements.push($line.find('.sensorValue'));
        $table.append($line);
      });

      return [$div, valuesElements];
    }

    var i = 1;
    var sensor = null;
    self.$sensorsPanel.empty();
    self.sensors = [];
    while (sensor = robot.getComponentByPort('in' + i)) {
      let tmp = null;
      if (sensor.type == 'ColorSensor') {
        tmp = genDiv(
          sensor.port + ': ' + i18n.get('#sim-color_sensor#'),
          [i18n.get('#sim-color#'), i18n.get('#sim-red#'), i18n.get('#sim-green#'), i18n.get('#sim-blue#'), i18n.get('#sim-intensity#')]
        );
      } else if (sensor.type == 'UltrasonicSensor') {
        tmp = genDiv(
          sensor.port + ': ' + i18n.get('#sim-ultrasonic#'),
          [i18n.get('#sim-distance#') + ' (cm)']
        );
      } else if (sensor.type == 'GyroSensor') {
        tmp = genDiv(
          sensor.port + ': ' + i18n.get('#sim-gyro#'),
          [i18n.get('#sim-angle#')]
        );
      } else if (sensor.type == 'GPSSensor') {
        tmp = genDiv(
          sensor.port + ': ' + i18n.get('#sim-gps#'),
          ['X (cm)', 'Y (cm)', i18n.get('#sim-altitude#')]
        );
      } else if (sensor.type == 'LaserRangeSensor') {
        tmp = genDiv(
          sensor.port + ': ' + i18n.get('#sim-laser#'),
          [i18n.get('#sim-distance#') + ' (cm)']
        );
      } else if (sensor.type == 'TouchSensor') {
        tmp = genDiv(
          sensor.port + ': ' + i18n.get('#sim-touch#'),
          [i18n.get('#sim-is_pressed#')]
        );
      } else if (sensor.type == 'Pen') {
        tmp = genDiv(
          sensor.port + ': ' + i18n.get('#sim-pen#'),
          []
        );
      } else {
        console.log(sensor);
      }

      if (tmp) {
        self.$sensorsPanel.append(tmp[0]);
        self.sensors.push([sensor, tmp[1]]);
      }
      i++;
    }

    if (robot.processedOptions.wheels) {
      let tmp = genDiv(
        'outA: ' + i18n.get('#sim-left_motor#'),
        [i18n.get('#sim-position#')]
      );
      self.$sensorsPanel.append(tmp[0]);
      self.sensors.push([robot.leftWheel, tmp[1]]);
      tmp = genDiv(
        'outB: ' + i18n.get('#sim-right_motor#'),
        [i18n.get('#sim-position#')]
      );
      self.$sensorsPanel.append(tmp[0]);
      self.sensors.push([robot.rightWheel, tmp[1]]);
    }

    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    i = robot.processedOptions.wheels ? 3 : 1;
    var motor = null;
    while (motor = robot.getComponentByPort('out' + PORT_LETTERS[i])) {
      if (motor.type == 'ArmActuator') {
        tmp = genDiv(
          motor.port + ': ' + i18n.get('#sim-arm#'),
          [i18n.get('#sim-position#')]
          );
      } else if (motor.type == 'SwivelActuator') {
        tmp = genDiv(
          motor.port + ': ' + i18n.get('#sim-swivel#'),
          [i18n.get('#sim-position#')]
          );
      } else if (motor.type == 'LinearActuator') {
        tmp = genDiv(
          motor.port + ': ' + i18n.get('#sim-linear#'),
          [i18n.get('#sim-position#')]
          );
      } else if (motor.type == 'PaintballLauncherActuator') {
        tmp = genDiv(
          motor.port + ': ' + i18n.get('#sim-paintball#'),
          [i18n.get('#sim-position#')]
          );
      } else if (motor.type == 'MagnetActuator') {
        tmp = genDiv(
          motor.port + ': ' + i18n.get('#sim-magnet#'),
          [i18n.get('#sim-magnet_power#')]
          );
      } else if (motor.type == 'WheelActuator') {
        tmp = genDiv(
          motor.port + ': ' + i18n.get('#sim-wheel#'),
          [i18n.get('#sim-position#')]
          );
        }

      if (tmp) {
        self.$sensorsPanel.append(tmp[0]);
        self.sensors.push([motor, tmp[1]]);
      }
      i++;
    }
  };

  // update sensor panel
  this.updateSensorsPanel = function() {
    if (self.$sensorsPanel.hasClass('hide')) {
      return;
    }

    self.sensors.forEach(function(sensor) {
      if (sensor[0].type == 'ColorSensor') {
        let rgb = sensor[0].getRGB();
        let hsv = Colors.toHSV(rgb);
        let color = Colors.toColor(hsv);
        let colorName = Colors.toColorName(color);
        sensor[1][0].text(color + ' : ' + colorName);
        sensor[1][1].text(Math.round(rgb[0]));
        sensor[1][2].text(Math.round(rgb[1]));
        sensor[1][3].text(Math.round(rgb[2]));
        sensor[1][4].text(Math.round(rgb[0] / 2.55));
      } else if (sensor[0].type == 'UltrasonicSensor') {
        sensor[1][0].text(Math.round(sensor[0].getDistance() * 10) / 10);
      } else if (sensor[0].type == 'GyroSensor') {
        sensor[1][0].text(Math.round(sensor[0].getYawAngle()));
      } else if (sensor[0].type == 'GPSSensor') {
        let position = sensor[0].getPosition();
        sensor[1][0].text(Math.round(position[0] * 10) / 10);
        sensor[1][1].text(Math.round(position[2] * 10) / 10);
        sensor[1][2].text(Math.round(position[1] * 10) / 10);
      } else if (sensor[0].type == 'WheelActuator') {
        sensor[1][0].text(Math.round(sensor[0].position));
      } else if (sensor[0].type == 'ArmActuator') {
        sensor[1][0].text(Math.round(sensor[0].position));
      } else if (sensor[0].type == 'LaserRangeSensor') {
        sensor[1][0].text(Math.round(sensor[0].getDistance() * 10) / 10);
      } else if (sensor[0].type == 'TouchSensor') {
        sensor[1][0].text(sensor[0].isPressed());
      } else if (sensor[0].type == 'SwivelActuator') {
        sensor[1][0].text(Math.round(sensor[0].position));
      } else if (sensor[0].type == 'LinearActuator') {
        sensor[1][0].text(Math.round(sensor[0].position));
      } else if (sensor[0].type == 'PaintballLauncherActuator') {
        sensor[1][0].text(Math.round(sensor[0].position));
      } else if (sensor[0].type == 'MagnetActuator') {
        sensor[1][0].text(Math.round(sensor[0].power * 100 / sensor[0].options.maxPower));
      }
    });
  };

  // toggle sensors panel
  this.toggleSensorsPanel = function() {
    if (self.sensors.length == 0) {
      self.initSensorsPanel();
    }
    self.$sensorsPanel.toggleClass('hide');
  };

  // switch camera
  this.switchCamera = function(e) {
    if (e.currentTarget.classList.contains('cameraArc')) {
      babylon.setCameraMode('arc');
      self.$camera.html('<span class="icon-cameraArc"></span>');

    } else if (e.currentTarget.classList.contains('cameraFollow')) {
      babylon.setCameraMode('follow');
      self.$camera.html('<span class="icon-cameraFollow"></span>');

    } else if (e.currentTarget.classList.contains('cameraTop')) {
      babylon.setCameraMode('orthoTop');
      self.$camera.html('<span class="icon-cameraTop"></span>');

    } else if (e.currentTarget.classList.contains('resetCamera')) {
      babylon.resetCamera();
      babylon.setCameraMode('follow');
      self.$camera.html('<span class="icon-cameraFollow"></span>');
    }

    self.$cameraSelector.addClass('closed');
  };

  // Toggle camera selector
  this.toggleCameraSelector = function() {
    let current = self.$camera.children()[0].className.replace('icon-', '');
    self.$cameraSelector.children().removeClass('hide');
    self.$cameraSelector.find('.' + current).addClass('hide');
    self.$cameraSelector.toggleClass('closed');
  };

  // Select world map
  this.selectWorld = function() {
    let $body = $('<div class="selectWorld"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><img class="thumbnail" width="200" height="200"><div class="text"></div></div>');
    let $configurations = $('<div class="configurations"></div>');

    let worldOptionsSetting = {};

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

    function genSelect(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $select = $('<select></select>');
      let currentVal = currentOptions[opt.option];
      worldOptionsSetting[opt.option] = currentVal;

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
        worldOptionsSetting[opt.option] = $select.val();
      });

      $div.append(getTitle(opt));
      $div.append($select);

      return $div;
    }

    function genSelectWithHTML(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $select = $('<select></select>');
      let $html = $('<div></div>');
      let currentVal = currentOptions[opt.option];
      worldOptionsSetting[opt.option] = currentVal;

      opt.options.forEach(function(option){
        let $opt = $('<option></option>');
        $opt.prop('value', option[1]);
        $opt.text(option[0]);
        if (option[1] == currentVal) {
          $opt.attr('selected', true);
          $html.html(opt.optionsHTML[currentVal]);
        }

        $select.append($opt);
      });

      $select.change(function(){
        worldOptionsSetting[opt.option] = $select.val();
        $html.html(opt.optionsHTML[$select.val()]);
      });

      $div.append(getTitle(opt));
      $div.append($select);
      $div.append($html);

      return $div;
    }

    function genCheckBox(opt, currentOptions) {
      let id = Math.random().toString(36).substring(2, 6);
      let $div = $('<div class="configuration"></div>');
      let $checkbox = $('<input type="checkbox" id="' + id + '">');
      let $label = $('<label for="' + id + '"></label>');
      let currentVal = currentOptions[opt.option];

      $label.text(opt.label);

      if (currentVal) {
        $checkbox.prop('checked', true);
        worldOptionsSetting[opt.option] = true;
      } else {
        worldOptionsSetting[opt.option] = false;
      }
      $checkbox.change(function(){
        worldOptionsSetting[opt.option] = $checkbox.prop('checked');
      });

      $div.append(getTitle(opt));
      $div.append($checkbox);
      $div.append($label);

      return $div;
    }

    function genSlider(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $sliderBox = $(
        '<div class="slider">' +
          '<input type="range">' +
          '<input type="text">' +
        '</div>'
      );
      let $slider = $sliderBox.find('input[type=range]');
      let $input = $sliderBox.find('input[type=text]');
      let currentVal = currentOptions[opt.option];
      worldOptionsSetting[opt.option] = currentVal;

      $slider.attr('min', opt.min);
      $slider.attr('max', opt.max);
      $slider.attr('step', opt.step);
      $slider.attr('value', currentVal);
      $input.val(currentVal);

      $slider.on('input', function(){
        worldOptionsSetting[opt.option] = parseInt($slider.val());
        $input.val($slider.val());
      });
      $input.change(function(){
        worldOptionsSetting[opt.option] = parseInt($input.val());
        $slider.val($input.val());
      });

      $div.append(getTitle(opt));
      $div.append($sliderBox);

      return $div;
    }

    function genText(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];
      worldOptionsSetting[opt.option] = currentVal;

      $input.val(currentVal);

      $input.change(function(){
        worldOptionsSetting[opt.option] = $input.val();
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genInt(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];
      worldOptionsSetting[opt.option] = currentVal;

      $input.val(currentVal);

      $input.change(function(){
        if (isNaN($input.val())) {
          worldOptionsSetting[opt.option] = $input.val();
        } else {
          worldOptionsSetting[opt.option] = parseInt($input.val());
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genFloat(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];
      worldOptionsSetting[opt.option] = currentVal;

      $input.val(currentVal);

      $input.change(function(){
        if (isNaN($input.val())) {
          worldOptionsSetting[opt.option] = $input.val();
        } else {
          worldOptionsSetting[opt.option] = parseFloat($input.val());
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genFile(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $file = $('<input type="file">');
      $file.attr('accept', opt.accept);

      $file.change(function(){
        if (this.files.length) {
          worldOptionsSetting[opt.option] = URL.createObjectURL(this.files[0]);
        }
      });

      $div.append(getTitle(opt));
      $div.append($file);

      return $div;
    }

    function displayWorldOptions(world, worldOptions) {
      $description.find('.text').html(world.longDescription);
      if (world.thumbnail) {
        $description.find('.thumbnail').attr('src', world.thumbnail);
      } else {
        $description.find('.thumbnail').attr('src', 'images/worlds/default_thumbnail.png');
      }

      $configurations.empty();
      worldOptionsSetting = {};
      for (let optionConfiguration of world.optionsConfigurations) {
        if (optionConfiguration.type == 'select') {
          $configurations.append(genSelect(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'selectWithHTML') {
          $configurations.append(genSelectWithHTML(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'checkbox') {
          $configurations.append(genCheckBox(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'slider') {
          $configurations.append(genSlider(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'text') {
          $configurations.append(genText(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'int') {
          $configurations.append(genInt(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'float') {
          $configurations.append(genFloat(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'file') {
          $configurations.append(genFile(optionConfiguration, worldOptions));
        } else if (optionConfiguration.type == 'set') {
          worldOptionsSetting[optionConfiguration.option] = optionConfiguration.value;
        }
      }
    }

    worlds.forEach(function(world){
      let $world = $('<option></option>');
      $world.prop('value', world.name);
      $world.text(world.shortDescription);
      if (world.name == babylon.world.name) {
        $world.attr('selected', 'selected');
        displayWorldOptions(world, world.options);
      }
      $select.append($world);
    });

    $body.append($select);
    $body.append($description);
    $body.append($configurations);

    $select.change(function(){
      let world = worlds.find(world => world.name == $select.val());
      displayWorldOptions(world, world.options);
    });

    let $buttons = $(
      '<button type="button" class="save btn-light">' + i18n.get('#sim-save#') + '</button>' +
      '<button type="button" class="load push-left btn-light">' + i18n.get('#sim-load#') + '</button>' +
      '<button type="button" class="default btn-light">' + i18n.get('#sim-default#') + '</button>' +
      '<button type="button" class="cancel btn-light">' + i18n.get('#sim-cancel#') + '</button>' +
      '<button type="button" class="confirm btn-success">' + i18n.get('#sim-ok#') + '</button>'
    );

    let $dialog = dialog(i18n.get('#sim-select_world#'), $body, $buttons);

    $buttons.siblings('.save').click(function() {
      let world = worlds.find(world => world.name == $select.val());
      let saveObj = {
        worldName: $select.val(),
        options: {}
      }
      Object.assign(saveObj.options, world.defaultOptions);
      Object.assign(saveObj.options, worldOptionsSetting);

      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(saveObj, null, 2));
      hiddenElement.target = '_blank';
      hiddenElement.download = $select.val() + 'Map_config.json';
      hiddenElement.dispatchEvent(new MouseEvent('click'));
    });
    $buttons.siblings('.load').click(function() {
      var hiddenElement = document.createElement('input');
      hiddenElement.type = 'file';
      hiddenElement.accept = 'application/json,.json';
      hiddenElement.dispatchEvent(new MouseEvent('click'));
      hiddenElement.addEventListener('change', function(e){
        var reader = new FileReader();
        reader.onload = function() {
          let loadedSave = JSON.parse(this.result);
          let world = worlds.find(world => world.name == loadedSave.worldName);

          if (typeof world == 'undefined') {
            toastMsg(i18n.get('#sim-invalid_map#'));
            return;
          }

          $select.val(loadedSave.worldName);
          displayWorldOptions(world, loadedSave.options);
          worldOptionsSetting = loadedSave.options;
        };
        reader.readAsText(e.target.files[0]);
      });
    });
    $buttons.siblings('.default').click(function() {
      let world = worlds.find(world => world.name == $select.val());
      world.options = {};
      Object.assign(world.options, world.defaultOptions);
      displayWorldOptions(world, world.options);
      // displayWorldOptions(world, world.defaultOptions);
    });
    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      babylon.world = worlds.find(world => world.name == $select.val());
      self.worldOptionsSetting = worldOptionsSetting;
      self.resetSim().then(function(){
        babylon.resetCamera();
        babylon.setCameraMode('follow');
        self.$camera.html('<span class="icon-cameraFollow"></span>');
      });
      $dialog.close();
    });
  };

  // Load world
  this.loadWorld = function(json) {
    try {
      let loadedSave = JSON.parse(json);

      // Is it a world file?
      if (typeof loadedSave.bodyHeight != 'undefined') {
        showErrorModal(i18n.get('#sim-invalid_world_file_robot#'));
        return;
      }

      // Is it a world file?
      let world = worlds.find(world => world.name == loadedSave.worldName);
      if (typeof world == 'undefined') {
        showErrorModal(i18n.get('#sim-invalid_map#'));
        return;
      }

      babylon.world = worlds.find(world => world.name == loadedSave.worldName);
      self.worldOptionsSetting = loadedSave.options;
      if (typeof babylon.world.setOptions == 'function') {
        babylon.world.setOptions(self.worldOptionsSetting);
      }
      self.resetSim().then(function(){
        babylon.resetCamera();
        babylon.setCameraMode('follow');
        self.$camera.html('<span class="icon-cameraFollow"></span>');
      });
    } catch (e) {
      showErrorModal(i18n.get('#sim-invalid_world_file_json#'));
    }
  };

  // Load from local file
  this.loadWorldLocal = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        self.loadWorld(this.result);
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // Load from URL
  this.loadWorldURL = function(url) {
    return fetch(url)
      .then(function(response) {
        if (response.ok) {
          return response.text();
        } else {
          toastMsg(i18n.get('#sim-not_found#'));
          return Promise.reject(new Error('invalid_map'));
        }
      })
      .then(function(response) {
        self.loadWorld(response);
      });
  };

  // Save to file
  this.saveWorld = function() {
    let world = babylon.world;
    let saveObj = {
      worldName: world.name,
      options: world.options
    }

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(saveObj, null, 2));
    hiddenElement.target = '_blank';
    hiddenElement.download = world.name + 'Map_config.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // Stop the simulator
  this.stopSim = function(stopRobot) {
    if (typeof stopRobot == 'undefined') {
      let stopRobot = false;
    }

    skulpt.hardInterrupt = true;
    self.setRunIcon('run');

    if (typeof babylon.world.stopSim == 'function') {
      babylon.world.stopSim();
    }


    if (stopRobot) {
      function repeatedReset(count) {
        if (count > 0) {
          robot.reset();
          setTimeout(function() { repeatedReset(count - 1) }, 100);
        }
      }
      repeatedReset(15);
    }
  };

  // Run the simulator
  this.runSim = function() {
    if (skulpt.running) {
      self.stopSim();
    } else {
      if (! pythonPanel.modified) {
        pythonPanel.loadPythonFromBlockly();
      }
      robot.reset();
      skulpt.runPython(pythonPanel.editor.getValue());
      self.setRunIcon('stop');
      if (typeof babylon.world.startSim == 'function') {
        babylon.world.startSim();
      }
    }
  };

  // Set run icon
  this.setRunIcon = function(type) {
    if (type == 'run') {
      self.$runSim.html('<span class="icon-play"></span>');
    } else {
      self.$runSim.html('<span class="icon-stop"></span>');
    }
  };

  // Reset simulator
  this.resetSim = function(resetPython) {
    if (typeof resetPython == 'undefined') {
      resetPython = true;
    }

    return babylon.world.setOptions(self.worldOptionsSetting).then(function(){
      self.clearWorldInfoPanel();
      self.hideWorldInfoPanel();
      if (resetPython) {
        skulpt.hardInterrupt = true;
        self.setRunIcon('run');
      }
      return babylon.resetScene().then(function(){
        self.initSensorsPanel();
      });
    });
  };

  // Strip html tags
  this.stripHTML = function(text) {
    const regex = /</g;
    const regex2 = />/g;
    return text.replace(regex, '&lt;').replace(regex2, '&gt;');
  }

  // write to console
  this.consoleWrite = function(text) {
    text = self.$consoleContent.html() + self.stripHTML(text);
    self.$consoleContent.html(text);
    self.scrollConsoleToBottom();
  };

  // write to console
  this.consoleWriteErrors = function(text) {
    text = '<span class="error">' + self.stripHTML(text) + '</span>\n';
    text = self.$consoleContent.html() + text;
    self.$consoleContent.html(text);
    self.scrollConsoleToBottom();
  };

  // clear all content
  this.clearConsole = function() {
    self.$consoleContent.html('');
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

  // Toggle FPS display
  this.toggleFPS = function() {
    self.showFPS = ! self.showFPS;

    if (! self.showFPS) {
      self.$fps.text('');
    }
  };
}

simPanel.init();