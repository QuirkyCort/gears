var world_Arena = new function() {
  var self = this;

  this.name = 'arena';
  this.shortDescription = 'Multi-Robot Arena';
  this.longDescription =
    '<p>These are arena worlds, meant for multiple robots either competing or cooperating with each other.</p>' +
    '<p>You can use this world in single robot mode to prepare your program, before running it in the arena.</p>';
  this.thumbnail = 'images/worlds/arena.jpg';

  this.options = {};

  this.robotStart = null;
  this.arenaStart = null;
  this.arenaStarts = {
    island: [
      {
        position: new BABYLON.Vector3(-100, 0, 100),
        rotation: new BABYLON.Vector3(0, 3/4 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(-100, 0, -100),
        rotation: new BABYLON.Vector3(0, 1/4 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(100, 0, 100),
        rotation: new BABYLON.Vector3(0, -3/4 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(100, 0, -100),
        rotation: new BABYLON.Vector3(0, -1/4 * Math.PI, 0)
      },
    ],
    collector: [
      {
        position: new BABYLON.Vector3(-112.5, 0, 62.5),
        rotation: new BABYLON.Vector3(0, 1/2 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(-112.5, 0, -62.5),
        rotation: new BABYLON.Vector3(0, 1/2 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(112.5, 0, 62.5),
        rotation: new BABYLON.Vector3(0, -1/2 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(112.5, 0, -62.5),
        rotation: new BABYLON.Vector3(0, -1/2 * Math.PI, 0)
      },
    ],
    sumo: [
      {
        position: new BABYLON.Vector3(-50, 0, 50),
        rotation: new BABYLON.Vector3(0, 3/4 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(-50, 0, -50),
        rotation: new BABYLON.Vector3(0, 1/4 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(50, 0, 50),
        rotation: new BABYLON.Vector3(0, -3/4 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(50, 0, -50),
        rotation: new BABYLON.Vector3(0, -1/4 * Math.PI, 0)
      },
    ]
  };

  this.optionsConfigurations = [
    {
      option: 'challenge',
      title: 'Select Challenge',
      type: 'selectWithHTML',
      options: [
        ['Paintball Islands', 'island'],
        ['Color Collector', 'collector'],
        ['Sumo', 'sumo']
      ],
      optionsHTML: {
        island:
          '<p>Every robot is on its own island. ' +
          'You have 2 mins to hit your opponent with your paintballs, while avoiding being hit yourself. ' +
          'Be careful not to fall off! Robots that have fallen off their island are disqualified.</p>' +
          '<ul><li>Hitting an opponent with your paintball will gain you 2 points.</li>' +
          '<li>Being hit with a paintball will deduct 1 point from your score.</li></ul>',
        collector:
          '<p>Collect the colored chips.</p>' +
          '<p>In this arena, Player 0 and 1 are in Team A, while Player 2 and 3 are in Team B. ' +
          'Collect the red / green / blue tokens and drop them off in your team\'s score zone to score.</p>' +
          '<ul><li>Tokens can be picked up using the electromagnet</li>' +
          '<li>Tokens are worth 2 points if dropped in a matching colored zone, 1 point if dropped in a non-matching colored zone.</li>' +
          '<li>Blue tokens respawn in 60 seconds, while red and green tokens respawn in 120 seconds.</li>' +
          '<li>The doors to the center area will open when their respective colored sensors detect a robot or crate in it.</li></ul>',
        sumo:
          '<p>Push the opponent off the platform, but be careful not to fall off yourself!</p>',
      }
    },
    {
      option: 'timeLimit',
      title: 'Time Limit',
      type: 'checkbox',
      label: 'Stop robots when time is up',
      help: 'Only works in the arena. Stop all robot motors when time is up.'
    },
    {
      option: 'seed',
      title: 'Random Seed',
      type: 'text',
      help: 'Leave this blank to let gears pick its own random seed.'
    },
    {
      option: 'startPos',
      title: 'Starting Position (Single Player Mode)',
      type: 'select',
      options: [
        ['Player 0', '0'],
        ['Player 1', '1'],
        ['Player 2', '2'],
        ['Player 3', '3'],
      ],
      help: 'This option does nothing in Arena mode.'
    }
  ];

  this.imagesURL = {
    island: 'textures/maps/Arena/island.png',
    collector: 'textures/maps/Arena/collector.png',
    sumo: 'textures/maps/Sumo/Red Circle.png',
  };

  this.defaultOptions = {
    challenge: 'sumo',
    image: 'textures/maps/Sumo/Red Circle.png',
    length: 400,
    width: 400,
    wall: true,
    wallHeight: 10,
    wallThickness: 5,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    startPos: '0',
    timeLimit: true,
    seed: null,
    arenaStartPosXY: null,
    arenaStartRot: null
  };

  // Set options, including default
  this.setOptions = function(options) {
    Object.assign(self.options, self.defaultOptions);

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }

    self.arenaStart = self.arenaStarts[self.options.challenge];

    if (self.options.arenaStartPosXY instanceof Array) {
      for (let i=0; i < self.options.arenaStartPosXY.length; i++) {
        self.arenaStart[i].position = new BABYLON.Vector3(
          self.options.arenaStartPosXY[i][0],
          0,
          self.options.arenaStartPosXY[i][1]
        );
      }
    }

    if (self.options.arenaStartRot instanceof Array) {
      for (let i=0; i < self.options.arenaStartRot.length; i++) {
        self.arenaStart[i].rotation = new BABYLON.Vector3(
          0,
          self.options.arenaStartRot[i],
          0,
        );
      }
    }

    self.robotStart = self.arenaStart[parseInt(self.options.startPos)];

    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Create the scene
  this.load = function (scene) {
    self.setSeed(self.options.seed);

    return new Promise(function(resolve, reject) {
      if (self.options.challenge == 'island') {
        self.loadIsland(scene);
      } else if (self.options.challenge == 'collector') {
        self.loadCollector(scene);
      } else if (self.options.challenge == 'sumo') {
        self.loadSumo(scene);
      }

      resolve();
    });
  };

  // Collector map
  this.loadCollector = function(scene) {
    // Set standby game state
    self.game = {
      state: 'standby',
      startTime: null,
      renderTimeout: 0,
      teamA: 0,
      teamB: 0,
    };

    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [150, 250, 10],
      [0, 0, -10]
    );

    // Walls
    let wallMat = new BABYLON.StandardMaterial('wall', scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.47, 0.48, 0.49);
    let walls = [
      [[4,16,10],[-58,67,0]],
      [[20,4,10],[-50,57,0]],
      [[4,49,10],[-38,34.5,0]],
      [[4,65,10],[-38,-42.5,0]],
      [[4,16,10],[58,-67,0]],
      [[20,4,10],[50,-57,0]],
      [[4,49,10],[38,-34.5,0]],
      [[4,65,10],[38,42.5,0]],

      [[250,4,20],[0,77,-10]],
      [[250,4,20],[0,-77,-10]],
      [[4,158,20],[-127,0,-10]],
      [[4,158,20],[127,0,-10]],
    ];
    self.addWalls(scene, wallMat, walls);

    // Auto-doors
    let autoDoorBlue = new BABYLON.StandardMaterial('doorSensorBlue', scene);
    autoDoorBlue.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.8);
    let autoDoorYellow = new BABYLON.StandardMaterial('doorSensorYellow', scene);
    autoDoorYellow.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.1);

    let doors = [
      [[4,19.8,10],[-38,0,0]],
    ];
    let blueDoors = self.addWalls(scene, autoDoorBlue, doors);
    doors = [
      [[4,19.8,10],[38,0,0]],
    ];
    let yellowDoors = self.addWalls(scene, autoDoorYellow, doors);

    // Auto-door sensor
    let sensorBlue = new BABYLON.StandardMaterial('doorSensorBlue', scene);
    sensorBlue.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.8);
    sensorBlue.alpha = 0.3;
    sensorBlue.backFaceCulling = false;
    let sensorYellow = new BABYLON.StandardMaterial('doorSensorYellow', scene);
    sensorYellow.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.1);
    sensorYellow.alpha = 0.3;
    sensorYellow.backFaceCulling = false;

    function addSensor(size, pos, mat, door) {
      let doorSensor = self.addBox(scene, mat, [size[0],size[1],16], pos, false, false);
      doorSensor.isPickable = false;
      let doorSensorIndicator = self.addBox(scene, mat, [size[0], size[1], 2], pos, false, false);
      doorSensorIndicator.isPickable = false;
      var animateSensor = new BABYLON.Animation('doorSensor', 'position.y', 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      animateSensor.setKeys([
        { frame: 0, value: 2 },
        { frame: 5, value: 14 },
        { frame: 10, value: 2 },
      ]);
      doorSensorIndicator.animations = [animateSensor];
      scene.beginAnimation(doorSensorIndicator, 0, 10, true);

      doorSensor.door = door;

      return doorSensor;
    }

    let doorSensors = [];
    doorSensors.push(addSensor([19.9,19.9],[-50,-65,-0.1], sensorBlue, blueDoors[0]));
    doorSensors.push(addSensor([15.9,15.9],[48,-67,-0.1], sensorBlue, blueDoors[0]));
    doorSensors.push(addSensor([19.9,19.9],[50,65,-0.1], sensorYellow, yellowDoors[0]));
    doorSensors.push(addSensor([15.9,15.9],[-48,67,-0.1], sensorYellow, yellowDoors[0]));

    // Crates
    let crates = [
      [15, [-32.5, 67, 0]],
      [15, [32.5, -67, 0]]
    ];
    let crateMeshes = self.addCubeCrates(scene, 'textures/maps/Fire Rescue/woodenCrate.png', crates);

    // Magnetics
    let magnetics = [
      [-86,43.5,0],
      [-68,43.5,0],
      [-50,43.5,0],
      [-86,-43.5,0],
      [-68,-43.5,0],
      [86,-43.5,0],
      [68,-43.5,0],
      [50,-43.5,0],
      [86,43.5,0],
      [68,43.5,0],
      [self.mulberry32() * 44 - 22, self.mulberry32() * 120 - 60, 0],
      [self.mulberry32() * 44 - 22, self.mulberry32() * 120 - 60, 0],
      [self.mulberry32() * 44 - 22, self.mulberry32() * 120 - 60, 0],
      [self.mulberry32() * 44 - 22, self.mulberry32() * 120 - 60, 0],
      [self.mulberry32() * 44 - 22, self.mulberry32() * 120 - 60, 0],
    ];
    let colors = ['red','red','green','green','blue'];
    colors = self.shuffleArray(colors);
    colors = colors.concat(colors);
    colors = colors.concat(['blue','blue','blue','blue','blue']);
    self.game.magnetics = self.addMagnetics(scene, magnetics, colors);
    for (let i=0; i<10; i++) {
      self.game.magnetics[i].originalPosition = self.game.magnetics[i].position.clone();
      self.game.magnetics[i].originalRotationQuaternion = self.game.magnetics[i].rotationQuaternion.clone();
    }
    for (let i=10; i<15; i++) {
      self.game.magnetics[i].originalPosition = 'random';
      self.game.magnetics[i].originalRotationQuaternion = self.game.magnetics[i].rotationQuaternion.clone();
    }
    for (let i=0; i<15; i++) {
      if (self.game.magnetics[i].color == 'blue') {
        self.game.magnetics[i].timeout = 60000;
      } else {
        self.game.magnetics[i].timeout = 120000;
      }
    }

    // Score zones
    self.game.scoreZones = [];
    function addScoreZone(pos, color, team) {
      let scoreZone = null;
      scoreZone = self.addBox(scene, null, [20, 20, 0.4], pos, false, false, false);
      scoreZone.isPickable = false;
      scoreZone.color = color;
      scoreZone.team = team;
      self.game.scoreZones.push(scoreZone);
    }

    addScoreZone([-115, 20], 'red', 'A');
    addScoreZone([-115, -20], 'green', 'A');
    addScoreZone([115, 20], 'red', 'B');
    addScoreZone([115, -20], 'green', 'B');

    // set time limits
    self.game.TIME_LIMIT = 5 * 60 * 1000;

    // set the render and score drawing functions
    self.render = function(delta){
      self.renderDefault(delta);

      const DOOR_SPEED = 0.005;
      doorSensors.forEach(function(doorSensor) {
        let intersect = false;
        for (let i=0; i<robots.length; i++) {
          if (
            robots[i].body != null
            && doorSensor.intersectsPoint(robots[i].body.absolutePosition)
          ) {
            intersect = true;
            break;
          }
        }
        if (! intersect) {
          for (let i=0; i<crateMeshes.length; i++) {
            if (doorSensor.intersectsPoint(crateMeshes[i].absolutePosition)) {
              intersect = true;
              break;
            }
          }
        }

        if (intersect) {
          if (doorSensor.door.absolutePosition.y > -6) {
            doorSensor.door.position.y -= delta * DOOR_SPEED * 2;
          }
        } else if (doorSensor.door.absolutePosition.y < 5) {
          doorSensor.door.position.y += delta * DOOR_SPEED;
        }
      });
    };
    self.drawWorldInfo = self.drawWorldInfoDefault;

    self.buildTwoTeamsInfoPanel();
    self.drawWorldInfo();
  };

  // Sumo map
  this.loadSumo = function(scene) {
    // Set standby game state
    self.game = {
      state: 'standby',
      startTime: null,
      renderTimeout: 0,
      p0: 0,
      p1: 0,
      p2: 0,
      p3: 0,
    };

    var groundMat = new BABYLON.StandardMaterial('ground', scene);
    var groundTexture = new BABYLON.Texture(self.imagesURL[self.options.challenge], scene);
    groundMat.diffuseTexture = groundTexture;
    let physicsOptions = {
      mass: 0,
      friction: self.options.groundFriction,
      restitution: self.options.groundRestitution
    };
    self.addCylinder(scene, groundMat, [10, 200], [0,0,-10], false, physicsOptions);

    // set time limits
    self.game.TIME_LIMIT = 2 * 60 * 1000;

    // set the render and score drawing functions
    self.render = self.renderDefault;
    self.drawWorldInfo = self.drawWorldInfoDefault;

    self.buildTimeOnlyInfoPanel();
    self.drawWorldInfo();
  };

  // Island map
  this.loadIsland = function(scene) {
    // Set standby game state
    self.game = {
      state: 'standby',
      startTime: null,
      renderTimeout: 0,
      p0: 0,
      p1: 0,
      p2: 0,
      p3: 0,
    };

    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [150, 150, 10],
      [-100, 100, -10]
    );
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [150, 150, 10],
      [-100, -100, -10]
    );
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [150, 150, 10],
      [100, 100, -10]
    );
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [150, 150, 10],
      [100, -100, -10]
    );

    // set time limits
    self.game.TIME_LIMIT = 2 * 60 * 1000;

    // set the render and score drawing functions
    self.render = self.renderDefault;
    self.drawWorldInfo = self.drawWorldInfoDefault;

    self.buildFourPlayerInfoPanel();
    self.drawWorldInfo();
  };

  // set the render function
  this.renderDefault = function(delta) {
    // Run every 200ms
    self.game.renderTimeout += delta;
    if (self.game.renderTimeout > 200) {
      self.game.renderTimeout = 0;
    } else {
      return;
    }

    if (self.game.state == 'started') {
      if (self.options.challenge == 'collector') {
        self.game.scoreZones.forEach(function(scoreZone){
          self.game.magnetics.forEach(function(magnetic){
            if (scoreZone.intersectsPoint(magnetic.absolutePosition)) {
              if (scoreZone.color == magnetic.color) {
                self.game['team' + scoreZone.team] += 2;
              } else {
                self.game['team' + scoreZone.team] += 1;
              }
              magnetic.position.y = -10;
              magnetic.physicsImpostor.setMass = 0;
              setTimeout(function(){
                magnetic.physicsImpostor.setMass = 10;
                if (magnetic.originalPosition == 'random') {
                  magnetic.position.y = 0.25;
                  magnetic.position.x = self.mulberry32() * 44 - 22;
                  magnetic.position.z = self.mulberry32() * 120 - 60;
                } else {
                  magnetic.position.copyFrom(magnetic.originalPosition);
                }
                magnetic.rotationQuaternion.copyFrom(magnetic.originalRotationQuaternion);
                magnetic.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
                magnetic.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
              }, magnetic.timeout);
            }
          });
        });
      }

      self.drawWorldInfo();
    }
  };

  // Build Info panel for time only
  this.buildTimeOnlyInfoPanel = function() {
    if (typeof arenaPanel == 'undefined') {
      setTimeout(self.buildFourPlayerInfoPanel, 1000);
      return;
    }

    arenaPanel.showWorldInfoPanel();
    arenaPanel.clearWorldInfoPanel();
    let $info = $(
      '<div class="mono row">' +
        '<div class="center time"></div>' +
      '</div>'
    );
    arenaPanel.drawWorldInfo($info);

    self.infoPanel = {
      $time: $info.find('.time'),
    };
  };

  // Build Info panel for 4 players (no teams)
  this.buildFourPlayerInfoPanel = function() {
    if (typeof arenaPanel == 'undefined') {
      setTimeout(self.buildFourPlayerInfoPanel, 1000);
      return;
    }

    arenaPanel.showWorldInfoPanel();
    arenaPanel.clearWorldInfoPanel();
    let $info = $(
      '<div class="mono row">' +
        '<div class="center time"></div>' +
      '</div>' +
      '<div class="mono row">' +
        '<div class="p0"></div>' +
        '<div class="p2"></div>' +
      '</div>' +
      '<div class="mono row">' +
        '<div class="p1"></div>' +
        '<div class="p3"></div>' +
      '</div>'
    );
    arenaPanel.drawWorldInfo($info);

    self.infoPanel = {
      $time: $info.find('.time'),
      $p0: $info.find('.p0'),
      $p1: $info.find('.p1'),
      $p2: $info.find('.p2'),
      $p3: $info.find('.p3'),
    };
    self.infoPanel.$p0.on('animationend', function() {this.classList.remove('animate')});
    self.infoPanel.$p1.on('animationend', function() {this.classList.remove('animate')});
    self.infoPanel.$p2.on('animationend', function() {this.classList.remove('animate')});
    self.infoPanel.$p3.on('animationend', function() {this.classList.remove('animate')});
  };

  // Build Info panel for 2 teams
  this.buildTwoTeamsInfoPanel = function() {
    if (typeof arenaPanel == 'undefined') {
      setTimeout(self.buildTwoTeamsInfoPanel, 1000);
      return;
    }

    arenaPanel.showWorldInfoPanel();
    arenaPanel.clearWorldInfoPanel();
    let $info = $(
      '<div class="mono row">' +
        '<div class="center time"></div>' +
      '</div>' +
      '<div class="mono row">' +
        '<div class="teamA"></div>' +
        '<div class="teamB"></div>' +
      '</div>'
    );
    arenaPanel.drawWorldInfo($info);

    self.infoPanel = {
      $time: $info.find('.time'),
      $teamA: $info.find('.teamA'),
      $teamB: $info.find('.teamB'),
    };
    self.infoPanel.$teamA.on('animationend', function() {this.classList.remove('animate')});
    self.infoPanel.$teamB.on('animationend', function() {this.classList.remove('animate')});
  };

  // Set the function for drawing scores
  this.drawWorldInfoDefault = function() {
    if (typeof self.infoPanel == 'undefined') {
      setTimeout(self.drawWorldInfoDefault, 1000);
      return;
    }

    let time = self.game.TIME_LIMIT;
    if (time == Infinity) {
      time = 'Infinite';
    } else {
      if (self.game.startTime != null) {
        time -= (Date.now() - self.game.startTime);
      }
      let sign = '';
      if (time < 0) {
        sign = '-';
        time = -time;
      }
      time = Math.round(time / 1000);
      if (self.options.timeLimit && time <= 0) {
        time = 0;
        if (typeof arenaPanel != 'undefined') {
          arenaPanel.stopSim();
        }
      }

      time = sign + Math.floor(time/60) + ':' + ('0' + time % 60).slice(-2);
    }
    time = 'Time: ' + time;

    let p0 = 'P0: ' + self.game.p0;
    let p1 = 'P1: ' + self.game.p1;
    let p2 = 'P2: ' + self.game.p2;
    let p3 = 'P3: ' + self.game.p3;
    let teamA = 'Team A : ' + self.game.teamA;
    let teamB = self.game.teamB + ' : Team B';
    function updateIfChanged(text, $dom) {
      if (typeof $dom == 'undefined') {
        return;
      }
      if (text != $dom.text()) {
        $dom.text(text);
        $dom.addClass('animate');
      }
    }
    updateIfChanged(time, self.infoPanel.$time);
    updateIfChanged(p0, self.infoPanel.$p0);
    updateIfChanged(p1, self.infoPanel.$p1);
    updateIfChanged(p2, self.infoPanel.$p2);
    updateIfChanged(p3, self.infoPanel.$p3);
    updateIfChanged(teamA, self.infoPanel.$teamA);
    updateIfChanged(teamB, self.infoPanel.$teamB);
  };

  // Notify world of paintball hit. Used by robot.
  this.paintBallHit = function(robot, paintballImpostor, hit) {
    if (self.options.challenge == 'island') {
      self.game['p'+robot.player] -= 1;
      self.game['p'+paintballImpostor.object.color] += 2;
    }
  };

  // Reset game state
  this.reset = function() {
    setTimeout(function(){
      if (typeof self.game != 'undefined') {
        self.game.state = 'ready';
      }
    }, 500);
  };

  // Called by babylon and filled by individual challenges
  this.render = function(delta) {};

  // Draw world info panel and filled by individual challenges
  this.drawWorldInfo = function() {};

  // startSim
  this.startSim = function() {
    if (typeof self.game != 'undefined') {
      self.game.state = 'started';
      self.game.startTime = Date.now();
    }
  };

  // stop simulator
  this.stopSim = function() {
    if (typeof self.game != 'undefined') {
      self.game.state = 'stopped';
    }
  };

  // Set the random number seed
  this.setSeed = function(seed) {
    if (typeof seed == 'undefined' || seed == null) {
      self.seed = Date.now();
    } else {
      self.seed = parseFloat(seed);
    }
  };

  // Generate random number
  this.mulberry32 = function() {
    var t = self.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    let result = ((t ^ t >>> 14) >>> 0) / 4294967296;
    self.seed = result * 4294967296;
    return result;
  };

  // shuffle array
  this.shuffleArray = function(arr) {
    var i = arr.length, k , temp;      // k is to generate random index and temp is to swap the values
    while(--i > 0){
       k = Math.floor(self.mulberry32() * (i+1));
       temp = arr[k];
       arr[k] = arr[i];
       arr[i] = temp;
    }
    return arr;
  };

  // Load image into tile
  this.loadImageTile = function (scene, imageSrc, size, pos=[0,0,0], physicsOptions=null) {
    var mat = new BABYLON.StandardMaterial('image', scene);
    var texture = new BABYLON.Texture(imageSrc, scene);
    mat.diffuseTexture = texture;
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    if (! physicsOptions) {
      physicsOptions = {
        mass: 0,
        friction: self.options.groundFriction,
        restitution: self.options.groundRestitution
      };
    }
    let tile = self.addBox(scene, mat, size, pos, false, physicsOptions, true, [0, Math.PI/2, 0], faceUV);
    tile.receiveShadows = true;

    return tile;
  };

  // Add magnetic
  this.addMagnetics = function(scene, magnetics, colors) {
    let materials = {
      red: new BABYLON.StandardMaterial('red', scene),
      green: new BABYLON.StandardMaterial('green', scene),
      blue: new BABYLON.StandardMaterial('blue', scene),
    }
    materials.red.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
    materials.green.diffuseColor = new BABYLON.Color3(0.1, 0.9, 0.1);
    materials.blue.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.9);

    let physicsOptions = {
      mass: 10,
      friction: 0.5
    };

    let magMeshes = [];
    for (let i=0; i<magnetics.length; i++) {
      let magnetic = null;
      magnetic = self.addBox(scene, materials[colors[i]], [5, 5, 0.5], magnetics[i], true, physicsOptions);
      magnetic.color = colors[i];
      magMeshes.push(magnetic);
    }
    return magMeshes;
  };

  // Add walls
  this.addWalls = function(scene, wallMat, walls) {
    let meshes = [];

    walls.forEach(function(wall) {
      if (wall[0].length < 3) {
        wall[0].push(20);
      }
      let size = wall[0];

      if (wall[1].length < 3) {
        wall[1].push(0);
      }
      let pos = wall[1];

      meshes.push(self.addBox(scene, wallMat, size, pos));
    })

    return meshes;
  };

  // Load crate with provide image
  this.addCubeCrates = function (scene, imageSrc, crates) {
    var mat = new BABYLON.StandardMaterial('crate', scene);
    var texture = new BABYLON.Texture(imageSrc, scene);
    mat.diffuseTexture = texture;
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
    }

    let physicsOptions = {
      mass: 100,
      friction: 0.1
    };

    let meshes = [];
    crates.forEach(function(crate) {
      let size = [crate[0], crate[0], crate[0]];
      meshes.push(self.addBox(scene, mat, size, crate[1], false, physicsOptions, true, [0, 0, 0], faceUV));
    });

    return meshes;
  };

  // Add box
  this.addBox = function(scene, material, size, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null) {
    var boxOptions = {
      width: size[0],
      depth: size[1],
      height: size[2],
    };
    if (pos.length < 3) {
      pos.push(0);
    }
    if (faceUV) {
      boxOptions.faceUV = faceUV;
    }

    var box = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    if (visible) {
      box.material = material;
    } else {
      box.visibility = 0;
    }
    box.position.x = pos[0];
    box.position.y = pos[2] + size[2] / 2;
    box.position.z = pos[1];
    box.rotation.x = rot[0];
    box.rotation.y = rot[1];
    box.rotation.z = rot[2];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      box.isMagnetic = true;
    }

    if (physicsOptions !== false) {
      if (physicsOptions === true) {
        physicsOptions = {
          mass: mass,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
        };
      }

      box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box,
        BABYLON.PhysicsImpostor.BoxImpostor,
        physicsOptions,
        scene
      );
    }

    return box;
  };

  // Add a cylinder
  this.addCylinder = function (scene, material, size, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null) {
    var cylinderOptions = {
      height: size[0],
      diameter: size[1],
    };
    if (pos.length < 3) {
      pos.push(0);
    }
    if (faceUV) {
      cylinderOptions.faceUV = faceUV;
    }

    var cylinder = BABYLON.MeshBuilder.CreateCylinder('cylinder', cylinderOptions, scene);
    if (visible) {
      cylinder.material = material;
    } else {
      cylinder.visibility = 0;
    }
    cylinder.position.x = pos[0];
    cylinder.position.y = pos[2] + size[0] / 2;
    cylinder.position.z = pos[1];
    cylinder.rotation.x = rot[0];
    cylinder.rotation.y = rot[1];
    cylinder.rotation.z = rot[2];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      cylinder.isMagnetic = true;
    }

    if (physicsOptions !== false) {
      if (physicsOptions === true) {
        physicsOptions = {
          mass: mass,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
        };
      }

      cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(
        cylinder,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        physicsOptions,
        scene
      );
    }

    return cylinder;
  };
}

// Init class
world_Arena.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Arena);