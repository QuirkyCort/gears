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
    fetch('toolbox.xml')
      .then(response => response.text())
      .then(function(response) {
        var xml = (new DOMParser()).parseFromString(response, "text/xml");
        options.toolbox = xml.getElementById('toolbox');
        self.workspace = Blockly.inject('blocklyDiv', options);

        var workspaceBlocks = document.getElementById('workspaceBlocks');
        Blockly.Xml.domToWorkspace(workspaceBlocks, self.workspace);

        self.workspace.addChangeListener(Blockly.Events.disableOrphans);
      });
  };

  // Load custom blocks
  this.loadCustomBlocks = function() {
    fetch('customBlocks.json')
      .then(response => response.json())
      .then(function(response) {
        Blockly.defineBlocksWithJsonArray(response);
      });
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
  };

  // Generate python code
  this.genPython = function() {
    let code =
      'import time\n' +
      'from ev3dev2.motor import MoveSteering, OUTPUT_B, OUTPUT_C\n\n';
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
    var code = 'steering_drive = MoveSteering(OUTPUT_B, OUTPUT_C)\n\n';
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
}

// Init class
blockly.init();
