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
    '<p>This world contains various simple challenges.</p>';
  // this.thumbnail = 'images/worlds/missions.jpg';

  this.optionsConfigurations = [
    {
      option: 'jsonFile',
      title: 'Select Challenges',
      type: 'select',
      options: [
        ['Basic: Move', 'worlds/challenges/basic-1.json?v=36019081'],
        ['Basic: Sequential Movements', 'worlds/challenges/basic-2.json?v=6b84cb3c'],
        ['Basic: Turns', 'worlds/challenges/basic-3.json?v=475b7598'],
        ['Basic: Curve Turn', 'worlds/challenges/basic-4.json?v=705272bd'],
        ['Maze: 3x3 Red', 'worlds/challenges/maze33-1.json?v=70f038b9'],
        ['Maze: 3x3 Pink', 'worlds/challenges/maze33-2.json?v=5efa7436'],
        ['Maze: 4x4 Red', 'worlds/challenges/maze44-1.json?v=5f7438d4'],
        ['Maze: 4x4 Pink', 'worlds/challenges/maze44-2.json?v=513d8b73']
      ]
    },
  ];

  this.defaultOptions = Object.assign(this.defaultOptions, {
    jsonFile: this.optionsConfigurations[0].options[0][1]
  });

  // Set options, including default
  this.setOptions = function(options) {
    return fetch(options.jsonFile)
      .then(response => response.json())
      .then(function(data){
        self.options = {...self.defaultOptions};
        Object.assign(self.options, data.options);
        Object.assign(self.options, options);

        return self.parent.setOptions();
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

  // Create the scene
  this.load = function (scene) {
    self.ended = false;
    self.started = false;

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
      self.renderBasic2(delta);
    } else if (self.options.jsonFile.includes('basic-3.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box0', 'PUPPY');
    } else if (self.options.jsonFile.includes('basic-4.json')) {
      self.renderBasic4(delta);
    } else if (self.options.jsonFile.includes('maze33-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'ELEPHANT');
    } else if (self.options.jsonFile.includes('maze33-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'HIPPO');
    } else if (self.options.jsonFile.includes('maze44-1.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'KANGAROO');
    } else if (self.options.jsonFile.includes('maze44-2.json')) {
      self.renderIntersectOne(delta, 'worldBaseObject_box4', 'KOALA');
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