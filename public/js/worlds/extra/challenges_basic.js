var challenges_basic = new function() {
  World_Base.call(this);
  this.parent = {};
  for (p in this) {
    this.parent[p] = this[p];
  }

  var self = this;

  this.name = 'challenges_basic';
  this.shortDescription = 'Basic Challenges';
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
        ['Basic: Move', 'worlds/challenges_basic/basic-1.json?v=65847fe0'],
        ['Basic: Multiple Moves', 'worlds/challenges_basic/basic-2.json?v=c9f70768'],
        ['Basic: Move and Turn 1', 'worlds/challenges_basic/basic-3.json?v=ebe6693c'],
        ['Basic: Move and Turn 2', 'worlds/challenges_basic/basic-4.json?v=071580c0'],
        ['Basic: Move and Turn 3', 'worlds/challenges_basic/basic-5.json?v=2af8b1e9'],
        ['Basic: Sleep 1', 'worlds/challenges_basic/sleep-1.json?v=b28b34e8'],
        ['Basic: Sleep 2', 'worlds/challenges_basic/sleep-2.json?v=a0d67ae4'],
        ['Basic: Maze 1', 'worlds/challenges_basic/maze-1.json?v=1ce38425'],
        ['Basic: Maze 2', 'worlds/challenges_basic/maze-2.json?v=4c257c21'],
        ['Basic: Maze 3', 'worlds/challenges_basic/maze-3.json?v=52c6d5cd'],
        ['Basic: Maze 4', 'worlds/challenges_basic/maze-4.json?v=324c0860'],
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
    self.audio = $('<audio src="audio/fanfare.mp3" preload="auto"></audio>');
    $('body').append(self.audio);
  };

  this.playVictory = function() {
    self.audio[0].play();
  };

  // Logic for intersecting one box
  this.renderIntersectOne = function(delta, meshID, completionCode) {
    let endBox = babylon.scene.getMeshByID(meshID);

    if (
      skulpt.running == false
      && robot.leftWheel.speed < 1 && robot.rightWheel.speed < 1
    ) {
      if (endBox.intersectsPoint(robot.body.absolutePosition)) {
        self.ended = true;
        let time = Math.round((Date.now() - self.challengeStartTime) / 100) / 10;

        self.playVictory();
        acknowledgeDialog({
          title: 'COMPLETED!',
          message: $(
            '<p>Completion code: ' + completionCode + '</p>' +
            '<p>Time: ' + time + ' seconds</p>'
          )
        });
      } else {
        self.ended = true;
        acknowledgeDialog({
          title: 'Try Again!',
          message: $(
            '<p>You didn\'t make it this time, but don\'t give up!</p>' +
            '<p>Click the "Reset" button then try again!</p>'
          )
        });
      }
    }
  };

  // Logic for multiple boxes
  this.renderIntersectMulti = function(delta, meshIDs, stopRequired, completionCode) {
    let boxes = [];
    for (let meshID of meshIDs) {
      boxes.push(babylon.scene.getMeshByID(meshID));
    }

    for (let box of boxes) {
      if (
        box
        && box.intersectsPoint(robot.body.absolutePosition)
      ) {
        if (typeof box.challengeState == 'undefined') {
          box.challengeState = 1;
          babylon.setMaterial(box, babylon.getMaterial(babylon.scene, 'ffff0070'));
        } else if (box.challengeState == 1) {
          if (
            (Math.abs(robot.leftWheel.speed) < 1 && Math.abs(robot.rightWheel.speed < 1))
            || stopRequired == false
          ) {
            box.challengeState = 2;
            babylon.setMaterial(box, babylon.getMaterial(babylon.scene, '00ff0070'));
          }
        }
      }
    }

    let completed = 0;
    for (let box of boxes) {
      if (box && box.challengeState == 2) {
        completed++;
      }
    }
    if (
      skulpt.running == false
      && robot.leftWheel.speed < 1 && robot.rightWheel.speed < 1
    ) {
      if (completed == boxes.length) {
        self.ended = true;
        let time = Math.round((Date.now() - self.challengeStartTime) / 100) / 10;

        self.playVictory();
        acknowledgeDialog({
          title: 'COMPLETED!',
          message: $(
            '<p>Completion code: ' + completionCode + '</p>' +
            '<p>Time: ' + time + ' seconds</p>'
          )
        });
      } else {
        self.ended = true;
        let remaining = boxes.length - completed;
        acknowledgeDialog({
          title: 'Try Again!',
          message: $(
            '<p>You missed ' + remaining + ' boxes.</p>' +
            '<p>Click the "Reset" button then try again!</p>'
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
        'basic': ['twBasic', 'https://files.aposteriori.com.sg/get/ygcmWx4oSE.json'],
      }

      for (let jsonFile in DEFAULT_ROBOT) {
        if (self.options.jsonFile.includes(jsonFile)) {
          if (robot.options.name != DEFAULT_ROBOT[jsonFile][0]) {
            main.loadRobotURL(DEFAULT_ROBOT[jsonFile][1]);
          }
        }
      }
    }

    if (typeof simPanel != 'undefined') {
      self.panel = simPanel;
    }

    self.panel.showWorldInfoPanel();
    self.drawMissionButton();

    return this.parent.load(scene);
  };

  this.drawMissionButton = function() {
    if (typeof self.panel == 'undefined') {
      return;
    }

    self.panel.clearWorldInfoPanel();
    let $info = $(
      '<div class="mono row">' +
        '<div class="center mission" style="cursor: pointer; user-select: none;">Mission</div>' +
      '</div>'
    );
    $info.find('.mission').click(this.displayMission);
    self.panel.drawWorldInfo($info);
  };

  this.displayMission = function() {
    let $message;

    if (self.options.jsonFile.includes('basic-1.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>'
      );
    } else if (self.options.jsonFile.includes('basic-2.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Try using multiple "Move Forward" blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('basic-3.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You will need to use a "Turn" block.</p>'
      );
    } else if (self.options.jsonFile.includes('basic-4.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You will need to use a "Turn" block.</p>'
      );
    } else if (self.options.jsonFile.includes('basic-5.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Sometimes the box is behind you!</p>'
      );
    } else if (self.options.jsonFile.includes('sleep-1.json')) {
      $message = $(
        '<p>Move your robot into every box.</p>' +
        '<p>You will need to stop inside each box for 1 second before moving to the next!</p>'
      );
    } else if (self.options.jsonFile.includes('sleep-2.json')) {
      $message = $(
        '<p>Move your robot into every box.</p>' +
        '<p>You will need to stop inside each box for 1 second before moving to the next!</p>'
      );
    } else if (self.options.jsonFile.includes('maze-1.json')) {
      $message = $(
        '<p>Move your robot into every box.</p>' +
        '<p>You will need to stop inside each box for 1 second before moving to the next!</p>'
      );
    } else if (self.options.jsonFile.includes('maze-2.json')) {
      $message = $(
        '<p>Move your robot into every box.</p>' +
        '<p>You will need to stop inside each box for 1 second before moving to the next!</p>'
      );
    } else if (self.options.jsonFile.includes('maze-3.json')) {
      $message = $(
        '<p>Move your robot into every box.</p>' +
        '<p>You will need to stop inside each box for 1 second before moving to the next!</p>'
      );
    } else if (self.options.jsonFile.includes('maze-4.json')) {
      $message = $(
        '<p>Move your robot into every box.</p>' +
        '<p>You will need to stop inside each box for 1 second before moving to the next!</p>'
      );
    }

    acknowledgeDialog({
      title: 'Mission',
      message: $message
    });
  };

  // Render
  this.render = function(delta){
    self.parent.render(delta);

    if (self.ended || !self.started) {
      return;
    }

    let elapsedTime = Date.now() - self.challengeStartTime;
    if (elapsedTime < 1000) {
      return;
    }

    if (self.options.jsonFile.includes('basic-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'UNICORN');
    } else if (self.options.jsonFile.includes('basic-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'ELEPHANT');
    } else if (self.options.jsonFile.includes('basic-3.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'DOG');
    } else if (self.options.jsonFile.includes('basic-4.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'CAT');
    } else if (self.options.jsonFile.includes('basic-5.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'MOUSE');
    } else if (self.options.jsonFile.includes('sleep-1.json')) {
      self.renderIntersectMulti(delta, ['worldBaseObject_box0', 'worldBaseObject_box1', 'worldBaseObject_box2', 'worldBaseObject_box3'], true, 'SLOTH');
    } else if (self.options.jsonFile.includes('sleep-2.json')) {
      self.renderIntersectMulti(delta, ['worldBaseObject_box0', 'worldBaseObject_box1', 'worldBaseObject_box2', 'worldBaseObject_box3'], true, 'PANDA');
    } else if (self.options.jsonFile.includes('maze-1.json')) {
      self.renderIntersectMulti(delta, ['worldBaseObject_box1', 'worldBaseObject_box2'], true, 'MOLE');
    } else if (self.options.jsonFile.includes('maze-2.json')) {
      self.renderIntersectMulti(delta, ['worldBaseObject_box1', 'worldBaseObject_box2'], true, 'HEDGEHOG');
    } else if (self.options.jsonFile.includes('maze-3.json')) {
      self.renderIntersectMulti(delta, ['worldBaseObject_box3', 'worldBaseObject_box4', 'worldBaseObject_box5'], true, 'RABBIT');
    } else if (self.options.jsonFile.includes('maze-4.json')) {
      self.renderIntersectMulti(delta, ['worldBaseObject_box3', 'worldBaseObject_box4', 'worldBaseObject_box5'], true, 'DONKEY');
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
  };

  // stopSim
  this.stopSim = function() {
    self.ended = true;
    acknowledgeDialog({
      title: 'Oops!',
      message: $(
        '<p>You cannot stop and restart.</p>' +
        '<p>Click the "Reset" button then try again!</p>' +
        '<p>Make sure to click the "Run" button once and wait for it to complete.</p>'
      )
    });
  };

}

// Init class
challenges_basic.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(challenges_basic);