var blockly = new function() {
  var self = this;
  var options = {
    toolbox : null,
    collapse : true,
    comments : true,
    disable : true,
    maxBlocks : Infinity,
    trashcan : false,
    horizontalLayout : false,
    toolboxPosition : 'start',
    css : true,
    media : 'https://blockly-demo.appspot.com/static/media/',
    rtl : false,
    scrollbars : true,
    sounds : true,
    oneBasedIndex : true
  };

  this.unsaved = false;

  // Run on page load
  this.init = function() {
    Blockly.geras.Renderer.prototype.makeConstants_ = function() {
      var constants = new Blockly.geras.ConstantProvider();
      constants.ADD_START_HATS = true;
      return constants;
    };

    self.loadCustomBlocks();
    self.loadToolBox();
    self.loadPythonGenerators();
  };

  // Load toolbox
  this.loadToolBox = function() {
    return fetch('toolbox.xml')
      .then(response => response.text())
      .then(function(response) {
        var xml = (new DOMParser()).parseFromString(response, "text/xml");
        options.toolbox = xml.getElementById('toolbox');
        self.workspace = Blockly.inject('blocklyDiv', options);

        var workspaceBlocks = document.getElementById('workspaceBlocks');
        Blockly.Xml.domToWorkspace(workspaceBlocks, self.workspace);

        self.workspace.addChangeListener(Blockly.Events.disableOrphans);
        self.loadLocalStorage();
        setTimeout(function(){
          self.workspace.addChangeListener(self.checkModified);
        }, 2000);
      });
  };

  // Load custom blocks
  this.loadCustomBlocks = function() {
    return fetch('customBlocks.json')
      .then(response => response.json())
      .then(function(response) {
        Blockly.defineBlocksWithJsonArray(response);
      });
  };

  // Mark workspace as unsaved
  this.checkModified = function(e) {
    if (e.type != Blockly.Events.UI) {
      self.unsaved = true;
      blocklyPanel.showSave();
    }
  };

  // Save to local storage
  this.saveLocalStorage = function() {
    if (self.workspace && self.unsaved) {
      self.unsaved = false;
      blocklyPanel.hideSave();
      var xml = Blockly.Xml.workspaceToDom(self.workspace);
      var xmlText = Blockly.Xml.domToText(xml);
      localStorage.setItem('blocklyXML', xmlText);
    }
  };

  // Load from local storage
  this.loadLocalStorage = function() {
    var xmlText = localStorage.getItem('blocklyXML');
    if (xmlText) {
      var xml = Blockly.Xml.textToDom(xmlText);
      self.workspace.clear()
      Blockly.Xml.domToWorkspace(xml, self.workspace);
    }
  };

  // Load Python generators
  this.loadPythonGenerators = function() {
    Blockly.Python['move'] = self.pythonMove;
    Blockly.Python['print'] = self.pythonPrint;
    Blockly.Python['when_started'] = self.pythonStart;
    Blockly.Python['sleep'] = self.pythonSleep;
    Blockly.Python['stop'] = self.pythonStop;
    Blockly.Python['move_steering'] = self.pythonMoveSteering;
    Blockly.Python['exit'] = self.pythonExit;
    Blockly.Python['position'] = self.pythonPosition;
    Blockly.Python['reset_motor'] = self.pythonResetMotor;
    Blockly.Python['move_tank'] = self.pythonMoveTank;
    Blockly.Python['color_sensor'] = self.pythonColorSensor;
  };

  // Generate python code
  this.genPython = function() {
    let code =
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
      }
      i++;
    }

    code += sensorsCode + '\n';

    code += Blockly.Python.workspaceToCode(Blockly.getMainWorkspace());
    return code
  };


  //
  // Python Generators
  //

  // Move
  this.pythonMove = function(block) {
    var dropdown_direction = block.getFieldValue('direction');
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    if (dropdown_direction == 'REVERSE') {
      value_speed *= -1;
    }
    var code = 'steering_drive.on(0, ' + value_speed + ')\n';
    return code;
  };

  // Print
  this.pythonPrint = function(block) {
    var value_text = Blockly.Python.valueToCode(block, 'text', Blockly.Python.ORDER_ATOMIC);
    var code = 'print(' + value_text + ')\n';
    return code;
  };

  // Start
  this.pythonStart = function(block) {
    var code = '';
    return code;
  };

  // Sleep
  this.pythonSleep = function(block) {
    var value_seconds = Blockly.Python.valueToCode(block, 'seconds', Blockly.Python.ORDER_ATOMIC);
    var code = 'time.sleep(' + value_seconds + ')\n';
    return code;
  };

  // Stop
  this.pythonStop = function(block) {
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
  this.pythonMoveSteering = function(block) {
    var value_steering = Blockly.Python.valueToCode(block, 'steering', Blockly.Python.ORDER_ATOMIC);
    var value_speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
    var code = 'steering_drive.on(' + value_steering + ', ' + value_speed + ')\n';
    return code;
  };

  // Exit
  this.pythonExit = function(block) {
    var code = 'exit()\n';
    return code;
  };

  // get position
  this.pythonPosition = function(block) {
    var dropdown_motor = block.getFieldValue('motor');
    if (dropdown_motor == 'LEFT') {
      var code = 'left_motor.position';
    } else {
      var code = 'right_motor.position';
    }

    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // reset position
  this.pythonResetMotor = function(block) {
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
  this.pythonMoveTank = function(block) {
    var value_left = Blockly.Python.valueToCode(block, 'left', Blockly.Python.ORDER_ATOMIC);
    var value_right = Blockly.Python.valueToCode(block, 'right', Blockly.Python.ORDER_ATOMIC);
    var code = 'tank_drive.on(' + value_left + ', ' + value_right + ')\n';
    return code;
  };

  // color sensor value
  this.pythonColorSensor = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);
    var typeStr = '';

    if (dropdown_type == 'INTENSITY') {
      typeStr = 'reflected_light_intensity';
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
}

// Init class
blockly.init();
