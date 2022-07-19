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
        ['Basic: Move', 'worlds/challenges/basic-1.json?v=e606cc9e'],
        ['Basic: Maze 3x3 Red', 'worlds/challenges/maze33-1.json?v=e73481a6'],
        ['Basic: Maze 3x3 Pink', 'worlds/challenges/maze33-2.json?v=ab4888d8'],
        ['Basic: Maze 4x4 Red', 'worlds/challenges/maze44-1.json?v=f190848e'],
        ['Basic: Maze 4x4 Pink', 'worlds/challenges/maze44-2.json?v=dc315613']
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

  // Logic for basic-1
  this.renderBasic1 = function(delta) {
    let endBox = babylon.scene.getMeshByID('worldBaseObject_box0');

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
          '<p>Completion code: UNICORN</p>' +
          '<p>Time: ' + time + ' seconds</p>'
        )
      })
    }
  };

  // Logic for maze
  this.renderMaze = function(delta, completionCode) {
    let endBox = babylon.scene.getMeshByID('worldBaseObject_box4');

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
      })
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

    if (self.ended) {
      return;
    }

    if (self.options.jsonFile.includes('basic-1.json')) {
      self.renderBasic1(delta);
    } else if (self.options.jsonFile.includes('maze33-1.json')) {
      self.renderMaze(delta, 'ELEPHANT');
    } else if (self.options.jsonFile.includes('maze33-2.json')) {
      self.renderMaze(delta, 'HIPPO');
    } else if (self.options.jsonFile.includes('maze44-1.json')) {
      self.renderMaze(delta, 'KANGAROO');
    } else if (self.options.jsonFile.includes('maze44-2.json')) {
      self.renderMaze(delta, 'KOALA');
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