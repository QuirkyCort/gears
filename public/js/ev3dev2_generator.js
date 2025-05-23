var ev3dev2_generator = new function() {
  var self = this;

  this.autoPorts = {
    ColorSensor: 1,
    UltrasonicSensor: 1,
    GyroSensor: 1,
    GPSSensor: 1,
    TouchSensor: 1,
    Pen: 1,
    CameraSensor: 1
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
    Blockly.Python['laser_sensor'] = self.laser_sensor;
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
    Blockly.Python['camera_capture_image'] = self.camera_capture_image;
    Blockly.Python['camera_get_rgb'] = self.camera_get_rgb;
    Blockly.Python['camera_get_hsv'] = self.camera_get_hsv;
    Blockly.Python['camera_find_blobs'] = self.camera_find_blobs;
    Blockly.Python['lidar_sensor'] = self.lidar_sensor;

    Blockly.Python['radio_send'] = self.radio_send;
    Blockly.Python['radio_available'] = self.radio_available;
    Blockly.Python['radio_read'] = self.radio_read;
    Blockly.Python['radio_read_content'] = self.radio_read_content;
    Blockly.Python['radio_empty'] = self.radio_empty;

    Blockly.Python['tw_fwd'] = self.tw_fwd;
    Blockly.Python['tw_rev'] = self.tw_rev;
    Blockly.Python['tw_left'] = self.tw_left;
    Blockly.Python['tw_right'] = self.tw_right;
    Blockly.Python['tw_color'] = self.tw_color;

    Blockly.Python['object_tracker'] = self.object_tracker;

    Blockly.Python['comment'] = self.comment;

    Blockly.Python['plotter_init'] = self.plotter_init;
    Blockly.Python['plotter_showHide'] = self.plotter_showHide;
    Blockly.Python['plotter_clear'] = self.plotter_clear;
    Blockly.Python['plotter_drawGrid'] = self.plotter_drawGrid;
    Blockly.Python['plotter_setColor'] = self.plotter_setColor;
    Blockly.Python['plotter_setPointSize'] = self.plotter_setPointSize;
    Blockly.Python['plotter_drawPoint'] = self.plotter_drawPoint;
    Blockly.Python['plotter_drawLine'] = self.plotter_drawLine;
    Blockly.Python['plotter_drawTriangle'] = self.plotter_drawTriangle;
  };

  // Generate python code
  this.genCode = function() {
    self.training_wheels = false;

    var i = 1;
    var sensor = robot.getComponentByPort('in' + i);
    while (sensor) {
      self.autoPorts[sensor.type] = i;
      i++;
      sensor = robot.getComponentByPort('in' + i);
    }

    let workspaceCode = Blockly.Python.workspaceToCode(blockly.workspace);

    let wheelCode = robot.processedOptions.wheels ?
    ('motorA = LargeMotor(OUTPUT_A)\n' +
    'motorB = LargeMotor(OUTPUT_B)\n' +
    'left_motor = motorA\n' +
    'right_motor = motorB\n' +
    'tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)\n' +
    'steering_drive = MoveSteering(OUTPUT_A, OUTPUT_B)\n') :
    '';
    let code =
      '#!/usr/bin/env python3\n' +
      `\n` +
      '# Import the necessary libraries\n' +
      'import time\n' +
      'import math\n' +
      'from ev3dev2.motor import *\n' +
      'from ev3dev2.sound import Sound\n' +
      'from ev3dev2.button import Button\n' +
      'from ev3dev2.sensor import *\n' +
      'from ev3dev2.sensor.lego import *\n' +
      'from ev3dev2.sensor.virtual import *\n' +
      '\n' +
      '# Create the sensors and motors objects\n' +
      wheelCode +
      '\n' +
      'spkr = Sound()\n' +
      'btn = Button()\n' +
      'radio = Radio()\n' +
      'obtr = ObjectTracker()\n' +
      '\n';

    var sensorsCode = '';
    i = 1;
    sensor = robot.getComponentByPort('in' + i);
    while (sensor) {
      if (sensor.type == 'ColorSensor') {
        sensorsCode += 'color_sensor_in' + i + ' = ColorSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'UltrasonicSensor') {
        sensorsCode += 'ultrasonic_sensor_in' + i + ' = UltrasonicSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'LaserRangeSensor') {
        sensorsCode += 'laser_sensor_in' + i + ' = LaserRangeSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'GyroSensor') {
        sensorsCode += 'gyro_sensor_in' + i + ' = GyroSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'GPSSensor') {
        sensorsCode += 'gps_sensor_in' + i + ' = GPSSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'TouchSensor') {
        sensorsCode += 'touch_sensor_in' + i + ' = TouchSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'Pen') {
        sensorsCode += 'pen_in' + i + ' = Pen(INPUT_' + i + ')\n';
      } else if (sensor.type == 'CameraSensor') {
        sensorsCode += 'camera_sensor_in' + i + ' = CameraSensor(INPUT_' + i + ')\n';
      } else if (sensor.type == 'LidarSensor') {
        sensorsCode += 'lidar_sensor_in' + i + ' = LidarSensor(INPUT_' + i + ')\n';
      }
      i++;
      sensor = robot.getComponentByPort('in' + i)
    }

    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var motorsCode = '';
    i = robot.processedOptions.wheels ? 3 : 1;
    var motor = null;
    while (motor = robot.getComponentByPort('out' + PORT_LETTERS[i])) {
      if (motor.type == 'MagnetActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Magnet\n';
      } else if (motor.type == 'ArmActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Arm\n';
      } else if (motor.type == 'SwivelActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Swivel\n';
      } else if (motor.type == 'LinearActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Linear Actuator\n';
      } else if (motor.type == 'PaintballLauncherActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Paintball Launcher\n';
      } else if (motor.type == 'WheelActuator') {
        motorsCode += 'motor' + PORT_LETTERS[i] + ' = LargeMotor(OUTPUT_' + PORT_LETTERS[i] + ') # Wheel Actuator\n';
      }
      i++;
    }

    code += sensorsCode + '\n';
    code += motorsCode + '\n';

    if (self.training_wheels) {
      code +=
        'from ev3dev2.Training_Wheels import Training_Wheels\n' +
        'training_wheels = Training_Wheels(gps_sensor_in4, gyro_sensor_in3, steering_drive)\n\n'
    }

    code += '# Here is where your code starts\n\n';

    code += workspaceCode;
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

  // Set motors for move steering and move tank
  this.set_movement_motors = function(block) {
    var left_port = block.getFieldValue('left_port');
    var right_port = block.getFieldValue('right_port');

    var code =
      'left_motor = motor' + left_port + '\n' +
      'right_motor = motor' + right_port + '\n' +
      'tank_drive = MoveTank(OUTPUT_' + left_port + ', OUTPUT_' + right_port + ')\n' +
      'steering_drive = MoveSteering(OUTPUT_' + left_port + ', OUTPUT_' + right_port + ')\n';

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
    var dropdown_block = block.getFieldValue('block');

    var block = '';
    if (dropdown_block == 'NO_BLOCK') {
      block = ', block=False';
    }

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
    } else if (dropdown_unit2 == 'MILLISECONDS') {
      var cmdStr = 'on_for_seconds';
      var durationStr = value_duration + ' / 1000';
    }

    var code = 'motor' + dropdown_port + '.' + cmdStr + '(' + speedStr + ', ' + durationStr + block + ')\n';

    return code;
  }

  // Run motor to
  this.run_motor_to = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var dropdown_unit = block.getFieldValue('unit');
    var value_degrees = Blockly.Python.valueToCode(block, 'degrees', Blockly.Python.ORDER_ATOMIC);
    var dropdown_block = block.getFieldValue('block');

    var block = '';
    if (dropdown_block == 'NO_BLOCK') {
      block = ', block=False';
    }

    if (dropdown_unit == 'PERCENT') {
      var speedStr = value_speed;
    } else if (dropdown_unit == 'DEGREES') {
      var speedStr = 'SpeedDPS(' + value_speed + ')';
    } else if (dropdown_unit == 'ROTATIONS') {
      var speedStr = 'SpeedRPS(' + value_speed + ')';
    }

    var code = 'motor' + dropdown_port + '.on_to_position(' + speedStr + ', ' + value_degrees + block + ')\n';

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
    dropdown_port = self.getPort(dropdown_port, 'ColorSensor');
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
    dropdown_port = self.getPort(dropdown_port, 'UltrasonicSensor');

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

  // laser. Same as ultrasonic, except for autoport
  this.laser_sensor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_units = block.getFieldValue('units');
    dropdown_port = self.getPort(dropdown_port, 'LaserRangeSensor');

    if (dropdown_units == 'CM') {
      var multiplier = '';
      var order = Blockly.Python.ORDER_ATOMIC;
    } else if (dropdown_units == 'MM') {
      var multiplier = ' * 10';
      var order = Blockly.Python.ORDER_MULTIPLICATIVE;
    }
    var code = 'laser_sensor_in' + dropdown_port + '.distance_centimeters' + multiplier;
    return [code, order];
  };

  // lidar
  this.lidar_sensor = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'LidarSensor');

    var code = 'lidar_sensor_in' + dropdown_port + '.get_distances()';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro
  this.gyro_sensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'GyroSensor');

    if (dropdown_type == 'ANGLE') {
      var typeStr = 'angle';
    } else if (dropdown_type == 'RATE') {
      var typeStr = 'rate';
    } else if (dropdown_type == 'PITCH_ANGLE') {
      var typeStr = 'pitch_angle';
    } else if (dropdown_type == 'PITCH_RATE') {
      var typeStr = 'pitch_rate';
    } else if (dropdown_type == 'ROLL_ANGLE') {
      var typeStr = 'roll_angle';
    } else if (dropdown_type == 'ROLL_RATE') {
      var typeStr = 'roll_rate';
    } else if (dropdown_type == 'HEADING') {
      var typeStr = 'heading';
    }
    var code = 'gyro_sensor_in' + dropdown_port + '.' + typeStr;

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // gyro reset
  this.reset_gyro = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'GyroSensor');

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

    var code = 'spkr.speak(' + value_text + '' + play_type + ')\n';
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

    if (dropdown_state == 'PRESSED') {
      var stateStr = 'is_pressed';
    } else if (dropdown_state == 'RELEASED') {
      var stateStr = 'is_released';
    }

    var code = 'touch_sensor_in' + dropdown_port + '.' + stateStr;
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.wait_for_state = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var dropdown_state = block.getFieldValue('state');
    dropdown_port = self.getPort(dropdown_port, 'TouchSensor');

    if (dropdown_state == 'PRESSED') {
      var stateStr = 'pressed';
    } else if (dropdown_state == 'RELEASED') {
      var stateStr = 'released';
    } else if (dropdown_state == 'BUMPED') {
      var stateStr = 'bump';
    }

    var code = 'touch_sensor_in' + dropdown_port + '.wait_for_' + stateStr + '()\n';
    return code;
  };

  this.button_state = function(block) {
    const map_button = {
      'UP': 'up',
      'DOWN': 'down',
      'LEFT': 'left',
      'RIGHT': 'right',
      'CENTER': 'enter'
    };

    let button = map_button[block.getFieldValue('button')];
    let state = block.getFieldValue('state');

    if (state == 'PRESSED') {
      var code = 'btn.' + button;
      return [code, Blockly.Python.ORDER_ATOMIC];
    } else {
      var code = 'not btn.' + button;
      return [code, Blockly.Python.ORDER_RELATIONAL];
    }
  };

  this.wait_until_button = function(block) {
    const map_button = {
      'UP': 'up',
      'DOWN': 'down',
      'LEFT': 'left',
      'RIGHT': 'right',
      'CENTER': 'enter'
    };

    let button = map_button[block.getFieldValue('button')];
    let state = block.getFieldValue('state');

    let code;
    if (state == 'PRESSED') {
      code = 'btn.wait_for_pressed';
    } else {
      code = 'btn.wait_for_released'
    }

    code += '([\'' + button + '\'])\n';
    return code;
  };

  this.camera_capture_image = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'CameraSensor');

    var code = 'camera_sensor_in' + dropdown_port + '.capture_image()\n';
    return code;
  };

  this.camera_get_rgb = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'CameraSensor');

    var code = 'camera_sensor_in' + dropdown_port + '.get_rgb()';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.camera_get_hsv = function(block) {
    var dropdown_port = block.getFieldValue('port');
    dropdown_port = self.getPort(dropdown_port, 'CameraSensor');

    var code = 'camera_sensor_in' + dropdown_port + '.get_hsv()';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.camera_find_blobs = function(block) {
    var dropdown_port = block.getFieldValue('port');
    var minH = Blockly.Python.valueToCode(block, 'minH', Blockly.Python.ORDER_ATOMIC);
    var maxH = Blockly.Python.valueToCode(block, 'maxH', Blockly.Python.ORDER_ATOMIC);
    var minS = Blockly.Python.valueToCode(block, 'minS', Blockly.Python.ORDER_ATOMIC);
    var maxS = Blockly.Python.valueToCode(block, 'maxS', Blockly.Python.ORDER_ATOMIC);
    var minV = Blockly.Python.valueToCode(block, 'minV', Blockly.Python.ORDER_ATOMIC);
    var maxV = Blockly.Python.valueToCode(block, 'maxV', Blockly.Python.ORDER_ATOMIC);
    var pixels_threshold = Blockly.Python.valueToCode(block, 'pixels_threshold', Blockly.Python.ORDER_ATOMIC);
    dropdown_port = self.getPort(dropdown_port, 'CameraSensor');

    var code = 'camera_sensor_in' + dropdown_port + '.find_blobs((' + minH + ', ' + maxH + ', ' + minS + ', ' + maxS + ', ' + minV + ', ' + maxV + '), ' + pixels_threshold + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.radio_send = function(block) {
    var dropdown_robot = block.getFieldValue('robot');
    var text_mailbox = block.getFieldValue('mailbox');
    var value_value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);

    if (dropdown_robot == 'TEAM') {
      dest = '\'team\'';
    } else if (dropdown_robot == 'ALL') {
      dest = '\'all\'';
    } else {
      dest = dropdown_robot;
    }

    var code = 'radio.send(' + dest + ', \'' + text_mailbox + '\', ' + value_value + ')\n';
    return code;
  };

  this.radio_available = function(block) {
    var text_mailbox = block.getFieldValue('mailbox');

    var code = 'radio.available(\'' + text_mailbox + '\')';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.radio_read = function(block) {
    var text_mailbox = block.getFieldValue('mailbox');

    var code = 'radio.read(\'' + text_mailbox + '\')';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.radio_read_content = function(block) {
    var text_mailbox = block.getFieldValue('mailbox');

    var code = 'radio.read(\'' + text_mailbox + '\')[0]';
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.radio_empty = function(block) {
    var text_mailbox = block.getFieldValue('mailbox');

    var code = 'radio.empty(\'' + text_mailbox + '\')\n';
    return code;
  };

  this.object_tracker = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var dropdown_robot = block.getFieldValue('robot');

    if (dropdown_type == 'X') {
      var typeStr = 'x';
    } else if (dropdown_type == 'Y') {
      var typeStr = 'y';
    } else if (dropdown_type == 'ALTITUDE') {
      var typeStr = 'altitude';
    } else if (dropdown_type == 'POSITION') {
      var typeStr = 'position';
    } else if (dropdown_type == 'VX') {
      var typeStr = 'vx';
    } else if (dropdown_type == 'VY') {
      var typeStr = 'vy';
    } else if (dropdown_type == 'VALTITUDE') {
      var typeStr = 'valtitude';
    } else if (dropdown_type == 'VELOCITY') {
      var typeStr = 'velocity';
    }

    if (dropdown_robot == 'TEAM') {
      var target = '\'team\'';
    } else if (dropdown_robot == 'OPPONENT1') {
      var target = '\'opponent1\'';
    } else if (dropdown_robot == 'OPPONENT2') {
      var target = '\'opponent2\'';
    } else if (dropdown_robot == 'SELF') {
      var target = '\'self\'';
    } else if (dropdown_robot == 'BALL') {
      var target = '\'ball\'';
    }else {
      var target = dropdown_robot;
    }

    var code = 'obtr' + '.' + typeStr + '(' + target + ')';

    return [code, Blockly.Python.ORDER_ATOMIC];
  }

  this.color = function(block) {
    const map_to_number = {
      'BLACK': 1,
      'BLUE': 2,
      'GREEN': 3,
      'YELLOW': 4,
      'RED': 5,
      'WHITE': 6,
      'BROWN': 7,
    };

    const map_to_name = {
      'BLACK': 'Black',
      'BLUE': 'Blue',
      'GREEN': 'Green',
      'YELLOW': 'Yellow',
      'RED': 'Red',
      'WHITE': 'White',
      'BROWN': 'Brown',
    };

    let color = block.getFieldValue('color');
    let type = block.getFieldValue('type');

    if (type == 'NUMBER') {
      var code = map_to_number[color];
      return [code, Blockly.Python.ORDER_ATOMIC];
    } else {
      var code = '\'' + map_to_name[color] + '\'';
      return [code, Blockly.Python.ORDER_ATOMIC];
    }
  };

  this.wait_until = function(block) {
    var value_value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);

    let code = 'while not ' + value_value + ':\n    pass\n';
    return code;
  };

  this.tw_fwd = function(block) {
    self.training_wheels = true;

    var code = 'training_wheels.fwd_cm(25)\n';
    return code;
  };

  this.tw_rev = function(block) {
    self.training_wheels = true;

    var code = 'training_wheels.rev_cm(25)\n';
    return code;
  };

  this.tw_left = function(block) {
    self.training_wheels = true;

    var code = 'training_wheels.turn_left()\n';
    return code;
  };

  this.tw_right = function(block) {
    self.training_wheels = true;

    var code = 'training_wheels.turn_right()\n';
    return code;
  };

  this.tw_color = function(block) {
    let dropdown_port = self.getPort("AUTO", 'ColorSensor');
    let typeStr = 'color';

    const map_to_number = {
      'BLACK': 1,
      'BLUE': 2,
      'GREEN': 3,
      'YELLOW': 4,
      'RED': 5,
      'WHITE': 6,
      'BROWN': 7,
    };

    let color = block.getFieldValue('color');

    var code = 'color_sensor_in' + dropdown_port + '.' + typeStr + ' == ' + map_to_number[color];
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  this.comment = function(block) {
    var value = block.getFieldValue('value');

    // var code = '\n# ' + value + '\n\n';
    var code = '';

    for (let line of value.split('\n')) {
      code += '\n# ' + line;
    }

    code += '\n\n';

    return code;
  };

  // Plotter
  this.plotter_init = function(block) {
    let minX = block.getFieldValue('minX');
    let minY = block.getFieldValue('minY');
    let maxX = block.getFieldValue('maxX');
    let maxY = block.getFieldValue('maxY');

    let code = 'plotter = simPython.Plotter(' + minX + ', ' + minY + ', ' + maxX + ', ' + maxY + ')\n';
    return code;
  };

  this.plotter_showHide = function(block) {
    let type = block.getFieldValue('type');

    let code;
    if (type == 'SHOW') {
      code = 'plotter.show()\n';
    } else {
      code = 'plotter.hide()\n';
    }
    return code;
  };

  this.plotter_clear = function(block) {
    let code = 'plotter.clear()\n';
    return code;
  };

  this.plotter_drawGrid = function(block) {
    let type = block.getFieldValue('type');
    let size = block.getFieldValue('size');

    if (type == 'CARTESIAN') {
      type = '';
    } else {
      type = 'Polar';
    }

    let code = 'plotter.drawGrid' + type + '(' + size + ')\n';
    return code;
  };

  this.plotter_setColor = function(block) {
    let color = block.getFieldValue('color');

    let code = 'plotter.setColor(\'' + color + '\')\n';
    return code;
  };

  this.plotter_setPointSize = function(block) {
    let size = Blockly.Python.valueToCode(block, 'size', Blockly.Python.ORDER_ATOMIC);

    let code = 'plotter.setPointSize(' + size + ')\n';
    return code;
  };

  this.plotter_drawPoint = function(block) {
    let x = Blockly.Python.valueToCode(block, 'x', Blockly.Python.ORDER_ATOMIC);
    let y = Blockly.Python.valueToCode(block, 'y', Blockly.Python.ORDER_ATOMIC);

    let code = 'plotter.drawPoint(' + x + ', ' + y + ')\n';
    return code;
  };

  this.plotter_drawLine = function(block) {
    let x1 = Blockly.Python.valueToCode(block, 'x1', Blockly.Python.ORDER_ATOMIC);
    let y1 = Blockly.Python.valueToCode(block, 'y1', Blockly.Python.ORDER_ATOMIC);
    let x2 = Blockly.Python.valueToCode(block, 'x2', Blockly.Python.ORDER_ATOMIC);
    let y2 = Blockly.Python.valueToCode(block, 'y2', Blockly.Python.ORDER_ATOMIC);

    let code = 'plotter.drawLine(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ')\n';
    return code;
  };

  this.plotter_drawTriangle = function(block) {
    let x = Blockly.Python.valueToCode(block, 'x', Blockly.Python.ORDER_ATOMIC);
    let y = Blockly.Python.valueToCode(block, 'y', Blockly.Python.ORDER_ATOMIC);
    let dir = Blockly.Python.valueToCode(block, 'dir', Blockly.Python.ORDER_ATOMIC);

    let code = 'plotter.drawTriangle(' + x + ', ' + y + ', ' + dir + ')\n';
    return code;
  };

}

