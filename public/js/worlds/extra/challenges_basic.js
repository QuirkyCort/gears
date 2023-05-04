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
        ['Basic: Dungeon 0', 'worlds/challenges_basic/dungeon-0.json?v=d16421b8'],
        ['Basic: Dungeon 1', 'worlds/challenges_basic/dungeon-1.json?v=4fcbabab'],
        ['Basic: Dungeon 2', 'worlds/challenges_basic/dungeon-2.json?v=7114511d'],
        ['Basic: Dungeon 3', 'worlds/challenges_basic/dungeon-3.json?v=0abf9ae2'],
        ['Basic: Dungeon 4', 'worlds/challenges_basic/dungeon-4.json?v=091f44ad'],
        ['Basic: Dungeon 5', 'worlds/challenges_basic/dungeon-5.json?v=009cbf96'],
        ['Loops: Repeat 0', 'worlds/challenges_basic/loops-0.json?v=dca8f7ad'],
        ['Loops: Repeat 0b', 'worlds/challenges_basic/loops-0b.json?v=4db77619'],
        ['Loops: Repeat 1', 'worlds/challenges_basic/loops-1.json?v=607f3c38'],
        ['Loops: Repeat 2', 'worlds/challenges_basic/loops-2.json?v=848fd296'],
        ['Loops: Repeat 3', 'worlds/challenges_basic/loops-3.json?v=ae7011eb'],
        ['Loops: Repeat 3b', 'worlds/challenges_basic/loops-3b.json?v=53bc0e16'],
        ['Loops: Repeat 4', 'worlds/challenges_basic/loops-4.json?v=5fa0c5f0'],
        ['Loops: Repeat 5', 'worlds/challenges_basic/loops-5.json?v=729ad780'],
        ['Loops: Repeat 5b', 'worlds/challenges_basic/loops-5b.json?v=ea21f9d5'],
        ['Loops: Repeat 6', 'worlds/challenges_basic/loops-6.json?v=5484bb7c'],
        ['Condition: Color 1', 'worlds/challenges_basic/conditions-1.json?v=b06212fe'],
        ['Condition: Color 2', 'worlds/challenges_basic/conditions-2.json?v=4757e227'],
        ['Condition: Color 3', 'worlds/challenges_basic/conditions-3.json?v=ecbb4ae5'],
        ['Condition: Color 4', 'worlds/challenges_basic/conditions-4.json?v=4c96c864'],
        ['Condition: Color 5', 'worlds/challenges_basic/conditions-5.json?v=d5353fa9'],
        ['Condition: Color 6', 'worlds/challenges_basic/conditions-6.json?v=4f834e54'],
        ['Condition: Color 7', 'worlds/challenges_basic/conditions-7.json?v=86502bb0'],
        ['Condition: Color 8', 'worlds/challenges_basic/conditions-8.json?v=8ad2c418'],
        ['Condition: Color 9', 'worlds/challenges_basic/conditions-9.json?v=3702a992'],
        ['Condition: Color 10', 'worlds/challenges_basic/conditions-10.json?v=87b48a99'],
        ['Condition: Color 11', 'worlds/challenges_basic/conditions-11.json?v=85e3052e'],
        ['Condition: Color 12', 'worlds/challenges_basic/conditions-12.json?v=6d42f222'],
        ['Abstraction: Dungeon 1', 'worlds/challenges_basic/abstraction-1.json?v=3d38a55b'],
        ['Abstraction: Dungeon 2', 'worlds/challenges_basic/abstraction-2.json?v=35d1b224'],
        ['Abstraction: Dungeon 3', 'worlds/challenges_basic/abstraction-3.json?v=b07838d3'],
        ['Abstraction: Dungeon 4', 'worlds/challenges_basic/abstraction-4.json?v=468cc179'],
        ['Abstraction: Dungeon 5', 'worlds/challenges_basic/abstraction-5.json?v=926b32e2'],
        ['Abstraction: Dungeon 6', 'worlds/challenges_basic/abstraction-6.json?v=a2f2969a'],
        ['Abstraction: Dungeon 7', 'worlds/challenges_basic/abstraction-7.json?v=f5b3c468'],
        ['Abstraction: Dungeon 8', 'worlds/challenges_basic/abstraction-8.json?v=5957e6b8'],
        ['Abstraction: Dungeon 9', 'worlds/challenges_basic/abstraction-9.json?v=3b330462'],
        ['Abstraction: Dungeon 10', 'worlds/challenges_basic/abstraction-10.json?v=499c54f1'],
        ['Abstraction: Dungeon 11', 'worlds/challenges_basic/abstraction-11.json?v=4f35d8a5'],
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

  this.countBlocks = function() {
    let blocks = blockly.workspace.getBlocksByType('when_started')[0].getDescendants();
    let count = blocks.reduce(
      function(s,e) {
        if (e.previousConnection != null || e.nextConnection != null) {
          return s+1
        } else{
          return s
        }
      },
      0
    );

    return count - 1;
  };

  this.handleInteracts = function(interacts) {
    for (let interact of interacts) {
      if (interact.type == 'drop') {
        let triggerBox = babylon.scene.getMeshByID(interact.trigger);
        if (triggerBox.intersectsPoint(robot.body.absolutePosition)) {
          let moveBox = babylon.scene.getMeshByID(interact.move);
          moveBox.physicsImpostor.mass = 1;
        }
      } else if (interact.type == 'move') {
        let triggerBox = babylon.scene.getMeshByID(interact.trigger);
        if (triggerBox.intersectsPoint(robot.body.absolutePosition)) {
          let moveBox = babylon.scene.getMeshByID(interact.move);
          moveBox.position.x += interact.velocity.x;
          moveBox.position.y += interact.velocity.y;
          moveBox.position.z += interact.velocity.z;
        }
      }
    }
  };

  // Logic for intersecting one box
  this.renderIntersectOne = function(delta, meshID, completionCode, interacts=[], blocksLimit=-1) {
    let endBox = babylon.scene.getMeshByID(meshID);

    self.handleInteracts(interacts);

    if (
      skulpt.running == false
      && robot.leftWheel.speed < 1 && robot.rightWheel.speed < 1
    ) {
      if (endBox.intersectsPoint(robot.body.absolutePosition)) {
        let usedBlocks = self.countBlocks();
        if (usedBlocks > blocksLimit && blocksLimit > 0) {
          self.ended = true;
          acknowledgeDialog({
            title: 'Try Again!',
            message: $(
              '<p>You completed the mission, but used too many blocks!</p>' +
              '<p>You used ' + usedBlocks + ' blocks, and will need to reduce it to ' + blocksLimit + ' blocks.</p>'
            )
          });
        } else {
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
        }
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
  this.renderIntersectMulti = function(delta, meshIDs, stopRequired, completionCode, effect='color', interacts=[], blocksLimit=-1) {
    let boxes = [];
    for (let meshID of meshIDs) {
      boxes.push(babylon.scene.getMeshByID(meshID));
    }

    self.handleInteracts(interacts);

    for (let box of boxes) {
      if (
        box
        && box.intersectsPoint(robot.body.absolutePosition)
      ) {
        if (typeof box.challengeState == 'undefined') {
          box.challengeState = 1;
          if (effect == 'color') {
            babylon.setMaterial(box, babylon.getMaterial(babylon.scene, 'ffff0070'));
          }
        } else if (box.challengeState == 1) {
          if (
            (Math.abs(robot.leftWheel.speed) < 1 && Math.abs(robot.rightWheel.speed) < 1)
            || stopRequired == false
          ) {
            box.challengeState = 2;
            if (effect == 'color') {
              babylon.setMaterial(box, babylon.getMaterial(babylon.scene, '00ff0070'));
            } else if (effect == 'hide') {
              box.setEnabled(false);
            }
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
        let usedBlocks = self.countBlocks();
        if (usedBlocks > blocksLimit && blocksLimit > 0) {
          self.ended = true;
          acknowledgeDialog({
            title: 'Try Again!',
            message: $(
              '<p>You completed the mission, but used too many blocks!</p>' +
              '<p>You used ' + usedBlocks + ' blocks, and will need to reduce it to ' + blocksLimit + ' blocks.</p>'
            )
          });
        } else {
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
        }
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

    let match = false;
    if (self.options.useDefaultRobot) {
      let DEFAULT_ROBOT = {
        'basic': ['twBasic', 'https://files.aposteriori.com.sg/get/ygcmWx4oSE.json'],
      }

      for (let jsonFile in DEFAULT_ROBOT) {
        if (self.options.jsonFile.includes(jsonFile)) {
          if (robot.options.name != DEFAULT_ROBOT[jsonFile][0]) {
            match = true;
            main.loadRobotURL(DEFAULT_ROBOT[jsonFile][1]);
          }
        }
      }
    }

    if (match == false) {
      if (robot.options.name != 'twBasic') {
        main.loadRobotURL('https://files.aposteriori.com.sg/get/ygcmWx4oSE.json');
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
    } else if (self.options.jsonFile.includes('dungeon-0.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>'
      );
    } else if (self.options.jsonFile.includes('dungeon-1.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>'
      );
    } else if (self.options.jsonFile.includes('dungeon-2.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Be careful! The shortest route isn\'t always the best...</p>'
      );
    } else if (self.options.jsonFile.includes('dungeon-3.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Watch out for the monster!</p>'
      );
    } else if (self.options.jsonFile.includes('dungeon-4.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>How can we get that gate open?</p>'
      );
    } else if (self.options.jsonFile.includes('dungeon-5.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'ll need to use everything you\'ve learned!</p>'
      );
    } else if (self.options.jsonFile.includes('loops-0.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 4 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-0b.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 4 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-1.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 5 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-2.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 6 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-3.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You may need to use more than one repeat loop.</p>' +
        '<p>You\'re may only use 4 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-3b.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You may need to use more than one repeat loop.</p>' +
        '<p>You\'re may only use 4 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-4.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Not every block needs to be inside a loop.</p>' +
        '<p>You\'re may only use 6 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-5.json')) {
      $message = $(
        '<p>Collect all the coins.</p>' +
        '<p>You\'re may only use 4 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-5b.json')) {
      $message = $(
        '<p>Collect all the coins.</p>' +
        '<p>You\'re may only use 7 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('loops-6.json')) {
      $message = $(
        '<p>Collect all the coins.</p>' +
        '<p>You\'re may only use 10 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('conditions-')) {
      $message = $(
        '<p>Drive into the green box.</p>' +
        '<p>The position of the box changes randomly every time the world is reset.</p>' +
        '<p>Use the color on the ground to figure out where it will appear.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-1.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Don\'t get distracted by the alien!</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-2.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Why is there a zebra in the dungeon?</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-3.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>The cat looks fascinated by the ball!</p>' +
        '<p>You\'re may only use 5 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-4.json')) {
      $message = $(
        '<p>Collect all the coins.</p>' +
        '<p>Everything is spinning!</p>' +
        '<p>You\'re may only use 4 blocks.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-5.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>Don\'t let the water distract you! The green box changes position on reset.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-6.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 1 block.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-7.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 8 block.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-8.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 11 block.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-9.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>You\'re may only use 12 block.</p>'
      );
    } else if (self.options.jsonFile.includes('abstraction-10.json')) {
      $message = $(
        '<p>Collect all the coins.</p>' +
        '<p>You\'re may only use 5 blocks.</p>'      );
    } else if (self.options.jsonFile.includes('abstraction-11.json')) {
      $message = $(
        '<p>Move your robot into the green box and stop inside.</p>' +
        '<p>No blocks limits, but the green box changes position on reset.</p>'
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
    } else if (self.options.jsonFile.includes('dungeon-0.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box5', 'IMP');
    } else if (self.options.jsonFile.includes('dungeon-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box5', 'ORC');
    } else if (self.options.jsonFile.includes('dungeon-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box5', 'TROLL',
        [
          {
            type: 'drop',
            trigger: 'worldBaseObject_box11',
            move: 'worldBaseObject_box2'
          }
        ]
      );
    } else if (self.options.jsonFile.includes('dungeon-3.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box2', 'MINOTAUR');
    } else if (self.options.jsonFile.includes('dungeon-4.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'CYCLOP',
        [
          {
            type: 'move',
            trigger: 'worldBaseObject_cylinder11',
            move: 'worldBaseObject_model10',
            velocity: {
              x: 0,
              y: -0.1,
              z: 0
            },
          }
        ]
      );
    } else if (self.options.jsonFile.includes('dungeon-5.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'DRAGON',
        [
          {
            type: 'drop',
            trigger: 'worldBaseObject_box19',
            move: 'worldBaseObject_box0'
          },
          {
            type: 'move',
            trigger: 'worldBaseObject_cylinder11',
            move: 'worldBaseObject_model10',
            velocity: {
              x: 0,
              y: 0,
              z: -0.1
            },
          }
        ]
      );
    } else if (self.options.jsonFile.includes('loops-0.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box5', 'PLUTO', [], 4);
    } else if (self.options.jsonFile.includes('loops-0b.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box5', 'CHARON', [], 4);
    } else if (self.options.jsonFile.includes('loops-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box5', 'NEPTUNE', [], 5);
    } else if (self.options.jsonFile.includes('loops-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'URANUS', [], 6);
    } else if (self.options.jsonFile.includes('loops-3.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'SATURN', [], 4);
    } else if (self.options.jsonFile.includes('loops-3b.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'TITAN', [], 4);
    } else if (self.options.jsonFile.includes('loops-4.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'JUPITER', [], 6);
    } else if (self.options.jsonFile.includes('loops-5.json')) {
      self.renderIntersectMulti(
        delta,
        ['worldBaseObject_model7', 'worldBaseObject_model8', 'worldBaseObject_model9'],
        false,
        'MARS',
        'hide',
        [],
        7
      );
    } else if (self.options.jsonFile.includes('loops-5b.json')) {
      self.renderIntersectMulti(
        delta,
        ['worldBaseObject_model14', 'worldBaseObject_model15', 'worldBaseObject_model16', 'worldBaseObject_model17', 'worldBaseObject_model18', 'worldBaseObject_model19'],
        false,
        'PHOBOS',
        'hide',
        [],
        7
      );
    } else if (self.options.jsonFile.includes('loops-6.json')) {
      self.renderIntersectMulti(
        delta,
        ['worldBaseObject_model13', 'worldBaseObject_model14', 'worldBaseObject_model15'],
        false,
        'EARTH',
        'hide',
        [],
        10
      );
    } else if (self.options.jsonFile.includes('conditions-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'STONE');
    } else if (self.options.jsonFile.includes('conditions-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'SECRETS');
    } else if (self.options.jsonFile.includes('conditions-3.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'AZKABAN');
    } else if (self.options.jsonFile.includes('conditions-4.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'FIRE');
    } else if (self.options.jsonFile.includes('conditions-5.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'PHOENIX');
    } else if (self.options.jsonFile.includes('conditions-6.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'PRINCE');
    } else if (self.options.jsonFile.includes('conditions-7.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'CHOCOLATE');
    } else if (self.options.jsonFile.includes('conditions-8.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'BANANA');
    } else if (self.options.jsonFile.includes('conditions-9.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'AVOCADO');
    } else if (self.options.jsonFile.includes('conditions-10.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'VANILLA');
    } else if (self.options.jsonFile.includes('conditions-11.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'CARAMEL');
    } else if (self.options.jsonFile.includes('conditions-12.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'OREO');
    } else if (self.options.jsonFile.includes('abstraction-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'TABBY',
        [
          {
            type: 'drop',
            trigger: 'worldBaseObject_box19',
            move: 'worldBaseObject_box0'
          },
        ]
      );
    } else if (self.options.jsonFile.includes('abstraction-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'CALICO',
        [
          {
            type: 'drop',
            trigger: 'worldBaseObject_box19',
            move: 'worldBaseObject_box0'
          },
        ]
      );
    } else if (self.options.jsonFile.includes('abstraction-3.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'GINGER',
        [
          {
            type: 'drop',
            trigger: 'worldBaseObject_box18',
            move: 'worldBaseObject_box0'
          },
          {
            type: 'move',
            trigger: 'worldBaseObject_cylinder11',
            move: 'worldBaseObject_box13',
            velocity: {
              x: 0,
              y: 0,
              z: -0.1
            },
          }
        ],
        5
      );
    } else if (self.options.jsonFile.includes('abstraction-4.json')) {
      self.renderIntersectMulti(
        delta,
        ['worldBaseObject_model28', 'worldBaseObject_model29', 'worldBaseObject_model30'],
        false,
        'SIAMESE',
        'hide',
        [
          {
            type: 'drop',
            trigger: 'worldBaseObject_box16',
            move: 'worldBaseObject_box0'
          },
          {
            type: 'move',
            trigger: 'worldBaseObject_cylinder9',
            move: 'worldBaseObject_box11',
            velocity: {
              x: 0,
              y: 0,
              z: -0.1
            },
          }
        ],
        4
      );
    } else if (self.options.jsonFile.includes('abstraction-5.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'RAGDOLL',
        [
          {
            type: 'drop',
            trigger: 'worldBaseObject_box18',
            move: 'worldBaseObject_box0'
          },
          {
            type: 'move',
            trigger: 'worldBaseObject_cylinder11',
            move: 'worldBaseObject_box13',
            velocity: {
              x: 0,
              y: 0,
              z: -0.1
            },
          }
        ]
      );
    } else if (self.options.jsonFile.includes('abstraction-6.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'Indri', [], 1);
    } else if (self.options.jsonFile.includes('abstraction-7.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'Fossa', [], 8);
    } else if (self.options.jsonFile.includes('abstraction-8.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'Dingo', [], 11);
    } else if (self.options.jsonFile.includes('abstraction-9.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box1', 'Aardvark', [], 12);
    } else if (self.options.jsonFile.includes('abstraction-10.json')) {
      self.renderIntersectMulti(
        delta,
        ['worldBaseObject_model158', 'worldBaseObject_model159', 'worldBaseObject_model160'],
        false,
        'Zapus',
        'hide',
        [],
        5
      );
    } else if (self.options.jsonFile.includes('abstraction-11.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'Xerus');
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