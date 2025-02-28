/* global Sk, sim */
/* exported $builtinmodule */

var $builtinmodule = function(name) {
  var mod = {};

  mod.System = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
    });

    $loc.reset_simulator = new Sk.builtin.func(function(self, command) {
      simPanel.resetSim(false);
    });
  }, 'System', []);

  mod.Motor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      if (robot.processedOptions.wheels && address.v == 'outA') {
        self.motor = robot.leftWheel;
      } else if (robot.processedOptions.wheels && address.v == 'outB') {
        self.motor = robot.rightWheel;
      } else {
        self.motor = robot.getComponentByPort(address.v);
        if (!self.motor) {
          throw new Sk.builtin.TypeError('No motor connected to ' + String(address.v));
        }
      }
    });

    $loc.command = new Sk.builtin.func(function(self, command) {
      if (command.v == 'run-timed') {
        self.motor.time_target = Date.now() + self.motor.time_sp * 1000;
        self.motor.runTimed();

      } else if (command.v == 'run-to-rel-pos') {
        self.motor.position_target = self.motor.position + self.motor.position_sp;
        self.motor.runToPosition();

      } else if (command.v == 'run-to-abs-pos') {
        self.motor.position_target = self.motor.position_sp;
        self.motor.runToPosition();

      } else if (command.v == 'run-forever') {
        self.motor.runForever();

      } else if (command.v == 'stop') {
        self.motor.stop();

      } else if (command.v == '') {
        self.motor.stop();
      }

      self.motor.command = command.v;
    });

    $loc.stop_action = new Sk.builtin.func(function(self, stop_action) {
      if (typeof stop_action != 'undefined') {
        self.motor.stop_action = stop_action.v;
      } else {
        return Sk.ffi.remapToPy(self.motor.stop_action);
      }
    });

    $loc.state = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.motor.state);
    });

    $loc.speed_sp = new Sk.builtin.func(function(self, speed_sp) {
      if (typeof speed_sp != 'undefined') {
        self.motor.speed_sp = speed_sp.v;
      } else {
        return Sk.ffi.remapToPy(self.motor.speed_sp);
      }
    });

    $loc.time_sp = new Sk.builtin.func(function(self, time_sp) {
      if (typeof time_sp != 'undefined') {
        self.motor.time_sp = time_sp.v;
      } else {
        return Sk.ffi.remapToPy(self.motor.time_sp);
      }
    });

    $loc.position = new Sk.builtin.func(function(self, pos) {
      if (typeof pos != 'undefined') {
        self.motor.positionAdjustment += self.motor.position - pos.v;
        self.motor.position = pos.v;
        self.motor.position_target = pos.v;
        self.motor.prevPosition = pos.v;
      } else {
        return Sk.ffi.remapToPy(self.motor.position);
      }
    });

    $loc.polarity = new Sk.builtin.func(function(self, polarity) {
      if (typeof polarity != 'undefined') {
        self.motor.polarity = polarity.v;
      } else {
        return Sk.ffi.remapToPy(self.motor.polarity);
      }
    });

    $loc.position_sp = new Sk.builtin.func(function(self, position_sp) {
      if (typeof position_sp != 'undefined') {
        self.motor.position_sp = position_sp.v;
      } else {
        return Sk.ffi.remapToPy(self.motor.position_sp);
      }
    });

    $loc.speed = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.motor.speed);
    });

  }, 'Motor', []);

  mod.Pen = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.pen = robot.getComponentByPort(address.v);
      if (!self.pen || self.pen.type != 'Pen') {
        throw new Sk.builtin.TypeError('No pen connected to ' + String(address.v));
      }
    });

    $loc.down = new Sk.builtin.func(function(self) {
      self.pen.down();
    });

    $loc.up = new Sk.builtin.func(function(self) {
      self.pen.up();
    });

    $loc.isDown = new Sk.builtin.func(function(self) {
      return self.pen.isDown;
    });

    $loc.setColor = new Sk.builtin.func(function(self, r, g, b) {
      self.pen.setTraceColor(r.v, g.v, b.v);
    });

    $loc.setWidth = new Sk.builtin.func(function(self, width) {
      self.pen.setWidth(width.v);
    });

    // $loc.setOptions = new Sk.builtin.func(function(self, o) {
    //   self.robot.pen.set_options(o)
    // });

  }, 'Pen', []);

  mod.ColorSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor || self.sensor.type != 'ColorSensor') {
        throw new Sk.builtin.TypeError('No color sensor connected to ' + String(address.v));
      }
    });

    $loc.value = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.sensor.getRGB());
    });

    $loc.valueLAB = new Sk.builtin.func(function(self) {
      let rgb = self.sensor.getRGB();
      let lab = Colors.toLAB(rgb);

      return Sk.ffi.remapToPy(lab);
    });

    $loc.valueHSV = new Sk.builtin.func(function(self) {
      let rgb = self.sensor.getRGB();
      let hsv = Colors.toHSV(rgb);

      return Sk.ffi.remapToPy(hsv);
    });

    $loc.valueHLS = new Sk.builtin.func(function(self) {
      let rgb = self.sensor.getRGB();
      let hls = Colors.toHLS(rgb);

      return Sk.ffi.remapToPy(hls);
    });

    $loc.color = new Sk.builtin.func(function(self) {
      let rgb = self.sensor.getRGB();
      let hsv = Colors.toHSV(rgb);
      let color = Colors.toColor(hsv);

      return Sk.ffi.remapToPy(color);
    });

    $loc.colorName = new Sk.builtin.func(function(self) {
      let rgb = self.sensor.getRGB();
      let hsv = Colors.toHSV(rgb);
      let color = Colors.toColor(hsv);
      let colorName = Colors.toColorName(color);

      return Sk.ffi.remapToPy(colorName);
    });

  }, 'ColorSensor', []);

  mod.GyroSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor || self.sensor.type != 'GyroSensor') {
        throw new Sk.builtin.TypeError('No gyro sensor connected to ' + String(address.v));
      }
    });

    $loc.heading = new Sk.builtin.func(function(self, float) {
      let heading = self.sensor.getHeading();

      if (float.v == false) {
        heading = Math.round(heading);
      }
      if (heading == 180) {
        heading = -180;
      }

      return Sk.ffi.remapToPy(heading);
    });

    $loc.yawAngleAndRate = new Sk.builtin.func(function(self, float) {
      var gyro = [];

      gyro[0] = self.sensor.getYawAngle();
      gyro[1] = self.sensor.getYawRate();

      if (float.v == false) {
        gyro[0] = Math.round(gyro[0]);
        gyro[1] = Math.round(gyro[1]);
      }

      return Sk.ffi.remapToPy(gyro);
    });

    $loc.pitchAngleAndRate = new Sk.builtin.func(function(self, float) {
      var gyro = [];

      gyro[0] = self.sensor.getPitchAngle();
      gyro[1] = self.sensor.getPitchRate();

      if (float.v == false) {
        gyro[0] = Math.round(gyro[0]);
        gyro[1] = Math.round(gyro[1]);
      }

      return Sk.ffi.remapToPy(gyro);
    });

    $loc.rollAngleAndRate = new Sk.builtin.func(function(self, float) {
      var gyro = [];

      gyro[0] = self.sensor.getRollAngle();
      gyro[1] = self.sensor.getRollRate();

      if (float.v == false) {
        gyro[0] = Math.round(gyro[0]);
        gyro[1] = Math.round(gyro[1]);
      }

      return Sk.ffi.remapToPy(gyro);
    });

    $loc.reset = new Sk.builtin.func(function(self) {
      self.sensor.reset();
    });

  }, 'GyroSensor', []);

  mod.GPSSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor || self.sensor.type != 'GPSSensor') {
        throw new Sk.builtin.TypeError('No GPS sensor connected to ' + String(address.v));
      }
    });

    $loc.position = new Sk.builtin.func(function(self) {
      var position = [];

      position = self.sensor.getPosition();

      return Sk.ffi.remapToPy(position);
    });

    $loc.reset = new Sk.builtin.func(function(self) {
      self.sensor.reset();
    });

  }, 'GPSSensor', []);

  mod.ObjectTracker = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {});

    $loc.position = new Sk.builtin.func(function(self,foo) {
      var position = [];

      position = robot.objectTrackerPosition(foo.v);

      return Sk.ffi.remapToPy(position);
    });

    $loc.velocity = new Sk.builtin.func(function(self,foo) {
      var velocity = [];

      velocity = robot.objectTrackerVelocity(foo.v);

      return Sk.ffi.remapToPy(velocity);
    });
  }, 'ObjectTracker', []);

  mod.UltrasonicSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor || (self.sensor.type != 'UltrasonicSensor' && self.sensor.type != 'LaserRangeSensor')) {
        throw new Sk.builtin.TypeError('No ultrasonic sensor connected to ' + String(address.v));
      }
    });

    $loc.dist = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.sensor.getDistance());
    });

  }, 'UltrasonicSensor', []);

  mod.LidarSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor || (self.sensor.type != 'LidarSensor')) {
        throw new Sk.builtin.TypeError('No lidar sensor connected to ' + String(address.v));
      }
    });

    $loc.distances = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.sensor.getDistances());
    });

  }, 'LidarSensor', []);

  mod.TouchSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor || self.sensor.type != 'TouchSensor') {
        throw new Sk.builtin.TypeError('No touch sensor connected to ' + String(address.v));
      }
    });

    $loc.isPressed = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.sensor.isPressed());
    });

  }, 'TouchSensor', []);

  mod.CameraSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor || self.sensor.type != 'CameraSensor') {
        throw new Sk.builtin.TypeError('No camera sensor connected to ' + String(address.v));
      }
    });

    $loc.captureImage = new Sk.builtin.func(function(self) {
      return self.sensor.captureImage();
    });

    $loc.getRGB = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.sensor.getRGB());
    });

    $loc.getHSV = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(self.sensor.getHSV());
    });

    $loc.findBlobs = new Sk.builtin.func(function(self, threshold, pixels_threshold) {
      let resultsObj = self.sensor.findBlobs(Sk.ffi.remapToJs(threshold), pixels_threshold.v);
      let results = [];
      for (let result of resultsObj) {
        results.push([
          result.pixels,
          result.cx,
          result.cy,
          result.x,
          result.y,
          result.w,
          result.h
        ]);
      }
      return Sk.ffi.remapToPy(results);
    });

  }, 'CameraSensor', []);

  mod.Sound = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    this.playing = false;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.volume = 1.0;
      self.audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
      self.gainNode = self.audioCtx.createGain();

      self.gainNode.connect(self.audioCtx.destination);
    });

    $loc.speak = new Sk.builtin.func(function(self, text) {
      var utter = new SpeechSynthesisUtterance(text.v);
      utter.volume = self.volume;
      speechSynthesis.speak(utter);
    });

    $loc.set_volume = new Sk.builtin.func(function(self, volume) {
      self.volume = parseFloat(volume.v) / 100;
      self.gainNode.gain.value = self.volume;
    });

    $loc.get_volume = new Sk.builtin.func(function(self) {
      return self.volume;
    });

    $loc.isSpeaking = new Sk.builtin.func(function(self) {
      return speechSynthesis.speaking;
    });

    $loc.play_tone = new Sk.builtin.func(function(self, frequency, duration, delay) {
      self.playing = true;
      oscillator = self.audioCtx.createOscillator();

      oscillator.type = 'sine';
      oscillator.connect(self.gainNode);
      oscillator.onended = function() {
        if (delay.v > 0) {
          setTimeout(function(){ self.playing = false; }, delay.v * 1000);
        } else {
          self.playing = false;
        }
      };
      oscillator.frequency.value = frequency.v;

      oscillator.start(self.audioCtx.currentTime);
      oscillator.stop(self.audioCtx.currentTime + duration.v);
    });

    $loc.isPlaying = new Sk.builtin.func(function(self) {
      return self.playing;
    });
  }, 'Sound', []);

  mod.Radio = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      robot.radioEmpty();
    });

    $loc.send = new Sk.builtin.func(function(self, dest, mailbox, value) {
      return Sk.ffi.remapToPy(robot.radioSend(dest.v, mailbox.v, Sk.ffi.remapToJs(value)));
    });

    $loc.available = new Sk.builtin.func(function(self, mailbox) {
      return Sk.ffi.remapToPy(robot.radioAvailable(mailbox.v));
    });

    $loc.read = new Sk.builtin.func(function(self, mailbox) {
      return Sk.ffi.remapToPy(robot.radioRead(mailbox.v));
    });

    $loc.empty = new Sk.builtin.func(function(self, mailbox) {
      if (mailbox.v == null) {
        return Sk.ffi.remapToPy(robot.radioEmpty());
      }
      return Sk.ffi.remapToPy(robot.radioEmpty(mailbox.v));
    });

  }, 'Radio', []);

  mod.HubButtons = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
    });

    $loc.pybricks_pressed = new Sk.builtin.func(function(self) {
      let map = {
        down: 2,
        left: 4,
        enter: 5,
        right: 6,
        up: 8
      }

      let pressed = [];

      let hubButtons = robot.getHubButtons();
      for (let btn in hubButtons) {
        if (hubButtons[btn] && btn in map) {
          pressed.push(map[btn]);
        }
      }

      return Sk.ffi.remapToPy(pressed);
    });

    $loc.ev3dev_buttons_pressed = new Sk.builtin.func(function(self) {
      let pressed = [];

      let hubButtons = robot.getHubButtons();
      for (let btn in hubButtons) {
        if (hubButtons[btn]) {
          pressed.push(btn);
        }
      }

      return Sk.ffi.remapToPy(pressed);
    });

    $loc.ev3dev_any = new Sk.builtin.func(function(self) {
      let hubButtons = robot.getHubButtons();
      for (let btn in hubButtons) {
        if (hubButtons[btn]) {
          return Sk.ffi.remapToPy(true);
        }
      }

      return Sk.ffi.remapToPy(false);
    });

    $loc.ev3dev_check_buttons = new Sk.builtin.func(function(self, buttons) {
      buttons = Sk.ffi.remapToJs(buttons);
      let hubButtons = robot.getHubButtons();
      let pressed = [];

      for (let btn in hubButtons) {
        if (hubButtons[btn]) {
          pressed.push(btn);
        }
      }

      if (buttons.length != pressed.length) {
        return Sk.ffi.remapToPy(false);
      }

      for (let btn of pressed) {
        if (buttons.indexOf(btn) == -1) {
          return Sk.ffi.remapToPy(false);
        }
      }

      return Sk.ffi.remapToPy(true);
    });

    $loc.getButton = new Sk.builtin.func(function(self, button) {
      button = Sk.ffi.remapToJs(button);
      let hubButtons = robot.getHubButtons();

      return Sk.ffi.remapToPy(hubButtons[button]);
    });

    $loc.getButtons = new Sk.builtin.func(function(self) {
      return Sk.ffi.remapToPy(robot.getHubButtons());
    });

  }, 'HubButtons', []);

  mod.Plotter = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, minX, minY, maxX, maxY) {
      self.div = document.getElementById('plotter');
      self.canvas = document.getElementById('plotterCanvas');
      self.ctx = self.canvas.getContext('2d');

      self.canvas.minX = minX.v;
      self.canvas.minY = minY.v;
      self.canvas.maxX = maxX.v;
      self.canvas.maxY = maxY.v;

      self.minX = minX.v;
      self.minY = minY.v;
      self.maxX = maxX.v;
      self.maxY = maxY.v;
      self.width = maxX.v - minX.v;
      self.height = maxY.v - minY.v;

      self.ctx.fillStyle = 'white';
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

      self.ctx.fillStyle = 'black';
      self.ctx.strokeStyle = 'black';
      self.pointSize = 2;

      self.getPos = function(x, y) {
        x = (x - self.minX) / self.width * self.canvas.width;
        y = self.canvas.height - (y - self.minY) / self.height * self.canvas.height;
        return [x, y];
      }
      self.div.classList.remove('hide');
    });

    $loc.show = new Sk.builtin.func(function(self) {
      self.div.classList.remove('hide');
    });

    $loc.hide = new Sk.builtin.func(function(self) {
      self.div.classList.add('hide');
    });

    $loc.clear = new Sk.builtin.func(function(self) {
      let color = self.ctx.fillStyle;

      self.ctx.fillStyle = 'white';
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

      self.ctx.fillStyle = color;
    });

    $loc.setColor = new Sk.builtin.func(function(self, color) {
      self.ctx.fillStyle = color.v;
      self.ctx.strokeStyle = color.v;
    });

    $loc.setPointSize = new Sk.builtin.func(function(self, size) {
      self.pointSize = size.v;
    });

    $loc.drawPoint = new Sk.builtin.func(function(self, x, y) {
      [x, y] = self.getPos(x.v, y.v);

      self.ctx.fillRect(x - self.pointSize / 2, y - self.pointSize / 2, self.pointSize, self.pointSize);
    });

    $loc.drawLine = new Sk.builtin.func(function(self, x1, y1, x2, y2) {
      [x1, y1] = self.getPos(x1.v, y1.v);
      [x2, y2] = self.getPos(x2.v, y2.v);
      self.ctx.beginPath();
      self.ctx.moveTo(x1, y1);
      self.ctx.lineTo(x2, y2);
      self.ctx.stroke();
    });

    $loc.drawTriangle = new Sk.builtin.func(function(self, x, y, dir) {
      let angle = dir.v / 180 * Math.PI;
      [x, y] = self.getPos(x.v, y.v);
      let tipX = x + 8 * Math.cos(angle);
      let tipY = y - 8 * Math.sin(angle);
      let leftX = x + 5 * Math.cos(angle + Math.PI / 3 * 2);
      let leftY = y - 5 * Math.sin(angle + Math.PI / 3 * 2);
      let rightX = x + 5 * Math.cos(angle - Math.PI / 3 * 2);
      let rightY = y - 5 * Math.sin(angle - Math.PI / 3 * 2);
      self.ctx.fillRect(x - 1, y - 1, 2, 2);
      self.ctx.beginPath();
      self.ctx.moveTo(tipX, tipY);
      self.ctx.lineTo(leftX, leftY);
      self.ctx.lineTo(rightX, rightY);
      self.ctx.closePath();
      self.ctx.stroke();
    });

    $loc.drawGrid = new Sk.builtin.func(function(self, size) {
      let [x, y] = self.getPos(0, 0);
      let [rx, ry] = self.getPos(size.v, size.v);
      rx -= x;
      ry = y - ry;

      let color = self.ctx.strokeStyle;

      self.ctx.strokeStyle = 'lightgray';
      self.ctx.beginPath();
      for (let i=Math.floor(self.minX / size.v); i<Math.ceil(self.maxX / size.v); i++) {
        let x2 = Math.round(x + i*rx);
        self.ctx.moveTo(x2, 0);
        self.ctx.lineTo(x2, self.canvas.height);
      }
      for (let i=Math.floor(self.minY / size.v); i<Math.ceil(self.maxY / size.v); i++) {
        let [x2, y2] = self.getPos(0, i*size.v);
        y2 = Math.round(y2);
        self.ctx.moveTo(0, y2);
        self.ctx.lineTo(self.canvas.width, y2);
      }
      self.ctx.stroke();

      self.ctx.strokeStyle = 'darkgray';
      self.ctx.beginPath();
      self.ctx.moveTo(x, 0);
      self.ctx.lineTo(x, self.canvas.height);
      self.ctx.moveTo(0, y);
      self.ctx.lineTo(self.canvas.width, y);
      self.ctx.stroke();

      self.ctx.strokeStyle = color;
    });

    $loc.drawGridPolar = new Sk.builtin.func(function(self, size) {
      let [x, y] = self.getPos(0, 0);
      let [rx, ry] = self.getPos(size.v, size.v);
      rx -= x;
      ry = y - ry;

      let color = self.ctx.strokeStyle;
      self.ctx.strokeStyle = 'lightgray';

      self.ctx.beginPath();
      self.ctx.moveTo(x, 0);
      self.ctx.lineTo(x, self.canvas.height);
      self.ctx.moveTo(0, y);
      self.ctx.lineTo(self.canvas.width, y);

      let [xMin, yMin] = self.getPos(self.minX, self.minY);
      let [xMax, yMax] = self.getPos(self.maxX, self.maxY);

      self.ctx.moveTo(x, y);
      self.ctx.lineTo(xMin, yMin);
      self.ctx.moveTo(x, y);
      self.ctx.lineTo(xMin, yMax);
      self.ctx.moveTo(x, y);
      self.ctx.lineTo(xMax, yMin);
      self.ctx.moveTo(x, y);
      self.ctx.lineTo(xMax, yMax);
      self.ctx.stroke()

      let biggestX = Math.max(Math.abs(self.minX), Math.abs(self.maxX));
      let biggestY = Math.max(Math.abs(self.minY), Math.abs(self.maxY));
      let count = Math.ceil(Math.sqrt(biggestX * biggestX + biggestY * biggestY) / size.v);
      self.ctx.beginPath();
      for (let i=1; i<count; i++) {
        self.ctx.ellipse(x, y, i*rx, i*ry, 0, 0, Math.PI * 2);
      }
      self.ctx.stroke();

      self.ctx.strokeStyle = color;
    });

  }, 'Plotter', []);

  return mod;
};
