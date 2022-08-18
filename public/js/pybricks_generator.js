var pybricks_generator = new function() {
  var self = this;

  this.autoPorts = {
    ColorSensor: 1,
    UltrasonicSensor: 1,
    GyroSensor: 1,
    GPSSensor: 1,
    TouchSensor: 1,
    Pen: 1
  };

  // Load Python generators
  this.load = function() {
    Blockly.Python.INDENT = '    ';

    Blockly.Python['when_started'] = self.when_started;
    Blockly.Python['move_tank'] = self.move_tank;
    Blockly.Python['move_tank_for'] = self.move_tank_for;
    Blockly.Python['move_steering'] = self.move_steering;
    Blockly.Python['move_steering_for'] = self.move_steering_for;
    Blockly.Python['stop'] = self.stop;
    Blockly.Python['set_movement_motors'] = self.set_movement_motors;
    Blockly.Python['run_motor'] = self.run_motor;
    Blockly.Python['run_motor_for'] = self.run_motor_for;
    Blockly.Python['run_motor_to'] = self.run_motor_to;
    Blockly.Python['stop_motor'] = self.stop_motor;
    Blockly.Python['speed'] = self.speed;
    Blockly.Python['position'] = self.position;
    Blockly.Python['reset_motor'] = self.reset_motor;
    Blockly.Python['color_sensor'] = self.color_sensor;
    Blockly.Python['color'] = self.color;
    Blockly.Python['ultrasonic_sensor'] = self.ultrasonic_sensor;
    Blockly.Python['gyro_sensor'] = self.gyro_sensor;
    Blockly.Python['reset_gyro'] = self.reset_gyro;
    Blockly.Python['say'] = self.say;
    Blockly.Python['beep'] = self.beep;
    Blockly.Python['play_tone'] = self.play_tone;
    Blockly.Python['sleep'] = self.sleep;
    Blockly.Python['exit'] = self.exit;
    Blockly.Python['time'] = self.time;
    Blockly.Python['gps_sensor'] = self.gps_sensor;
    Blockly.Python['penDown'] = self.penDown;
    Blockly.Python['penUp'] = self.penUp;
    Blockly.Python['penSetColor'] = self.penSetColor;
    Blockly.Python['penSetWidth'] = self.penSetWidth;
    Blockly.Python['touch_state'] = self.touch_state;
    Blockly.Python['wait_for_state'] = self.wait_for_state;
    Blockly.Python['button_state'] = self.button_state;
    Blockly.Python['wait_until_button'] = self.wait_until_button;
    Blockly.Python['wait_until'] = self.wait_until;
  };

  // Generate python code
  this.genCode = function() {
    let code =
      '#!/usr/bin/env pybricks-micropython\n' +
      '\n' +
      '# Import the necessary libraries\n' +
      'from pybricks.parameters import *\n' +
      'from pybricks.hubs import EV3Brick\n' +
      'from pybricks.ev3devices import *\n' +
      'from pybricks.tools import wait\n' +
      'from pybricks.robotics import DriveBase\n' +
      '\n' +
      '# Create the sensors and motors objects\n' +
      'ev3 = EV3Brick()\n' +
      '\n' +
      'motorA = Motor(Port.A)\n' +
      'motorB = Motor(Port.B)\n' +
      'left_motor = motorA\n' +
      'right_motor = motorB\n' +
      '\n';

    var sensorsCode = '';
    var i = 1;
    var sensor = null;
    while (sensor = robot.getComponentByPort('in' + i)) {
      if (sensor.type == 'ColorSensor') {
        sensorsCode += 'color_sensor_in' + i + ' = ColorSensor(Port.S' + i + ')\n';
        self.autoPorts[sensor.type] = i;
      } else if (sensor.type == 'UltrasonicSensor') {
        sensorsCode += 'ultrasonic_sensor_in' + i + ' = UltrasonicSensor(Port.S' + i + ')\n';
        self.autoPorts[sensor.type] = i;
      } else if (sensor.type == 'LaserRangeSensor') {
        sensorsCode += 'ultrasonic_sensor_in' + i + ' = UltrasonicSensor(Port.S' + i + ') # Laser Range Sensor\n';
        self.autoPorts[sensor.type] = i;
      } else if (sensor.type == 'GyroSensor') {
        sensorsCode += 'gyro_sensor_in' + i + ' = GyroSensor(Port.S' + i + ')\n';
        self.autoPorts[sensor.type] = i;
      } else if (sensor.type == 'GPSSensor') {
        sensorsCode += 'gps_sensor_in' + i + ' = GPSSensor(Port.S' + i + ')\n';
        self.autoPorts[sensor.type] = i;
      } else if (sensor.type == 'TouchSensor') {
        sensorsCode += 'touch_sensor_in' + i + ' = TouchSensor(Port.S' + i + ')\n';
        self.autoPorts[sensor.type] = i;
      } else if (sensor.type == 'Pen') {
        sensorsCode += 'pen_in' + i + ' = Pen(Port.S' + i + ')\n';
        self.autoPorts[sensor.type] = i;
      }
      i++;
    }

    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var motorsCode = '';
    i = 3;
    var motor = null;
    while (motor = robot.getComponentByPort('out' + PORT_LETTERS[i])) {
      if (motor.type == 'MagnetActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = Motor(Port.' + PORT_LETTERS[i] + ') # Magnet\n';
      } else if (motor.type == 'ArmActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = Motor(Port.' + PORT_LETTERS[i] + ') # Arm\n';
      } else if (motor.type == 'SwivelActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = Motor(Port.' + PORT_LETTERS[i] + ') # Swivel\n';
      } else if (motor.type == 'LinearActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = Motor(Port.' + PORT_LETTERS[i] + ') # Linear Actuator\n';
      } else if (motor.type == 'PaintballLauncherActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = Motor(Port.' + PORT_LETTERS[i] + ') # Paintball Launcher\n';
      } else if (motor.type == 'WheelActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = Motor(Port.' + PORT_LETTERS[i] + ') # Wheel Actuator\n';
      }
      i++;
    }

    code += sensorsCode + '\n';
    code += motorsCode + '\n';

    code +=
      '# Pybricks lacks move_tank and move_steering, so we\'ll add in our own\n' +
      'def move_tank_dc(left, right):\n' +
      '  left_motor.dc(left)\n' +
      '  right_motor.dc(right)\n' +
      '\n' +
      'def move_steering_dc(steer, dc):\n' +
      '  (left_dc, right_dc) = get_speed_steering(steer, dc)\n' +
      '  move_tank_dc(left_dc, right_dc)\n' +
      '\n' +
      'def move_tank(left, right):\n' +
      '  left_motor.run(left)\n' +
      '  right_motor.run(right)\n' +
      '\n' +
      'def move_tank_for_degrees(left, right, degrees):\n' +
      '  if degrees == 0 or (left == 0 and right == 0):\n' +
      '    left_degrees = 0\n' +
      '    right_degrees = 0\n' +
      '  elif abs(left) > abs(right):\n' +
      '    left_degrees = degrees\n' +
      '    right_degrees = abs(right / float(left)) * degrees\n' +
      '  else:\n' +
      '    left_degrees = abs(left / float(right)) * degrees\n' +
      '    right_degrees = degrees\n' +
      '  if abs(left) > abs(right):\n' +
      '    right_motor.run_angle(right, right_degrees, wait=False)\n' +
      '    left_motor.run_angle(left, left_degrees, wait=True)\n' +
      '  else:\n' +
      '    left_motor.run_angle(left, left_degrees, wait=False)\n' +
      '    right_motor.run_angle(right, right_degrees, wait=True)\n' +
      '\n' +
      'def move_tank_for_milliseconds(left, right, milliseconds):\n' +
      '  left_motor.run_time(left, milliseconds, wait=False)\n' +
      '  right_motor.run_time(right, milliseconds, wait=True)\n' +
      '\n' +
      'def get_speed_steering(steer, speed):\n' +
      '  left_speed = speed\n' +
      '  right_speed = speed\n' +
      '  speed_factor = (50 - abs(float(steer))) / 50.0\n' +
      '  if steer >= 0:\n' +
      '    right_speed *= speed_factor\n' +
      '  else:\n' +
      '    left_speed *= speed_factor\n' +
      '  return (left_speed, right_speed)\n' +
      '\n' +
      'def move_steering(steer, speed):\n' +
      '  (left_speed, right_speed) = get_speed_steering(steer, speed)\n' +
      '  move_tank(left_speed, right_speed)\n' +
      '\n' +
      'def move_steering_for_degrees(steer, speed, degrees):\n' +
      '  (left_speed, right_speed) = get_speed_steering(steer, speed)\n' +
      '  move_tank_for_degrees(left_speed, right_speed, degrees)\n' +
      '\n' +
      'def move_steering_for_milliseconds(steer, speed, milliseconds):\n' +
      '  (left_speed, right_speed) = get_speed_steering(steer, speed)\n' +
      '  move_tank_for_milliseconds(left_speed, right_speed, milliseconds)\n\n';

    code += '# Here is where your code starts\n\n';

    code += Blockly.Python.workspaceToCode(blockly.workspace);
    return code
  };

  this.getPort = function(port, sensorType) {
    if (port == 'AUTO') {
      return self.autoPorts[sensorType];
    }
    return port;
  };

  //
  // Python Generators
  //

  // Start
  this.when_started = function(block) {
    var code = '';
    return code;
  };

  // move tank
  this.move_tank = function(block) {
    var value_left = Blockly.Python.valueToCode(block, 'left', Blockly.Python.ORDER_ATOMIC);
    var value_right = Blockly.Python.valueToCode(block, 'right', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');

    if (dropdown_units == 'PERCENT') {
      var leftStr = '(' + value_left + ' / 100) * 1050';
      var rightStr = '(' + value_right + ' / 100) * 1050';
    } else if (dropdown_units == 'DEGREES') {
      var leftStr = value_left;
      var rightStr = value_right;
    } else if (dropdown_units == 'ROTATIONS') {
      var leftStr = value_left + ' * 360';
      var rightStr = value_right + ' * 360';
    }

    var code = 'move_tank(' + leftStr + ', ' + rightStr + ')\n';

    return code;
  };

  // move tank for
  this.move_tank_for = function(block) {
    var value_left = Blockly.Python.valueToCode(block, 'left', Blockly.Python.ORDER_ATOMIC);
    var value_right = Blockly.Python.valueToCode(block, 'right', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');
    var value_duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units2 = block.getFieldValue('units2');

    if (dropdown_units == 'PERCENT') {
      var leftStr = '(' + value_left + ' / 100) * 1050';
      var rightStr = '(' + value_right + ' / 100) * 1050';
    } else if (dropdown_units == 'DEGREES') {
      var leftStr = value_left;
      var rightStr = value_right;
    } else if (dropdown_units == 'ROTATIONS') {
      var leftStr = value_left + ' * 360';
      var rightStr = value_right + ' * 360';
    }

    if (dropdown_units2 == 'ROTATIONS') {
      var cmdStr = 'move_tank_for_degrees';
      var durationStr = value_duration + ' * 360';
    } else if (dropdown_units2 == 'DEGREES') {
      var cmdStr = 'move_tank_for_degrees';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'SECONDS') {
      var cmdStr = 'move_tank_for_milliseconds';
      var durationStr = value_duration + ' * 1000';
    } else if (dropdown_units2 == 'MILLISECONDS') {
      var cmdStr = 'move_tank_for_milliseconds';
      var durationStr = value_duration;
    }

    var code = cmdStr + '(' + leftStr + ', ' + rightStr + ', ' + durationStr + ')\n';

    return code;
  };

  // Move steering
  this.move_steering = function(block) {
    var value_steering = Blockly.Python.valueToCode(block, 'steering', Blockly.Python.ORDER_ATOMIC);
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');

    if (dropdown_units == 'PERCENT') {
      var speedStr = '(' + value_speed + ' / 100) * 1050';
    } else if (dropdown_units == 'DEGREES') {
      var speedStr = value_speed;
    } else if (dropdown_units == 'ROTATIONS') {
      var speedStr = value_speed + ' * 360';
    }

    var code = 'move_steering(' + value_steering + ', ' + speedStr + ')\n';

    return code;
  };

  // Move steering for
  this.move_steering_for = function(block) {
    var value_steering = Blockly.Python.valueToCode(block, 'steering', Blockly.Python.ORDER_ATOMIC);
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');
    var value_duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units2 = block.getFieldValue('units2');

    if (dropdown_units == 'PERCENT') {
      var speedStr = '(' + value_speed + ' / 100) * 1050';
    } else if (dropdown_units == 'DEGREES') {
      var speedStr = value_speed;
    } else if (dropdown_units == 'ROTATIONS') {
      var speedStr = value_speed + ' * 360';
    }

    if (dropdown_units2 == 'ROTATIONS') {
      var cmdStr = 'move_steering_for_degrees';
      var durationStr = value_duration + ' * 360';
    } else if (dropdown_units2 == 'DEGREES') {
      var cmdStr = 'move_steering_for_degrees';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'SECONDS') {
      var cmdStr = 'move_steering_for_milliseconds';
      var durationStr = value_duration + ' * 1000';
    } else if (dropdown_units2 == 'MILLISECONDS') {
      var cmdStr = 'move_steering_for_milliseconds';
      var durationStr = value_duration;
    }

    var code = cmdStr + '(' + value_steering + ', ' + speedStr + ', ' + durationStr + ')\n';

    return code;
  };

  // Stop
  this.stop = function(block) {
    var dropdown_stop_action = block.getFieldValue('stop_action');

    if (dropdown_stop_action == 'BRAKE') {
      var code =
        'left_motor.brake()\n' +
        'right_motor.brake()\n';
    } else if (dropdown_stop_action == 'COAST') {
      var code =
        'left_motor.stop()\n' +
        'right_motor.stop()\n';
    } else if (dropdown_stop_action == 'HOLD') {
      var code =
        'left_motor.hold()\n' +
        'right_motor.hold()\n';
    }

    return code;
  };

  // Set motors for move steering and move tank
  this.set_movement_motors = function(block) {
    var left_port = block.getFieldValue('left_port');
    var right_port = block.getFieldValue('right_port');

    var code =
      'left_motor = motor' + left_port + '\n' +
      'right_motor = motor' + right_port + '\n';

    return code;
  };

  // Run motor
  this.run_motor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_unit = block.getFieldValue('unit');

    if (dropdown_unit == 'PERCENT') {
      var speedStr = '(' + value_speed + ' / 100) * 1050';
    } else if (dropdown_unit == 'DEGREES') {
      var speedStr = value_speed;
    } else if (dropdown_unit == 'ROTATIONS') {
      var speedStr = value_speed + ' * 360';
    }

    var code = 'motor' + dropdown_port + '.run(' + speedStr + ')\n';

    return code;
  }

  // Run motor for
  this.run_motor_for = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_unit = block.getFieldValue('unit');
    var value_duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC);
    var dropdown_unit2 = block.getFieldValue('unit2');

    if (dropdown_unit == 'PERCENT') {
      var speedStr = '(' + value_speed + ' / 100) * 1050';
    } else if (dropdown_unit == 'DEGREES') {
      var speedStr = value_speed;
    } else if (dropdown_unit == 'ROTATIONS') {
      var speedStr = value_speed + ' * 360';
    }

    if (dropdown_unit2 == 'ROTATIONS') {
      var cmdStr = 'run_angle';
      var durationStr = value_duration + ' * 360';
    } else if (dropdown_unit2 == 'DEGREES') {
      var cmdStr = 'run_angle';
      var durationStr = value_duration;
    } else if (dropdown_unit2 == 'SECONDS') {
      var cmdStr = 'run_time';
      var durationStr = value_duration + ' * 1000';
    } else if (dropdown_unit2 == 'MILLISECONDS') {
      var cmdStr = 'run_time';
      var durationStr = value_duration;
    }

    var code = 'motor' + dropdown_port + '.' + cmdStr + '(' + speedStr + ', ' + durationStr + ')\n';

    return code;
  }

  // Run motor to
  this.run_motor_to = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_unit = block.getFieldValue('unit');
    var value_degrees = Blockly.Python.valueToCode(block, 'degrees', Blockly.Python.ORDER_ATOMIC);

    if (dropdown_unit == 'PERCENT') {
      var speedStr = '(' + value_speed + ' / 100) * 1050';
    } else if (dropdown_unit == 'DEGREES') {
      var speedStr = value_speed;
    } else if (dropdown_unit == 'ROTATIONS') {
      var speedStr = value_speed + ' * 360';
    }

    var code = 'motor' + dropdown_port + '.run_target(' + speedStr + ', ' + value_degrees + ')\n';

    return code;
  }

  // Stop motor
  this.stop_motor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_stop_action = block.getFieldValue('stop_action');

    if (dropdown_stop_action == 'BRAKE') {
      var cmd = 'brake';
    } else if (dropdown_stop_action == 'COAST') {
      var cmd = 'stop';
    } else if (dropdown_stop_action == 'HOLD') {
      var cmd = 'hold';
    }

    var code = 'motor' + dropdown_port + '.' + cmd + '()\n';

    return code;
  };

  // get speed
  this.speed = function(block) {
    var dropdown_port = block.getFieldValue('port');

    var code = 'motor' + dropdown_port + '.speed()';

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // get position
  this.position = function(block) {
    var dropdown_port = block.getFieldValue('port');

    var code = 'motor' + dropdown_port + '.angle()';

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // reset position
  this.reset_motor = function(block) {
    var dropdown_port = block.getFieldValue('port');

    if (dropdown_port == 'BOTH') {
      var code =
        'left_motor.reset_angle(0)\n' +
        'right_motor.reset_angle(0)\n';
    } else {
      var code = 'motor' + dropdown_port + '.reset_angle(0)\n';
    }

    return code;
  };

  // color sensor value
  this.color_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'ColorSensor');
    var typeStr = '';

    if (dropdown_type == 'INTENSITY') {
      typeStr = 'reflection()';
    } else if (dropdown_type == 'COLOR') {
      typeStr = 'color()';
    } else if (dropdown_type == 'COLOR_NAME') {
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

    var code = 'color_sensor_in' + dropdown_port + '.' + typeStr;
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // ultrasonic
  this.ultrasonic_sensor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_units = block.getFieldValue('units');
    dropdown_port = self.getPort(dropdown_port, 'UltrasonicSensor');

    if (dropdown_units == 'CM') {
      var multiplier = ' * 0.1';
      var order = Blockly.Python.ORDER_MULTIPLICATIVE;
    } else if (dropdown_units == 'MM') {
      var multiplier = '';
      var order = Blockly.Python.ORDER_ATOMIC;
    }

    var code = 'ultrasonic_sensor_in' + dropdown_port + '.distance()' + multiplier;
    return [code, order];
  };

  // gyro
  this.gyro_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'GyroSensor');

    if (dropdown_type == 'ANGLE') {
      var typeStr = 'angle()';
    } else if (dropdown_type == 'RATE') {
      var typeStr = 'speed()';
    }
    var code = 'gyro_sensor_in' + dropdown_port + '.' + typeStr;

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro reset
  this.reset_gyro = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'GyroSensor');

    var code = 'gyro_sensor_in' + dropdown_port + '.reset_angle()\n';
    return code;
  };

  // say
  this.say = function(block) {
    var value_text = Blockly.Python.valueToCode(block, 'text', Blockly.Python.ORDER_ATOMIC);
    var dropdown_block = block.getFieldValue('block');

    var code = 'ev3.speaker.say(' + value_text + ')\n';
    return code;
  }

  // beep
  this.beep = function(block) {
    var dropdown_block = block.getFieldValue('block');

    var code = 'ev3.speaker.beep()\n';
    return code;
  }

  // play tone
  this.play_tone = function(block) {
    var value_frequency = Blockly.Python.valueToCode(block, 'frequency', Blockly.Python.ORDER_ATOMIC);
    var value_duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC);
    var dropdown_block = block.getFieldValue('block');

    var code = 'ev3.speaker.beep(' + value_frequency + ', ' + value_duration + ' * 1000)\n';
    return code;
  }

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

  // Exit
  this.exit = function(block) {
    var code = 'exit()\n';
    return code;
  };

  // time
  this.time = function(block) {
    var code = 'time.time()';

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gps
  this.gps_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'GPSSensor');

    if (dropdown_type == 'X') {
      var typeStr = 'x';
    } else if (dropdown_type == 'Y') {
      var typeStr = 'y';
    } else if (dropdown_type == 'ALTITUDE') {
      var typeStr = 'altitude';
    } else if (dropdown_type == 'POSITION') {
      var typeStr = 'position';
    }

    var code = 'gps_sensor_in' + dropdown_port + '.' + typeStr;

    return [code, Blockly.Python.ORDER_ATOMIC];
  }

  this.penDown = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'Pen');

    var code = 'pen_in' + dropdown_port + '.down()\n';
    return code;
  };

  this.penUp = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'Pen');

    var code = 'pen_in' + dropdown_port + '.up()\n';
    return code;
  };

  this.penSetColor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'Pen');

    var value_red = Blockly.Python.valueToCode(block, 'red', Blockly.Python.ORDER_ATOMIC);
    var value_green = Blockly.Python.valueToCode(block, 'green', Blockly.Python.ORDER_ATOMIC);
    var value_blue = Blockly.Python.valueToCode(block, 'blue', Blockly.Python.ORDER_ATOMIC);
    var code = 'pen_in' + dropdown_port + '.setColor(' + value_red + ', ' + value_green + ', ' + value_blue + ')\n';
    return code;
  };

  this.penSetWidth = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'Pen');

    var value_width = Blockly.Python.valueToCode(block, 'width', Blockly.Python.ORDER_ATOMIC);
    var code = 'pen_in' + dropdown_port + '.setWidth(' + value_width + ')\n';
    return code;
  };

  this.touch_state = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_state = block.getFieldValue('state');
    dropdown_port = self.getPort(dropdown_port, 'TouchSensor');

    var code;
    if (dropdown_state == 'PRESSED') {
      code = 'touch_sensor_in' + dropdown_port + '.pressed()';
    } else if (dropdown_state == 'RELEASED') {
      code = 'not touch_sensor_in' + dropdown_port + '.pressed()';
    }

    return [code, Blockly.Python.ORDER_LOGICAL_NOT];
  };

  this.wait_for_state = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_state = block.getFieldValue('state');
    dropdown_port = self.getPort(dropdown_port, 'TouchSensor');

    var code;
    if (dropdown_state == 'PRESSED') {
      code = 'while not touch_sensor_in' + dropdown_port + '.pressed(): pass\n';
    } else if (dropdown_state == 'RELEASED') {
      code = 'while touch_sensor_in' + dropdown_port + '.pressed(): pass\n';
    } else if (dropdown_state == 'BUMPED') {
      code = 'while not touch_sensor_in' + dropdown_port + '.pressed(): pass\n';
      code += 'while touch_sensor_in' + dropdown_port + '.pressed(): pass\n';
    }

    return code;
  };

  this.button_state = function(block) {
    const map_button = {
      'UP': 'Button.UP',
      'DOWN': 'Button.DOWN',
      'LEFT': 'Button.LEFT',
      'RIGHT': 'Button.RIGHT',
      'CENTER': 'Button.CENTER'
    };

    let button = map_button[block.getFieldValue('button')];
    let state = block.getFieldValue('state');

    if (state == 'PRESSED') {
      var code = button + ' in ev3.buttons.pressed()';
      return [code, Blockly.Python.ORDER_RELATIONAL];
    } else {
      var code = 'not ' + button + ' in ev3.buttons.pressed()';
      return [code, Blockly.Python.ORDER_RELATIONAL];
    }
  };

  this.wait_until_button = function(block) {
    const map_button = {
      'UP': 'Button.UP',
      'DOWN': 'Button.DOWN',
      'LEFT': 'Button.LEFT',
      'RIGHT': 'Button.RIGHT',
      'CENTER': 'Button.CENTER'
    };

    let button = map_button[block.getFieldValue('button')];
    let state = block.getFieldValue('state');

    let code = 'while '
    if (state == 'PRESSED') {
      code += 'not ' + button + ' in ev3.buttons.pressed():\n';
    } else {
      code += button + ' in ev3.buttons.pressed():\n';
    }
    code += '  pass\n';

    return code;
  };

  this.color = function(block) {
    // Pybricks doesn't use color name
    const map_to_param = {
      'BLACK': 'Color.BLACK',
      'BLUE': 'Color.BLUE',
      'GREEN': 'Color.GREEN',
      'YELLOW': 'Color.YELLOW',
      'RED': 'Color.RED',
      'WHITE': 'Color.WHITE',
      'BROWN': 'Color.BROWN',
    };

    let color = block.getFieldValue('color');

    var code = map_to_param[color];
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.wait_until = function(block) {
    var value_value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);

    let code = 'while not ' + value_value + ':\n    pass\n';
    return code;
  };
}

