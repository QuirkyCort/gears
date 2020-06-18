/* global Sk, sim */
/* exported $builtinmodule */

var $builtinmodule = function(name) {
  var mod = {};

  mod.get_clock = new Sk.builtin.func(function() {
    return sim.clock / sim.fps;
  });

  mod.Motor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      if (address.v == 'outA') {
        self.wheel = robot.leftWheel;
      } else if (address.v == 'outB') {
        self.wheel = robot.rightWheel;
      } else {
        throw new Sk.builtin.TypeError('No motor connected to ' + String(address.v));
      }
    });

    $loc.command = new Sk.builtin.func(function(self, command) {
      if (command.v == 'run-timed') {
        self.wheel.time_target = sim.clock + self.wheel.time_sp * sim.fps;
        self.wheel.state = 'running';

      } else if (command.v == 'run-to-rel-pos') {
        self.wheel.position_target = self.wheel.pos + self.wheel.position_sp;
        if (self.wheel.position_target != self.wheel.pos) {
          self.wheel.state = 'running';
        } else {
          self.wheel.state = '';
        }

      } else if (command.v == 'run-to-abs-pos') {
        self.wheel.position_target = self.wheel.position_sp;
        if (self.wheel.position_target != self.wheel.pos) {
          self.wheel.state = 'running';
        } else {
          self.wheel.state = '';
        }

      } else if (command.v == 'run-forever') {
        self.wheel.runForever();

      } else if (command.v == '') {
        self.wheel.stop();
      }

      self.wheel.command = command.v;
    });

    $loc.stop_action = new Sk.builtin.func(function(self, stop_action) {
      if (typeof stop_action != 'undefined') {
        self.wheel.stop_action = stop_action.v;
      } else {
        return self.wheel.stop_action;
      }
    });


    $loc.state = new Sk.builtin.func(function(self) {
      return self.wheel.state;
    });

    $loc.speed_sp = new Sk.builtin.func(function(self, speed_sp) {
      if (typeof speed_sp != 'undefined') {
        self.wheel.speed_sp = speed_sp.v;
      } else {
        return self.wheel.speed_sp;
      }
    });

    $loc.time_sp = new Sk.builtin.func(function(self, time_sp) {
      if (typeof time_sp != 'undefined') {
        self.wheel.time_sp = time_sp.v;
      } else {
        return self.wheel.time_sp;
      }
    });

    $loc.position = new Sk.builtin.func(function(self, pos) {
      if (typeof pos != 'undefined') {
        self.wheel.positionAdjustment += self.wheel.position - pos.v;
        self.wheel.position = pos.v;
        self.wheel.prevPosition = pos.v % 360;
      } else {
        return self.wheel.position;
      }
    });

    $loc.polarity = new Sk.builtin.func(function(self, polarity) {
      if (typeof polarity != 'undefined') {
        self.wheel.polarity = polarity.v;
      } else {
        return self.wheel.polarity;
      }
    });

    $loc.position_sp = new Sk.builtin.func(function(self, position_sp) {
      if (typeof position_sp != 'undefined') {
        self.wheel.position_sp = position_sp.v;
      } else {
        return self.wheel.position_sp;
      }
    });

    $loc.speed = new Sk.builtin.func(function(self) {
      return self.wheel.speed;
    });

  }, 'Motor', []);

  mod.ColorSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor) {
        throw new Sk.builtin.TypeError('No color sensor connected to ' + String(address.v));
      }
    });

    $loc.value = new Sk.builtin.func(function(self) {
      return self.sensor.getRGB();
    });

    $loc.valueLAB = new Sk.builtin.func(function(self) {
      var rgb;
      var xyz = [0, 0, 0];
      var lab = [0, 0, 0];

      rgb = self.sensor.getRGB();

      for (let i=0; i<3; i++) {
        let c = rgb[i] / 255;
        if (c > 0.04045) {
          rgb[i] = Math.pow((c + 0.055) / 1.055, 2.4);
        } else {
          rgb[i] = c / 12.92;
        }
      }

      xyz[0] = (rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805) / 0.95047;
      xyz[1] = (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 1.00000;
      xyz[2] = (rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505) / 1.08883;

      for (let i=0; i<3; i++) {
        if (xyz[i] > 0.008856) {
          xyz[i] = Math.pow(xyz[i], 1/3);
        } else {
          xyz[i] = (7.787 * xyz[i]) + 16/116;
        }
      }

      lab[0] = (116 * xyz[1]) - 16;
      lab[1] = 500 * (xyz[0] - xyz[1]);
      lab[2] = 200 * (xyz[1] - xyz[2]);

      return lab;
    });

    $loc.valueHSV = new Sk.builtin.func(function(self) {
      var rgb;
      var hsv = [0, 0, 0];

      rgb = self.sensor.getRGB();
      for (let i=0; i<3; i++) {
        rgb[i] = rgb[i] / 255;
      }

      var cMax = Math.max(...rgb);
      var cMin = Math.min(...rgb);
      var diff = cMax - cMin;

      if (cMax == cMin) {
        hsv[0] = 0;
      } else if (cMax == rgb[0]) {
        hsv[0] = 60 * (rgb[1] - rgb[2]) / diff;
      } else if (cMax == rgb[1]) {
        hsv[0] = 60 * (2 + (rgb[2] - rgb[0]) / diff);
      } else {
        hsv[0] = 60 * (4 + (rgb[0] - rgb[1]) / diff);
      }
      if (hsv[0] < 0) {
        hsv[0] += 360;
      }

      if (cMax == 0) {
        hsv[1] = 0;
      } else {
        hsv[1] = diff / cMax * 100;
      }

      hsv[2] = cMax * 100;

      return hsv;
    });

    $loc.valueHLS = new Sk.builtin.func(function(self) {
      var rgb = [0, 0, 0];
      var hls = [0, 0, 0];

      if (self.side == 'left') {
        rgb = sim.robotStates.sensor1;
      } else if (self.side == 'right') {
        rgb = sim.robotStates.sensor2;
      }
      for (let i=0; i<3; i++) {
        rgb[i] = rgb[i] / 255;
      }

      var cMax = Math.max(...rgb);
      var cMin = Math.min(...rgb);
      var diff = cMax - cMin;

      if (cMax == cMin) {
        hls[0] = 0;
      } else if (cMax == rgb[0]) {
        hls[0] = 60 * (rgb[1] - rgb[2]) / diff;
      } else if (cMax == rgb[1]) {
        hls[0] = 60 * (2 + (rgb[2] - rgb[0]) / diff);
      } else {
        hls[0] = 60 * (4 + (rgb[0] - rgb[1]) / diff);
      }
      if (hls[0] < 0) {
        hls[0] += 360;
      }

      if (cMax == 0 || cMin == 255) {
        hls[2] = 0;
      } else {
        hls[2] = diff / (1 - Math.abs(cMax + cMin - 1)) * 100;
      }

      hls[1] = (cMax + cMin) / 2 * 100;

      return hls;
    });

  }, 'ColorSensor', []);

  mod.GyroSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      if (address.v != 'in4') {
        throw new Sk.builtin.TypeError('No gyro sensor connected to ' + String(address.v));
      }
    });

    $loc.angleAndRate = new Sk.builtin.func(function(self) {
      var gyro = [];

      gyro[0] = Math.round(sim.robotStates.gyro[0]);
      gyro[1] = Math.round(sim.robotStates.gyro[1]);

      return gyro;
    });

  }, 'GyroSensor', []);

  mod.UltrasonicSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor) {
        throw new Sk.builtin.TypeError('No ultrasonic sensor connected to ' + String(address.v));
      }
    });

    $loc.dist = new Sk.builtin.func(function(self) {
      return self.sensor.getDistance();
    });

  }, 'UltrasonicSensor', []);


  return mod;
};