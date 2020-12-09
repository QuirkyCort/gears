var ev3dev2_generator = new function() {
  var self = this;

  // Load Python generators
  this.load = function() {
    Blockly.Python['when_started'] = self.when_started;
    Blockly.Python['move_tank'] = self.move_tank;
    Blockly.Python['move_tank_for'] = self.move_tank_for;
    Blockly.Python['move_steering'] = self.move_steering;
    Blockly.Python['move_steering_for'] = self.move_steering_for;
    Blockly.Python['stop'] = self.stop;
    Blockly.Python['run_motor'] = self.run_motor;
    Blockly.Python['run_motor_for'] = self.run_motor_for;
    Blockly.Python['run_motor_to'] = self.run_motor_to;
    Blockly.Python['stop_motor'] = self.stop_motor;
    Blockly.Python['speed'] = self.speed;
    Blockly.Python['position'] = self.position;
    Blockly.Python['reset_motor'] = self.reset_motor;
    Blockly.Python['color_sensor'] = self.color_sensor;
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
    Blockly.Python['addPen'] = self.addPen;
    Blockly.Python['penDown'] = self.penDown;
    Blockly.Python['penUp'] = self.penUp;
    Blockly.Python['penSetColor'] = self.penSetColor;
    Blockly.Python['penSetWidth'] = self.penSetWidth;
  };

  // Generate python code
  this.genCode = function() {
    let code =
      '#!/usr/bin/env python3\n' +
      `\n` +
      '# Import the necessary libraries\n' +
      'import time\n' +
      'import math\n' +
      'from ev3dev2.motor import *\n' +
      'from ev3dev2.sound import Sound\n' +
      'from ev3dev2.sensor import *\n' +
      'from ev3dev2.sensor.lego import *\n' +
      'from ev3dev2.sensor.virtual import *\n' +
      '\n' +
      '# Create the sensors and motors objects\n' +
      'motorA = LargeMotor(OUTPUT_A)\n' +
      'motorB = LargeMotor(OUTPUT_B)\n' +
      'left_motor = motorA\n' +
      'right_motor = motorB\n' +
      'tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)\n' +
      'steering_drive = MoveSteering(OUTPUT_A, OUTPUT_B)\n' +
      '\n' +
      'spkr = Sound()\n' +
      '\n';

    var sensorsCode = '';
    var i = 1;
    var sensor = null;
    while (sensor = robot.getComponentByPort('in' + i)) {
      if (sensor.type == 'ColorSensor') {
        sensorsCode += 'color_sensor_in' + i + ' = ColorSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'UltrasonicSensor') {
        sensorsCode += 'ultrasonic_sensor_in' + i + ' = UltrasonicSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'LaserRangeSensor') {
        sensorsCode += 'ultrasonic_sensor_in' + i + ' = UltrasonicSensor(INPUT_' + i + ') # Laser Range Sensor\n';
      } else if (sensor.type == 'GyroSensor') {
        sensorsCode += 'gyro_sensor_in' + i + ' = GyroSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'GPSSensor') {
        sensorsCode += 'gps_sensor_in' + i + ' = GPSSensor(INPUT_' + i + ')\n';
      }
      i++;
    }

    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var motorsCode = '';
    i = 3;
    var motor = null;
    while (motor = robot.getComponentByPort('out' + PORT_LETTERS[i])) {
      if (motor.type == 'MagnetActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Magnet\n';
      } else if (motor.type == 'ArmActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Arm\n';
      } else if (motor.type == 'SwivelActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Swivel\n';
      } else if (motor.type == 'PaintballLauncherActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Paintball Launcher\n';
      }
      i++;
    }

    code += sensorsCode + '\n';
    code += motorsCode + '\n';

    code += '# Here is where your code starts\n\n';

    code += Blockly.Python.workspaceToCode(blockly.workspace);
    return code
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
    var dropdown_unit = block.getFieldValue('units');

    if (dropdown_unit == 'PERCENT') {
      var leftStr = value_left;
      var rightStr = value_right;
    } else if (dropdown_unit == 'DEGREES') {
      var leftStr = 'SpeedDPS(' + value_left + ')';
      var rightStr = 'SpeedDPS(' + value_right + ')';
    } else if (dropdown_unit == 'ROTATIONS') {
      var leftStr = 'SpeedRPS(' + value_left + ')';
      var rightStr = 'SpeedRPS(' + value_right + ')';
    }

    var code = 'tank_drive.on(' + leftStr + ', ' + rightStr + ')\n';

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
      var leftStr = value_left;
      var rightStr = value_right;
    } else if (dropdown_units == 'DEGREES') {
      var leftStr = 'SpeedDPS(' + value_left + ')';
      var rightStr = 'SpeedDPS(' + value_right + ')';
    } else if (dropdown_units == 'ROTATIONS') {
      var leftStr = 'SpeedRPS(' + value_left + ')';
      var rightStr = 'SpeedRPS(' + value_right + ')';
    }

    if (dropdown_units2 == 'ROTATIONS') {
      var cmdStr = 'on_for_rotations';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'DEGREES') {
      var cmdStr = 'on_for_degrees';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'SECONDS') {
      var cmdStr = 'on_for_seconds';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'MILLISECONDS') {
      var cmdStr = 'on_for_seconds';
      var durationStr = value_duration + ' / 1000';
    }

    var code = 'tank_drive.' + cmdStr + '(' + leftStr + ', ' + rightStr + ', ' + durationStr + ')\n';

    return code;
  };

  // Move steering
  this.move_steering = function(block) {
    var value_steering = Blockly.Python.valueToCode(block, 'steering', Blockly.Python.ORDER_ATOMIC);
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');

    if (dropdown_units == 'PERCENT') {
      var speedStr = value_speed;
    } else if (dropdown_units == 'DEGREES') {
      var speedStr = 'SpeedDPS(' + value_speed + ')';
    } else if (dropdown_units == 'ROTATIONS') {
      var speedStr = 'SpeedRPS(' + value_speed + ')';
    }

    var code = 'steering_drive.on(' + value_steering + ', ' + speedStr + ')\n';

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
      var speedStr = value_speed;
    } else if (dropdown_units == 'DEGREES') {
      var speedStr = 'SpeedDPS(' + value_speed + ')';
    } else if (dropdown_units == 'ROTATIONS') {
      var speedStr = 'SpeedRPS(' + value_speed + ')';
    }

    if (dropdown_units2 == 'ROTATIONS') {
      var cmdStr = 'on_for_rotations';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'DEGREES') {
      var cmdStr = 'on_for_degrees';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'SECONDS') {
      var cmdStr = 'on_for_seconds';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'MILLISECONDS') {
      var cmdStr = 'on_for_seconds';
      var durationStr = value_duration + ' / 1000';
    }

    var code = 'steering_drive.' + cmdStr + '(' + value_steering + ', ' + speedStr + ', ' + durationStr + ')\n';

    return code;
  };

  // Stop
  this.stop = function(block) {
    var dropdown_stop_action = block.getFieldValue('stop_action');

    if (dropdown_stop_action == 'BRAKE') {
      var brake = 'True';
    } else if (dropdown_stop_action == 'COAST') {
      var brake = 'False';
    } else if (dropdown_stop_action == 'HOLD') {
      var brake = 'True';
    }

    var code = 'tank_drive.off(brake=' + brake + ')\n';

    return code;
  };

  // Run motor
  this.run_motor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_unit = block.getFieldValue('unit');

    if (dropdown_unit == 'PERCENT') {
      var speedStr = value_speed;
    } else if (dropdown_unit == 'DEGREES') {
      var speedStr = 'SpeedDPS(' + value_speed + ')';
    } else if (dropdown_unit == 'ROTATIONS') {
      var speedStr = 'SpeedRPS(' + value_speed + ')';
    }

    var code = 'motor' + dropdown_port + '.on(' + speedStr + ')\n';

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
      var speedStr = value_speed;
    } else if (dropdown_unit == 'DEGREES') {
      var speedStr = 'SpeedDPS(' + value_speed + ')';
    } else if (dropdown_unit == 'ROTATIONS') {
      var speedStr = 'SpeedRPS(' + value_speed + ')';
    }

    if (dropdown_unit2 == 'ROTATIONS') {
      var cmdStr = 'on_for_rotations';
      var durationStr = value_duration;
    } else if (dropdown_unit2 == 'DEGREES') {
      var cmdStr = 'on_for_degrees';
      var durationStr = value_duration;
    } else if (dropdown_unit2 == 'SECONDS') {
      var cmdStr = 'on_for_seconds';
      var durationStr = value_duration;
    } else if (dropdown_units2 == 'MILLISECONDS') {
      var cmdStr = 'on_for_seconds';
      var durationStr = value_duration + ' / 1000';
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
      var speedStr = value_speed;
    } else if (dropdown_unit == 'DEGREES') {
      var speedStr = 'SpeedDPS(' + value_speed + ')';
    } else if (dropdown_unit == 'ROTATIONS') {
      var speedStr = 'SpeedRPS(' + value_speed + ')';
    }

    var code = 'motor' + dropdown_port + '.on_to_position(' + speedStr + ', ' + value_degrees + ')\n';

    return code;
  }

  // Stop motor
  this.stop_motor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_stop_action = block.getFieldValue('stop_action');

    if (dropdown_stop_action == 'BRAKE') {
      var brake = 'True';
    } else if (dropdown_stop_action == 'COAST') {
      var brake = 'False';
    } else if (dropdown_stop_action == 'HOLD') {
      var brake = 'True';
    }

    var code = 'motor' + dropdown_port + '.off(brake=' + brake + ')\n';

    return code;
  };

  // get speed
  this.speed = function(block) {
    var dropdown_port = block.getFieldValue('port');

    var code = 'motor' + dropdown_port + '.speed';

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // get position
  this.position = function(block) {
    var dropdown_port = block.getFieldValue('port');

    var code = 'motor' + dropdown_port + '.position';

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // reset position
  this.reset_motor = function(block) {
    var dropdown_port = block.getFieldValue('port');

    if (dropdown_port == 'BOTH') {
      var code =
        'left_motor.position = 0\n' +
        'right_motor.position = 0\n';
    } else {
      var code = 'motor' + dropdown_port + '.position = 0\n';
    }

    return code;
  };

  // color sensor value
  this.color_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var dropdown_port = block.getFieldValue('port');
    var typeStr = '';

    if (dropdown_type == 'INTENSITY') {
      typeStr = 'reflected_light_intensity';
    } else if (dropdown_type == 'COLOR') {
      typeStr = 'color';
    } else if (dropdown_type == 'COLOR_NAME') {
      typeStr = 'color_name';
    } else if (dropdown_type == 'RED') {
      typeStr = 'rgb[0]';
    } else if (dropdown_type == 'GREEN') {
      typeStr = 'rgb[1]';
    } else if (dropdown_type == 'BLUE') {
      typeStr = 'rgb[2]';
    } else if (dropdown_type == 'RGB') {
      typeStr = 'rgb';
    }

    var code = 'color_sensor_in' + dropdown_port + '.' + typeStr;
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // ultrasonic
  this.ultrasonic_sensor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_units = block.getFieldValue('units');

    if (dropdown_units == 'CM') {
      var multiplier = '';
      var order = Blockly.Python.ORDER_ATOMIC;
    } else if (dropdown_units == 'MM') {
      var multiplier = ' * 10';
      var order = Blockly.Python.ORDER_MULTIPLICATIVE;
    }
    var code = 'ultrasonic_sensor_in' + dropdown_port + '.distance_centimeters' + multiplier;
    return [code, order];
  };

  // gyro
  this.gyro_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var dropdown_port = block.getFieldValue('port')

    if (dropdown_type == 'ANGLE') {
      var typeStr = 'angle';
    } else if (dropdown_type == 'RATE') {
      var typeStr = 'rate';
    }
    var code = 'gyro_sensor_in' + dropdown_port + '.' + typeStr;

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro reset
  this.reset_gyro = function(block) {
    var dropdown_port = block.getFieldValue('port');

    var code = 'gyro_sensor_in' + dropdown_port + '.reset()\n';
    return code;
  };

  // say
  this.say = function(block) {
    var value_text = Blockly.Python.valueToCode(block, 'text', Blockly.Python.ORDER_ATOMIC);
    var dropdown_block = block.getFieldValue('block');

    if (dropdown_block == 'NO_BLOCK') {
      var play_type = ', play_type=Sound.PLAY_NO_WAIT_FOR_COMPLETE';
    } else {
      var play_type = '';
    }

    var code = 'spkr.speak("' + value_text + '"' + play_type + ')\n';
    return code;
  }

  // beep
  this.beep = function(block) {
    var dropdown_block = block.getFieldValue('block');

    if (dropdown_block == 'NO_BLOCK') {
      var play_type = 'play_type=Sound.PLAY_NO_WAIT_FOR_COMPLETE';
    } else {
      var play_type = '';
    }

    var code = 'spkr.beep(' + play_type + ')\n';
    return code;
  }

  // play tone
  this.play_tone = function(block) {
    var value_frequency = Blockly.Python.valueToCode(block, 'frequency', Blockly.Python.ORDER_ATOMIC);
    var value_duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC);
    var dropdown_block = block.getFieldValue('block');

    if (dropdown_block == 'NO_BLOCK') {
      var play_type = ', play_type=Sound.PLAY_NO_WAIT_FOR_COMPLETE';
    } else {
      var play_type = '';
    }

    var code = 'spkr.play_tone(' + value_frequency + ', ' + value_duration + play_type + ')\n';
    return code;
  }

  // Sleep
  this.sleep = function(block) {
    var value_seconds = Blockly.Python.valueToCode(block, 'seconds', Blockly.Python.ORDER_ATOMIC);
    var dropdown_units = block.getFieldValue('units');

    var code = 'time.sleep(' + value_seconds;
    if (dropdown_units == 'SECONDS') {
      code += ')\n';
    } else if (dropdown_units == 'MILLISECONDS') {
      code += ' / 1000)\n';
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

  this.addPen = function(block) {
    var code = 'from ev3dev2.pen import *\npen = Pen()\npen.addPen()\n'
    return code;
  };

  this.penDown = function(block) {
    var code = 'pen.down()\n';
    return code;
  };
  
  this.penUp = function(block) {
    var code = 'pen.up()\n';
    return code;
  };

  this.penSetColor = function(block) {
    var value_red = Blockly.Python.valueToCode(block, 'red', Blockly.Python.ORDER_ATOMIC);
    var value_green = Blockly.Python.valueToCode(block, 'green', Blockly.Python.ORDER_ATOMIC);
    var value_blue = Blockly.Python.valueToCode(block, 'blue', Blockly.Python.ORDER_ATOMIC);
    var code = 'pen.setColor(' + value_red + ', ' + value_green + ', ' + value_blue + ')\n';
    return code;
  };

  this.penSetWidth = function(block) {
    var value_width = Blockly.Python.valueToCode(block, 'width', Blockly.Python.ORDER_ATOMIC);
    var code = 'pen.setWidth(' + value_width + ')\n';
    return code;
  };
  
}

