var world_challenges = new function() {
  World_Base.call(this);
  this.parent = {};
  for (p in this) {
    this.parent[p] = this[p];
  }

  var self = this;

  this.name = 'challenges';
  this.shortDescription = 'Challenges';
  this.longDescription =
    '<p>This world contains various challenges.</p>' +
    '<p>A completion code is issued for each completed challenge. This can be used to track students progress.</p>';
  this.thumbnail = 'images/worlds/challenge.jpg';

  this.optionsConfigurations = [
    {
      option: 'jsonFile',
      title: 'Select Challenges',
      type: 'select',
      options: [
        ['Basic: Move', 'worlds/challenges/basic-1.json?v=36019081'],
        ['Basic: Sequential Movements', 'worlds/challenges/basic-2.json?v=6b84cb3c'],
        ['Basic: Move-Turn-Move', 'worlds/challenges/basic-2a.json?v=c0c1abd2'],
        ['Basic: Turns 1', 'worlds/challenges/basic-2b.json?v=3c1928b8'],
        ['Basic: Turns 2', 'worlds/challenges/basic-3.json?v=475b7598'],
        ['Basic: Curve Turn', 'worlds/challenges/basic-4.json?v=a86689f6'],
        ['Maze: 3x3 Red', 'worlds/challenges/maze33-1.json?v=70f038b9'],
        ['Maze: 3x3 Pink', 'worlds/challenges/maze33-2.json?v=5efa7436'],
        ['Maze: 4x4 Red', 'worlds/challenges/maze44-1.json?v=5f7438d4'],
        ['Maze: 4x4 Pink', 'worlds/challenges/maze44-2.json?v=513d8b73'],
        ['Actuators: Forklift 0', 'worlds/challenges/forklift-0.json?v=5385c933'],
        ['Actuators: Forklift 1', 'worlds/challenges/forklift-1.json?v=6212821e'],
        ['Actuators: Forklift 2', 'worlds/challenges/forklift-2.json?v=75bbe870'],
        ['Sensors: Stop on Red', 'worlds/challenges/sensor-color-stop.json?v=b61db0d8'],
        ['Sensors: Don\'t Hit the Wall', 'worlds/challenges/sensor-ultrasonic-stop.json?v=d82c8d51'],
        ['Sensors: Cross the Bridge', 'worlds/challenges/sensor-color-bridge.json?v=35e48e81'],
        ['Sensors: Left or Right', 'worlds/challenges/sensor-color-leftRight.json?v=576b3cc1'],
        ['Sensors: Left, Right, Forward', 'worlds/challenges/sensor-color-leftRightFwd.json?v=dfb49d28'],
        ['Sensors: Follow two Colors', 'worlds/challenges/centeredSensor-follow2Colors.json?v=11f14233'],
        ['Sensors: Follow the Colors', 'worlds/challenges/centeredSensor-followColor.json?v=4a6bd66e'],
        ['Sensors: Follow to Yellow', 'worlds/challenges/centeredSensor-follow2Yellow.json?v=d3f89769'],
      ]
    },
    {
      option: 'useDefaultRobot',
      title: 'Use default robot',
      type: 'checkbox',
      label: 'Use the default robot for each challenge. If on, you will not be able to change the robot.',
      help: 'If you want to use your own robot, uncheck this option.'
    },
  ];

  this.defaultOptions = Object.assign(this.defaultOptions, {
    jsonFile: this.optionsConfigurations[0].options[0][1],
    useDefaultRobot: true
  });

  // Set options, including default
  this.setOptions = function(options) {
    return fetch(options.jsonFile)
      .then(response => response.json())
      .then(function(data){
        self.options = {...self.defaultOptions};
        Object.assign(self.options, data.options);
        Object.assign(self.options, options);

        return self.parent.setOptions(self.options);
      });
  };

  // Run on page load
  this.init = function() {
    Object.assign(self.options, self.defaultOptions);
  };

  // Logic for intersecting one box
  this.renderIntersectOne = function(delta, meshID, completionCode) {
    let endBox = babylon.scene.getMeshByID(meshID);

    if (
      endBox
      && endBox.intersectsPoint(robot.body.absolutePosition)
      && skulpt.running == false
      && robot.leftWheel.speed < 1 && robot.rightWheel.speed < 1
    ) {
      self.ended = true;
      let time = Math.round((Date.now() - self.challengeStartTime) / 100) / 10;

      acknowledgeDialog({
        title: 'COMPLETED!',
        message: $(
          '<p>Completion code: ' + completionCode + '</p>' +
          '<p>Time: ' + time + ' seconds</p>'
        )
      });
    }
  };

  // Logic for basic-2
  this.renderBasic2 = function(delta) {
    let box0 = babylon.scene.getMeshByID('worldBaseObject_box0');
    let box1 = babylon.scene.getMeshByID('worldBaseObject_box1');
    let box2 = babylon.scene.getMeshByID('worldBaseObject_box2');
    let box3 = babylon.scene.getMeshByID('worldBaseObject_box3');

    for (let box of [box0, box1, box2, box3]) {
      if (
        box
        && box.intersectsPoint(robot.body.absolutePosition)
      ) {
        if (typeof box.challengeState == 'undefined') {
          box.challengeState = 1;
          babylon.setMaterial(box, babylon.getMaterial(babylon.scene, 'ffff0070'));
        } else if (box.challengeState == 1) {
          if (robot.leftWheel.speed < 1 && robot.rightWheel.speed < 1) {
            box.challengeState = 2;
            babylon.setMaterial(box, babylon.getMaterial(babylon.scene, '00ff0070'));
          }
        }
      }
    }

    let completed = 0;
    for (let box of [box0, box1, box2, box3]) {
      if (box && box.challengeState == 2) {
        completed++;
      }
    }
    if (completed == 4) {
      self.ended = true;
      let time = Math.round((Date.now() - self.challengeStartTime) / 100) / 10;

      acknowledgeDialog({
        title: 'COMPLETED!',
        message: $(
          '<p>Completion code: GIRAFFE</p>' +
          '<p>Time: ' + time + ' seconds</p>'
        )
      });
    }
  };

  // Logic for basic-4
  this.renderBasic4 = function(delta) {
    let endBox = babylon.scene.getMeshByID('worldBaseObject_box3');
    let tree = babylon.scene.getMeshByID('worldBaseObject_cylinder1');
    let treeBox = babylon.scene.getMeshByID('worldBaseObject_box4');
    let box5 = babylon.scene.getMeshByID('worldBaseObject_box5');

    if (
      box5
      && box5.intersectsPoint(robot.body.absolutePosition)
    ) {
      box5.challengeState = 1;
    }

    if (
      endBox
      && endBox.intersectsPoint(robot.body.absolutePosition)
      && skulpt.running == false
      && box5.challengeState == 1
      && treeBox.intersectsPoint(tree.absolutePosition)
    ) {
      self.ended = true;
      let time = Math.round((Date.now() - self.challengeStartTime) / 100) / 10;

      acknowledgeDialog({
        title: 'COMPLETED!',
        message: $(
          '<p>Completion code: BEAVER</p>' +
          '<p>Time: ' + time + ' seconds</p>'
        )
      });
    }
  };

  // Logic for forklift. Move one box
  this.renderForkliftOneBox = function(delta, completionCode) {
    let box = babylon.scene.getMeshByID('worldBaseObject_box1');
    let tableBox = babylon.scene.getMeshByID('worldBaseObject_box6');
    let endBox = babylon.scene.getMeshByID('worldBaseObject_box5');

    if (
      endBox
      && endBox.intersectsPoint(robot.body.absolutePosition)
      && skulpt.running == false
      && tableBox.intersectsPoint(box.absolutePosition)
    ) {
      self.ended = true;
      let time = Math.round((Date.now() - self.challengeStartTime) / 100) / 10;

      acknowledgeDialog({
        title: 'COMPLETED!',
        message: $(
          '<p>Completion code: ' + completionCode + '</p>' +
          '<p>Time: ' + time + ' seconds</p>'
        )
      });
    }
  };

  // Logic for forklift-0.
  this.renderForkliftZero = function(delta, completionCode) {
    let box = babylon.scene.getMeshByID('worldBaseObject_box1');
    let greenBox = babylon.scene.getMeshByID('worldBaseObject_box4');

    if (
      greenBox
      && greenBox.intersectsPoint(box.absolutePosition)
    ) {
      if (typeof greenBox.challengeState == 'undefined') {
        greenBox.challengeState = 1;
        greenBox.position.y = 6.5;
      } else {
        self.ended = true;
        let time = Math.round((Date.now() - self.challengeStartTime) / 100) / 10;

        acknowledgeDialog({
          title: 'COMPLETED!',
          message: $(
            '<p>Completion code: ' + completionCode + '</p>' +
            '<p>Time: ' + time + ' seconds</p>'
          )
        });
      }
    }
  };

  // Create the scene
  this.load = function (scene) {
    self.ended = false;
    self.started = false;

    if (self.options.useDefaultRobot) {
      let DEFAULT_ROBOT = {
        'basic': ['mazeBasic', 'https://files.aposteriori.com.sg/get/pQov9Yj6tn.json'],
        'maze': ['mazeBasic', 'https://files.aposteriori.com.sg/get/pQov9Yj6tn.json'],
        'forklift': ['forklift', 'https://raw.githubusercontent.com/QuirkyCort/gears-contributions/main/robots/Demo/linearActuatorForklift.json'],
        'sensor': ['sensorBasic', 'https://files.aposteriori.com.sg/get/dRUWUkKoU5.json'],
        'centeredSensor': ['sensorBasicCentered', 'https://files.aposteriori.com.sg/get/SAEXyo9ht9.json'],
      }

      for (let jsonFile in DEFAULT_ROBOT) {
        if (self.options.jsonFile.includes(jsonFile)) {
          if (robot.options.name != DEFAULT_ROBOT[jsonFile][0]) {
            main.loadRobotURL(DEFAULT_ROBOT[jsonFile][1]);
          }
        }
      }
    }

    return this.parent.load(scene);
  };

  // Render
  this.render = function(delta){
    self.parent.render(delta);

    if (self.ended || !self.started) {
      return;
    }

    if (self.options.jsonFile.includes('basic-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'UNICORN');
    } else if (self.options.jsonFile.includes('basic-2.json')) {
      self.renderBasic2(delta); // GIRAFFE
    } else if (self.options.jsonFile.includes('basic-2a.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'CAT');
    } else if (self.options.jsonFile.includes('basic-2b.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'WOLF');
    } else if (self.options.jsonFile.includes('basic-3.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'PUPPY');
    } else if (self.options.jsonFile.includes('basic-4.json')) {
      self.renderBasic4(delta); // BEAVER
    } else if (self.options.jsonFile.includes('maze33-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'ELEPHANT');
    } else if (self.options.jsonFile.includes('maze33-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'HIPPO');
    } else if (self.options.jsonFile.includes('maze44-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'KANGAROO');
    } else if (self.options.jsonFile.includes('maze44-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'KOALA');
    } else if (self.options.jsonFile.includes('forklift-0.json')) {
      self.renderForkliftZero(delta, 'ELK');
    } else if (self.options.jsonFile.includes('forklift-1.json')) {
      self.renderForkliftOneBox(delta, 'RHINO');
    } else if (self.options.jsonFile.includes('forklift-2.json')) {
      self.renderForkliftOneBox(delta, 'MOOSE');
    } else if (self.options.jsonFile.includes('sensor-color-stop.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'PEACOCK');
    } else if (self.options.jsonFile.includes('sensor-ultrasonic-stop.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'PIGEON');
    } else if (self.options.jsonFile.includes('sensor-color-bridge.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'DUCK');
    } else if (self.options.jsonFile.includes('sensor-color-leftRight.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'SPARROW');
    } else if (self.options.jsonFile.includes('sensor-color-leftRightFwd.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'BLUE JAY');
    } else if (self.options.jsonFile.includes('centeredSensor-follow2Colors.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'NARWHAL');
    } else if (self.options.jsonFile.includes('centeredSensor-followColor.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'ROBIN');
    } else if (self.options.jsonFile.includes('centeredSensor-follow2Yellow.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'GOLDFINCH');
    }
  };

  // startSim
  this.startSim = function() {
    if (self.started) {
      self.ended = true;
    }
    self.started = true;
    self.parent.startSim();

    self.challengeStartTime = Date.now();
  };

  // detect if robot is manually moved
  this.manualMoved = function() {
    self.ended = true;
  }
}

// Init class
world_challenges.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_challenges);