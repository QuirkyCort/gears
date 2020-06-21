var ev3dev2_generators = new function() {
  var self = this;

  // Load Python generators
  this.loadGenerators = function() {
    Blockly.Python['print'] = self.print;
    Blockly.Python['when_started'] = self.when_started;
    Blockly.Python['sleep'] = self.sleep;
    Blockly.Python['stop'] = self.stop;
    Blockly.Python['move_steering'] = self.move_steering;
    Blockly.Python['exit'] = self.exit;
    Blockly.Python['position'] = self.position;
    Blockly.Python['reset_motor'] = self.reset_motor;
    Blockly.Python['move_tank'] = self.move_tank;
    Blockly.Python['color_sensor'] = self.color_sensor;
    Blockly.Python['ultrasonic_sensor'] = self.ultrasonic_sensor;
    Blockly.Python['gyro_sensor'] = self.gyro_sensor;
    Blockly.Python['reset_gyro'] = self.reset_gyro;
  };

  // Generate python code
  this.genCode = function() {
    let code =
      '#!/usr/bin/env python3\n\n' +
      'import time\n' +
      'from ev3dev2.motor import *\n' +
      'from ev3dev2.sensor import *\n' +
      'from ev3dev2.sensor.lego import *\n' +
      '\n' +
      'left_motor = LargeMotor(OUTPUT_A)\n' +
      'right_motor = LargeMotor(OUTPUT_B)\n' +
      'steering_drive = MoveSteering(OUTPUT_A, OUTPUT_B)\n' +
      'tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)\n\n';

    var sensorsCode = '';
    var i = 1;
    var sensor = null;
    while (sensor = robot.getComponentByPort('in' + i)) {
      if (sensor.type == 'ColorSensor') {
        sensorsCode += 'color_sensor_in' + i + ' = ColorSensor(INPUT_' + i + ')\n'
      } else if (sensor.type == 'UltrasonicSensor') {
        sensorsCode += 'ultrasonic_sensor_in' + i + ' = UltrasonicSensor(INPUT_' + i + ')\n'
      } else if (sensor.type == 'GyroSensor') {
        sensorsCode += 'gyro_sensor_in' + i + ' = GyroSensor(INPUT_' + i + ')\n'      }
      i++;
    }

    code += sensorsCode + '\n';

    code += Blockly.Python.workspaceToCode(Blockly.getMainWorkspace());
    return code
  };


  //
  // Python Generators
  //

  // Print
  this.print = function(block) {
    var value_text = Blockly.Python.valueToCode(block, 'text', Blockly.Python.ORDER_ATOMIC);

    var code = 'print(' + value_text + ')\n';
    return code;
  };

  // Start
  this.when_started = function(block) {
    var code = '';
    return code;
  };

  // Sleep
  this.sleep = function(block) {
    var value_seconds = Blockly.Python.valueToCode(block, 'seconds', Blockly.Python.ORDER_ATOMIC);

    var code = 'time.sleep(' + value_seconds + ')\n';
    return code;
  };

  // Stop
  this.stop = function(block) {
    var dropdown_stop_action = block.getFieldValue('stop_action');
    if (dropdown_stop_action == 'HOLD') {
      var brake = 'True';
    } else {
      var brake = 'False';
    }

    var code = 'steering_drive.stop(brake=' + brake + ')\n';
    return code;
  };

  // Move steering
  this.move_steering = function(block) {
    var value_steering = Blockly.Python.valueToCode(block, 'steering', Blockly.Python.ORDER_ATOMIC);
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');

    if (dropdown_units == 'PERCENT') {
      var code = 'steering_drive.on(' + value_steering + ', ' + value_speed + ')\n';
    } else if (dropdown_units == 'DEGREES') {
      var code = 'steering_drive.on(' + value_steering + ', SpeedDPS(' + value_speed + '))\n';
    } else if (dropdown_units == 'ROTATIONS') {
      var code = 'steering_drive.on(' + value_steering + ', SpeedRPS(' + value_speed + '))\n';
    }
    return code;
  };

  // Exit
  this.exit = function(block) {
    var code = 'exit()\n';
    return code;
  };

  // get position
  this.position = function(block) {
    var dropdown_motor = block.getFieldValue('motor');
    var dropdown_units = block.getFieldValue('units');

    if (dropdown_motor == 'LEFT') {
      var code = 'left_motor.position';
    } else {
      var code = 'right_motor.position';
    }

    if (dropdown_units == 'ROTATIONS') {
      var code = '(' + code + ' / 360.0)';
    }

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // reset position
  this.reset_motor = function(block) {
    var dropdown_motor = block.getFieldValue('motor');
    if (dropdown_motor == 'LEFT') {
      var code = 'left_motor.position = 0\n';
    } else if (dropdown_motor == 'RIGHT') {
      var code = 'right_motor.position = 0\n';
    } else {
      var code =
        'left_motor.position = 0\n' +
        'right_motor.position = 0\n';
    }

    return code;
  };

  // move tank
  this.move_tank = function(block) {
    var value_left = Blockly.Python.valueToCode(block, 'left', Blockly.Python.ORDER_ATOMIC);
    var value_right = Blockly.Python.valueToCode(block, 'right', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');

    if (dropdown_units == 'PERCENT') {
      var code = 'tank_drive.on(' + value_left + ', ' + value_right + ')\n';
    } else if (dropdown_units == 'DEGREES') {
      var code = 'tank_drive.on(SpeedDPS(' + value_left + '), SpeedDPS(' + value_right + '))\n';
    } else if (dropdown_units == 'ROTATIONS') {
      var code = 'tank_drive.on(SpeedRPS(' + value_left + '), SpeedRPS(' + value_right + '))\n';
    }
    return code;
  };

  // color sensor value
  this.color_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);
    var typeStr = '';

    if (dropdown_type == 'INTENSITY') {
      typeStr = 'reflected_light_intensity';
    } else if (dropdown_type == 'COLOR') {
      typeStr = 'color';
    } else if (dropdown_type == 'RED') {
      typeStr = 'rgb[0]';
    } else if (dropdown_type == 'GREEN') {
      typeStr = 'rgb[1]';
    } else if (dropdown_type == 'BLUE') {
      typeStr = 'rgb[2]';
    } else if (dropdown_type == 'HUE') {
      typeStr = 'hsv[0]';
    } else if (dropdown_type == 'SATURATION') {
      typeStr = 'hsv[1]';
    } else if (dropdown_type == 'VALUE') {
      typeStr = 'hsv[2]';
    }

    var code = 'color_sensor_in' + value_port + '.' + typeStr;
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // ultrasonic
  this.ultrasonic_sensor = function(block) {
    var dropdown_units = block.getFieldValue('units');
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);
    var unitsStr = '';

    if (dropdown_units == 'CM') {
      unitsStr = 'distance_centimeters';
    } else if (dropdown_units == 'INCHES') {
      unitsStr = 'distance_inches';
    }
    var code = 'ultrasonic_sensor_in' + value_port + '.' + unitsStr;
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro
  this.gyro_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);

    if (dropdown_type == 'ANGLE') {
      var typeStr = 'angle';
    } else if (dropdown_type == 'RATE') {
      var typeStr = 'rate';
    }
    var code = 'gyro_sensor_in' + value_port + '.' + typeStr;

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro reset
  this.reset_gyro = function(block) {
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);

    var code = 'gyro_sensor_in' + value_port + '.reset()\n';
    return code;
  };
}

