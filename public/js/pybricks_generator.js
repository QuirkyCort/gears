var pybricks_generator = new function() {
  var self = this;

  // Load Python generators
  this.load = function() {
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
    Blockly.Python['initialize_drive'] = self.initialize_drive;
    Blockly.Python['drive_straight'] = self.drive_straight;
    Blockly.Python['drive_turn'] = self.drive_turn;
    Blockly.Python['drive_drive'] = self.drive_drive;
  };

  // Generate python code
  this.genCode = function() {
    let code =
      '#!/usr/bin/env pybricks-micropython\n\n' +
      'from pybricks.ev3devices import *\n' +
      'from pybricks.parameters import Port\n' +
      'from pybricks.tools import wait\n' +
      'from pybricks.robotics import DriveBase\n' +
      '\n' +
      'left_motor = Motor(PORT.A)\n' +
      'right_motor = Motor(PORT.B)\n\n';

    var sensorsCode = '';
    var i = 1;
    var sensor = null;
    while (sensor = robot.getComponentByPort('in' + i)) {
      if (sensor.type == 'ColorSensor') {
        sensorsCode += 'color_sensor_in' + i + ' = ColorSensor(PORT.S' + i + ')\n'
      } else if (sensor.type == 'UltrasonicSensor') {
        sensorsCode += 'ultrasonic_sensor_in' + i + ' = UltrasonicSensor(PORT.S' + i + ')\n'
      } else if (sensor.type == 'GyroSensor') {
        sensorsCode += 'gyro_sensor_in' + i + ' = GyroSensor(PORT.S' + i + ')\n'      }
      i++;
    }

    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var motorsCode = '';
    i = 3;
    var motor = null;
    while (motor = robot.getComponentByPort('out' + PORT_LETTERS[i])) {
      if (motor.type == 'MagnetActuator') {
        motorsCode += 'magnet_out' + PORT_LETTERS[i] + ' = Motor(PORT.' + PORT_LETTERS[i] + ')\n';
      } else if (motor.type == 'ArmActuator') {
        motorsCode += 'arm_out' + PORT_LETTERS[i] + ' = Motor(PORT.' + PORT_LETTERS[i] + ')\n';
      }
      i++;
    }

    code += sensorsCode + '\n';
    code += motorsCode + '\n';

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
    var dropdown_units = block.getFieldValue('units');

    var code = 'wait(' + value_seconds;
    if (dropdown_units == 'SECONDS') {
      code += ' * 1000)\n';
    } else if (dropdown_units == 'MILLISECONDS') {
      code += ')\n';
    }
    return code;
  };

  // Stop
  this.stop = function(block) {
    var dropdown_stop_action = block.getFieldValue('stop_action');

    if (dropdown_stop_action == 'BRAKE') {
      var code =
        'drive.stop()\n' +
        'left_motor.brake()\n' +
        'right_motor.brake()\n';
    } else if (dropdown_stop_action == 'COAST') {
      var code = 'drive.stop()\n';
    } else if (dropdown_stop_action == 'HOLD') {
      var code =
        'drive.stop()\n' +
        'left_motor.hold()\n' +
        'right_motor.hold()\n';
    }
    return code;
  };

  // Move steering
  this.move_steering = function(block) {
    // var value_steering = Blockly.Python.valueToCode(block, 'steering', Blockly.Python.ORDER_ATOMIC);
    // var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    // var dropdown_units = block.getFieldValue('units');

    // if (dropdown_units == 'PERCENT') {
    //   var code = 'steering_drive.on(' + value_steering + ', ' + value_speed + ')\n';
    // } else if (dropdown_units == 'DEGREES') {
    //   var code = 'steering_drive.on(' + value_steering + ', SpeedDPS(' + value_speed + '))\n';
    // } else if (dropdown_units == 'ROTATIONS') {
    //   var code = 'steering_drive.on(' + value_steering + ', SpeedRPS(' + value_speed + '))\n';
    // }
    // return code;
  };

  // Exit
  this.exit = function(block) {
    var code = 'exit()\n';
    return code;
  };

  // get position
  this.position = function(block) {
    var dropdown_motor = block.getFieldValue('motor');

    if (dropdown_motor == 'LEFT') {
      var code = 'left_motor.angle()';
    } else if (dropdown_motor == 'RIGHT') {
      var code = 'right_motor.angle()';
    }
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // reset position
  this.reset_motor = function(block) {
    var dropdown_motor = block.getFieldValue('motor');

    if (dropdown_motor == 'LEFT') {
      var code = 'left_motor.reset_angle()\n';
    } else if (dropdown_motor == 'RIGHT') {
      var code = 'right_motor.reset_angle()\n';
    } else {
      var code = 'drive.reset()';
    }
    return code;
  };

  // move tank
  this.move_tank = function(block) {
    var value_left = Blockly.Python.valueToCode(block, 'left', Blockly.Python.ORDER_ATOMIC);
    var value_right = Blockly.Python.valueToCode(block, 'right', Blockly.Python.ORDER_ATOMIC);

    var code =
      'left_motor.run(' + value_left + ')\n' +
      'right_motor.run(' + value_right + ')\n';
    return code;
  };

  // color sensor value
  this.color_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);
    var typeStr = '';

    if (dropdown_type == 'INTENSITY') {
      typeStr = 'reflection()';
    } else if (dropdown_type == 'COLOR') {
      typeStr = 'color()';
    } else if (dropdown_type == 'RED') {
      typeStr = 'rgb()[0]';
    } else if (dropdown_type == 'GREEN') {
      typeStr = 'rgb()[1]';
    } else if (dropdown_type == 'BLUE') {
      typeStr = 'rgb()[2]';
    } else if (dropdown_type == 'RGB') {
      typeStr = 'rgb()';
    }

    var code = 'color_sensor_in' + value_port + '.' + typeStr;
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // ultrasonic
  this.ultrasonic_sensor = function(block) {
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);

    var code = 'ultrasonic_sensor_in' + value_port + '.distance()';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro
  this.gyro_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);

    if (dropdown_type == 'ANGLE') {
      var typeStr = 'angle()';
    } else if (dropdown_type == 'RATE') {
      var typeStr = 'speed()';
    }
    var code = 'gyro_sensor_in' + value_port + '.' + typeStr;

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro reset
  this.reset_gyro = function(block) {
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);

    var code = 'gyro_sensor_in' + value_port + '.reset_angle()\n';
    return code;
  };

  // initialize drive
  this.initialize_drive = function(block) {
    var value_diameter = Blockly.Python.valueToCode(block, 'diameter', Blockly.Python.ORDER_ATOMIC);
    var value_axle_distance = Blockly.Python.valueToCode(block, 'axle_distance', Blockly.Python.ORDER_ATOMIC);

    var code = 'drive = DriveBase(left_motor, right_motor, wheel_diameter=' + value_diameter + ', axle_track=' + value_axle_distance + ')\n';
    return code;
  };

  // drive straight
  this.drive_straight = function(block) {
    var value_distance = Blockly.Python.valueToCode(block, 'distance', Blockly.Python.ORDER_ATOMIC);

    var code = 'drive.straight(' + value_distance + ')\n';
    return code;
  };

  // turn
  this.drive_turn = function(block) {
    var value_angle = Blockly.Python.valueToCode(block, 'angle', Blockly.Python.ORDER_ATOMIC);

    var code = 'drive.turn(' + value_angle + ')\n';
    return code;
  };

  // drive with speed and turn
  this.drive_drive = function(block) {
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var value_rate = Blockly.Python.valueToCode(block, 'rate', Blockly.Python.ORDER_ATOMIC);

    var code = 'drive.drive(' + value_speed + ', ' + value_rate + ')\n';
    return code;
  };
}

