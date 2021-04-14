var world_FireRescue = new function() {
  var self = this;

  this.name = 'fireRescue';
  this.shortDescription = 'Fire Rescue';
  this.longDescription =
    '<p>Rescue the victims from the fire!</p>' +
    '<p>Red victims are worth 10 points, but must be rescued fast! ' +
    'Green victims are worth 5 points, and can be rescued as long as you have time left. ' +
    'Both victims can be picked up using the robot\'s magnet.</p>' +
    '<p>Your time starts when the center of your robot moves out of the starting area</p>';
  this.thumbnail = 'images/worlds/fireRescue.jpg';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0),
    rotation: new BABYLON.Vector3(0, 0, 0)
  };

  this.optionsConfigurations = [
    {
      option: 'challenge',
      title: 'Select Challenge',
      type: 'selectWithHTML',
      options: [
        ['Fire at the Grocers', 'grocers'],
        ['Warehouse Fire', 'warehouse'],
      ],
      optionsHTML: {
        grocers:
          '<p>The grocery store is on fire, and there are 7 victims inside. ' +
          'Bring the red victims to the red rescue point within the first 4 mins, and the green victims to the green rescue point.<p>' +
          '<p>You have 8 mins to rescue everyone!</p>',
        warehouse:
          '<p>Rescue the victims from the warehouse! ' +
          'Bring the red victims to the red rescue point within the first 5 mins, and the green victims to the green rescue point.<p>' +
          '<p>There are many special features in this world:</p>' +
          '<ul><li>Drop the victims in the white ambulance for a 5 points bonus each.</li>' +
          // '<li>The oil barrel near the entrance is too close to the fire. Move it out of the way before it explodes and block the exit.</li>' +
          '<li>The blue door to the inner room will open when the blue sensor area nearby detects an object inside it.</li>' +
          '<li>Are there more secrets? Find them on your own!</li></ul>' +
          '<p>You have 10 mins to rescue everyone!</p>'
      }
    },
    {
      option: 'random',
      title: 'Randomize world',
      type: 'select',
      options: [
        ['No', 'fixed'],
        ['Yes', 'random']
      ],
      help: 'Randomize position of game elements in the world.'
    }
  ];

  this.imagesURL = {
    grocers: 'textures/maps/Fire Rescue/grocers.png',
    warehouse: 'textures/maps/Fire Rescue/warehouse.png',
  };

  this.robotStarts = {
    grocers: new BABYLON.Vector3(0, 0, -142.5 + 5),
    // warehouse: new BABYLON.Vector3(-75, 0, 94), // Test autodoor
    // warehouse: new BABYLON.Vector3(-120, 0, -120), // Test breakable wall from inside
    // warehouse: new BABYLON.Vector3(-50, 0, -120), // Test breakable wall from outside
    // warehouse: new BABYLON.Vector3(30, 0, -54), // Test ramp
    // warehouse: new BABYLON.Vector3(59, 0, 74), // Test crane
    // warehouse: new BABYLON.Vector3(162, 0, 94), // Test tow
    // warehouse: new BABYLON.Vector3(15.5, 0, -96), // Test tow drop off
    warehouse: new BABYLON.Vector3(179.5, 0, -138 + 5),
  }

  this.defaultOptions = {
    challenge: 'grocers',
    random: 'fixed',
    length: 100,
    width: 100,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    startPosXY: '',
    startRot: ''
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

    self.robotStart.position = self.robotStarts[self.options.challenge];

    if (typeof self.options.startPosXY != 'undefined' && self.options.startPosXY.trim() != '') {
      let xy = self.options.startPosXY.split(',');
      self.robotStart.position = new BABYLON.Vector3(parseFloat(xy[0]), 0, parseFloat(xy[1]));
    }
    if (typeof self.options.startRot != 'undefined' && self.options.startRot.trim() != '') {
      self.robotStart.rotation.y = parseFloat(self.options.startRot) / 180 * Math.PI;
    } else {
      self.robotStart.rotation.y = 0;
    }

    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Warehouse challenge
  this.loadWarehouse = function(scene) {
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [300, 400, 10],
      [0, 0, -10]
    );

    // Raised floor
    self.loadImageTile(
      scene,
      'textures/maps/Fire Rescue/warehouse_raisedFloor.png',
      [278, 91.4, 2],
      [-141.3, -2, 0]
    );

    // Walkway
    let walkway = self.loadImageTile(
      scene,
      'textures/maps/Fire Rescue/warehouse_walkway.png',
      [200, 26, 2],
      [-74.6, 37, 40]
    );

    // Ramp
    let ramp = self.loadImageTile(
      scene,
      'textures/maps/Fire Rescue/ramp.png',
      [30, 109.8, 1],
      [-6.5,-48, 41],
      {
        mass: 200,
        friction: self.options.groundFriction,
        restitution: self.options.groundRestitution
      }
    );
    var joint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.HingeJoint, {
      mainPivot: new BABYLON.Vector3(85, 0, 13),
      connectedPivot: new BABYLON.Vector3(0, -0.5, -54.9),
      mainAxis: new BABYLON.Vector3(1, 0, 0),
      connectedAxis: new BABYLON.Vector3(1, 0, 0),
    });
    walkway.physicsImpostor.addJoint(ramp.physicsImpostor, joint);

    // Crates
    let crates = [
      [15, [48.5,-48, 0]],
      [15, [127.5,89.5, 0]]
    ];
    let cratesMeshes = self.addCubeCrates(scene, 'textures/maps/Fire Rescue/woodenCrate.png', crates);

    // Auto-door
    let sensorMat = babylon.getMaterial(scene, '2626CC4D');
    let doorSensor = self.addBox(scene, sensorMat, [25, 25, 20], [-75.1,124.5], false, false);
    doorSensor.isPickable = false;
    let doorSensorIndicator = self.addBox(scene, sensorMat, [25, 25, 2], [-75.1,124.5], false, false);
    doorSensorIndicator.isPickable = false;
    var animateSensor = new BABYLON.Animation('doorSensor', 'position.y', 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    animateSensor.setKeys([
      { frame: 0, value: 2 },
      { frame: 5, value: 18},
      { frame: 10, value: 2 },
    ]);
    doorSensorIndicator.animations = [animateSensor];
    scene.beginAnimation(doorSensorIndicator, 0, 10, true);

    let doorMat = babylon.getMaterial(scene, '2626CC');
    let doors = [
      [[5,30,38], [-98.2,75.3,2]],
    ];
    let doorMeshes = self.addWalls(scene, doorMat, doors);

    // Fire
    let fires = [
      [4.5,126.6, 0],
      [105.6,127.8, 5],
      [83.3,81.6, 0],
      [179.6,78, 0],
      [-85.3,28.7, 0],
      [-9.2,-1.2, 0],
      [150,15, 0],
      [120,-38.5, 0],
      [-83.2,-76.7, 0]
    ];
    self.addSpriteFire(scene, fires, 30);

    // Shelves
    let shelfMat = babylon.getMaterial(scene, 'C68E60');
    let shelves = [
      [[149,16,2], [102,128,3]],
      [[65,16,2], [60,128,15]],
    ];
    self.addWalls(scene, shelfMat, shelves);

    // Walls
    let wallMat = babylon.getMaterial(scene, '777A7C');
    let walls = [
      [[390,8,55], [0,141,0]],
      [[8,278,55], [-191,-2,0]],
      [[8,48.8,40], [-91.6,112.6,0]],
      [[8,166,55], [191,54,0]],
      [[8,149.2,40], [-91.6,-12.4,0]],
      [[252,8,40], [35,-25,0]],
      [[107.4,8,55], [-141.3,-145,0]],
    ];
    self.addWalls(scene, wallMat, walls);

    // Breakable walls
    let breakableWalls = [
      [[8,17.9,13], [-91.6,-96,0]],
      [[8,17.9,13], [-91.6,-114,0]],
      [[8,17.9,13], [-91.6,-132,0]],
      [[8,17.9,13], [-91.6,-96,13]],
      [[8,17.9,13], [-91.6,-114,13]],
      [[8,17.9,13], [-91.6,-132,13]],
      [[8,17.9,14], [-91.6,-96,26]],
      [[8,17.9,14], [-91.6,-114,26]],
      [[8,17.9,14], [-91.6,-132,26]],
    ];
    breakableWalls.forEach(function(breakableWall){
      self.addBox(scene, wallMat, breakableWall[0], breakableWall[1], false, { mass: 200, friction: 0.5 });
    });

    // Pillar
    let pillarMat = babylon.getMaterial(scene, '3B3D3E');
    let pillars = [
      [[10,10,40], [8.3,91.7,0]],
      [[10,10,40], [108.3,91.7,0]],
      [[10,10,40], [8.3,-8.3,0]],
      [[10,10,40], [108.3,-8.3,0]],
    ];
    self.addWalls(scene, pillarMat, pillars);

    // Ramp (at autodoor)
    let rampMat = babylon.getMaterial(scene, '191919');
    self.addRampX(scene, rampMat, 8, -2, 26, [-95.6,75.2,2], 2);

    // Obstructions
    let obstructionMat = babylon.getMaterial(scene, '3B3D3E');
    let obstructions = [
      [[10,40,10], [16,29.25,0], -0.5],
      [[10,40,10], [105.5,61.05,0], 0.2],
    ];
    obstructions.forEach(function(obstruction){
      self.addBox(scene, obstructionMat, obstruction[0], obstruction[1], false, true, true, [0, obstruction[2], 0]);
    });

    // Victims
    let victims = [
      [-74.6,126.3, 42],
      [59.1,131.1, 17],
      [161.8,126.8, 5],
      [-42.9,-11.3, 0],
      [55.3,-11.9, 0],
      [Math.random() * -68 - 110, Math.random() * 123, 2],
      [Math.random() * -68 - 110, Math.random() * 125 - 127, 2],
    ];
    let colors = [1,1,1,0,0,0,0];
    self.addVictims(scene, victims, colors);

    self.game.startMesh = self.addBox(scene, null, [27, 27, 30], [179.5, -132], false, false, false);
    self.game.startMesh.isPickable = false;

    self.game.redRescueMesh = self.addBox(scene, null, [35, 30, 0.4], [49.5, -132], false, false, false);
    self.game.redRescueMesh.isPickable = false;

    self.game.greenRescueMesh = self.addBox(scene, null, [35, 30, 0.4], [136.5, -132], false, false, false);
    self.game.greenRescueMesh.isPickable = false;

    self.addAmbulance(scene, [15.5,-132, 0], 'red');
    self.addAmbulance(scene, [102.5,-132, 0], 'green');

    // set time limits
    self.game.RED_EXPIRY = 5 * 60 * 1000;
    self.game.TIME_LIMIT = 10 * 60 * 1000;

    // set the render and score drawing functions
    self.render = function(delta){
      self.renderDefault(delta);

      const DOOR_SPEED = 0.005;
      if (
        doorSensor.intersectsPoint(robot.body.absolutePosition)
        || doorSensor.intersectsPoint(cratesMeshes[0].absolutePosition)
        || doorSensor.intersectsPoint(cratesMeshes[1].absolutePosition)
      ) {
        if (doorMeshes[0].absolutePosition.z < 121.5) {
          doorMeshes[0].position.z += delta * DOOR_SPEED;
        }
      } else {
        if (doorMeshes[0].absolutePosition.z > 75.3) {
          doorMeshes[0].position.z -= delta * DOOR_SPEED;
        }
      }
    };
    self.drawWorldInfo = self.drawWorldInfoDefault;

    self.drawWorldInfo(true);
  };

  // Grocers challenge
  this.loadGrocers = function(scene) {
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [300, 300, 10],
      [0, 0, -10]
    );

    let fires = [
      [-85,3.5, 0],
      [40.7,1.9, 0],
      [-47.4,126.3, 0],
      [78.9,127.9, 0],
      [120.3,40.7, 0],
    ];
    self.addSpriteFire(scene, fires, 30);

    let wallMat = babylon.getMaterial(scene, 'B77266');
    let walls = [
      [[286.7,8,20], [0.15,140.1,0]],
      [[8,120.1,20], [-139.2,76.05,0]],
      [[8,120.1,20], [139.5,76.05,0]],
      [[124.6,8,20], [-81,12,0]],
      [[124.5,8,20], [80.95,12,0]],
    ];
    self.addWalls(scene, wallMat, walls);

    let victims = [
      [-85.7,120.9],
      [-0.1,120.4],
      [102.6,120.6],
      [-122.9,74.7],
      [46.3,74.6],
      [-85.7,26.9],
      [84.6,28],
    ];
    let colors = [1,1,1,0,0,0,0];
    self.addVictims(scene, victims, colors);

    self.game.startMesh = self.addBox(scene, null, [27, 27, 30], [0, -136.5], false, false, false);
    self.game.startMesh.isPickable = false;

    self.game.redRescueMesh = self.addBox(scene, null, [70, 30, 0.4], [-85, -120], false, false, false);
    self.game.redRescueMesh.isPickable = false;

    self.game.greenRescueMesh = self.addBox(scene, null, [70, 30, 0.4], [85, -120], false, false, false);
    self.game.greenRescueMesh.isPickable = false;

    // set time limits
    self.game.RED_EXPIRY = 4 * 60 * 1000;
    self.game.TIME_LIMIT = 8 * 60 * 1000;

    // set the render and score drawing functions
    self.render = self.renderDefault;
    self.drawWorldInfo = self.drawWorldInfoDefault;

    self.drawWorldInfo(true);
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      // Set standby game state
      self.game = {
        state: 'standby',
        startTime: null,
        renderTimeout: 0,
        red: 0,
        green: 0,
        score: 0,
        redExpired: false
      };
      function showWorldInfoPanel() {
        if (typeof simPanel != 'undefined') {
          simPanel.showWorldInfoPanel();
        } else {
          setTimeout(showWorldInfoPanel, 1000);
        }
      }
      showWorldInfoPanel();

      if (self.options.challenge == 'grocers') {
        self.loadGrocers(scene);
      } else if (self.options.challenge == 'warehouse') {
        self.loadWarehouse(scene);
      }

      resolve();
    });
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

    if (self.game.state == 'ready') {
      if (self.game.startMesh.intersectsPoint(robot.body.absolutePosition) == false) {
        self.game.state = 'started';
        self.game.startTime = Date.now();
      }
    } else if (self.game.state == 'started') {
      if (self.game.redExpired == false) {
        if ((Date.now() - self.game.startTime) > self.game.RED_EXPIRY) {
          self.game.victims.forEach(function(victim, i, victims){
            if (victim.color == 'red') {
              victim.dispose();
              victims[i].null;
            }
          });
          self.game.redExpired = true;
        }
      }

      self.game.victims.forEach(function(victim, i, victims){
        if (victim == null) {
          return;
        } else if (self.game.redRescueMesh.intersectsPoint(victim.absolutePosition)) {
          if (victim.color == 'red') {
            self.game.red += 1;
            self.game.score += 10;
            victim.dispose();
            victims[i] = null;
          }
        } else if (self.game.greenRescueMesh.intersectsPoint(victim.absolutePosition)) {
          if (victim.color == 'green') {
            self.game.green += 1;
            self.game.score += 5;
            victim.dispose();
            victims[i] = null;
          }
        } else if (self.game.redAmbulanceMesh && self.game.redAmbulanceMesh.intersectsPoint(victim.absolutePosition)) {
          if (victim.color == 'red') {
            self.game.red += 1;
            self.game.score += 15;
            victim.dispose();
            victims[i] = null;
          }
        } else if (self.game.greenAmbulanceMesh && self.game.greenAmbulanceMesh.intersectsPoint(victim.absolutePosition)) {
          if (victim.color == 'green') {
            self.game.green += 1;
            self.game.score += 10;
            victim.dispose();
            victims[i] = null;
          }
        }
      });

      self.drawWorldInfo();
    }
  };

  // Set the function for drawing scores
  this.drawWorldInfoDefault = function(rebuild) {
    if (rebuild) {
      simPanel.clearWorldInfoPanel();
      let $info = $(
        '<div class="mono row">' +
          '<div class="center time"></div>' +
        '</div>' +
        '<div class="mono row">' +
          '<div class="red"></div>' +
          '<div class="green"></div>' +
          '<div class="score"></div>' +
        '</div>'
      );
      simPanel.drawWorldInfo($info);

      self.infoPanel = {
        $time: $info.find('.time'),
        $red: $info.find('.red'),
        $green: $info.find('.green'),
        $score: $info.find('.score')
      };
      self.infoPanel.$red.on('animationend', function() {this.classList.remove('animate')});
      self.infoPanel.$green.on('animationend', function() {this.classList.remove('animate')});
      self.infoPanel.$score.on('animationend', function() {this.classList.remove('animate')});
    }

    let time = self.game.TIME_LIMIT;
    if (self.game.startTime != null) {
      time -= (Date.now() - self.game.startTime);
    }
    let sign = '';
    if (time < 0) {
      sign = '-';
      time = -time;
    }
    time = Math.round(time / 1000);
    time = 'Time: ' + sign + Math.floor(time/60) + ':' + ('0' + time % 60).slice(-2);

    let red = 'Red: ' + self.game.red;
    let green = 'Green: ' + self.game.green;
    let score = 'Score: ' + self.game.score;
    function updateIfChanged(text, $dom) {
      if (text != $dom.text()) {
        $dom.text(text);
        $dom.addClass('animate');
      }
    }
    updateIfChanged(time, self.infoPanel.$time);
    updateIfChanged(red, self.infoPanel.$red);
    updateIfChanged(green, self.infoPanel.$green);
    updateIfChanged(score, self.infoPanel.$score);
  }

  // Reset game state
  this.reset = function() {
    setTimeout(function(){
      self.game.state = 'ready';
    }, 500);
  };

  // Called by babylon and filled by individual challenges
  this.render = function(delta) {};

  // Draw world info panel and filled by individual challenges
  this.drawWorldInfo = function() {};

  // shuffle array
  this.shuffleArray = function(arr) {
    var i = arr.length, k , temp;      // k is to generate random index and temp is to swap the values
    while(--i > 0){
       k = Math.floor(Math.random() * (i+1));
       temp = arr[k];
       arr[k] = arr[i];
       arr[i] = temp;
    }
    return arr;
  };

  // Add particlefire at position. SLOW!
  this.addParticleFire = function(scene, fires, pos) {
    BABYLON.ParticleHelper.CreateAsync("fire", scene).then((set) => {
      fires.push(set);
      set.systems.forEach(function(sys){
        sys.maxSize = 50;
        sys.worldOffset = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
      })
      set.start();
    });
  };

  // Add fire using sprite manager
  this.addSpriteFire = function(scene, positions, size) {
    var spriteManagerFire = new BABYLON.SpriteManager('FireManager', 'textures/maps/Fire Rescue/fire.png', 10, {width: 15, height: 20}, scene);

    let fires = [];
    positions.forEach(function(position){
      let fire = new BABYLON.Sprite('fire', spriteManagerFire);
      fire.position.x = position[0];
      fire.position.y = position[2] + size / 2;
      fire.position.z = position[1];
      fire.size = size;
      setTimeout(function(){
        fire.playAnimation(0, 3, true, 100);
      }, Math.random() * 400);

      fire.mesh = BABYLON.MeshBuilder.CreateCylinder('fire',  { height: 20, diameter: size / 3 }, scene);
      fire.mesh.visibility = 0;
      fire.mesh.position.x = position[0];
      fire.mesh.position.y = position[2] + 5;
      fire.mesh.position.z = position[1];
      fire.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        fire.mesh,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        { mass: 0 },
        scene
      );

      fires.push(fire);
    });

    return fires;
  };

  // Add ambulance
  this.addAmbulance = function(scene, pos, type) {
    self.addBox(scene, null, [7, 23, 8], [pos[0]-13, pos[1], pos[2]])
    self.addBox(scene, null, [1, 23, 8], [pos[0]+16, pos[1], pos[2]])
    self.addBox(scene, null, [33, 1, 8], [pos[0], pos[1]-12, pos[2]])
    self.addBox(scene, null, [33, 1, 8], [pos[0], pos[1]+12, pos[2]])

    let mesh = self.addBox(scene, null, [25, 23, 0.4], [pos[0]+3, pos[1]], false, false, false);
    mesh.isPickable = false;

    if (type == 'red') {
      self.game.redAmbulanceMesh = mesh;
    } else if (type == 'green') {
      self.game.greenAmbulanceMesh = mesh;
    }
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

  // Add victims
  this.addVictims = function(scene, victims, colors) {
    let redMat = babylon.getMaterial(scene, 'E51919');
    let greenMat = babylon.getMaterial(scene, '19E519');

    let physicsOptions = {
      mass: 10,
      friction: 0.5
    };

    if (self.options.random == 'random') {
      colors = self.shuffleArray(colors);
    }
    self.game.victims = [];
    for (let i=0; i<victims.length; i++) {
      let victim = null;
      if (colors[i] == 1) {
        victim = self.addBox(scene, redMat, [5, 5, 0.5], victims[i], true, physicsOptions);
        victim.color = 'red';
      } else {
        victim = self.addBox(scene, greenMat, [5, 5, 0.5], victims[i], true, physicsOptions);
        victim.color = 'green';
      }
      self.game.victims.push(victim);
    }
  };

  // Add a ramp in the z direction
  this.addRampZ = function (scene, mat, rampBase, rampHeight, width, pos, thickness=1) {
    let rot = Math.atan(rampHeight / rampBase);
    let boxLength = Math.sqrt(rampBase**2 + rampHeight**2);
    let size = [
      width,
      boxLength,
      thickness
    ];
    pos[2] = pos[2] - thickness / 2;
    pos[2] = pos[2] + rampHeight / 2;
    pos[2] = pos[2] - Math.cos(rot) * thickness / 2;
    pos[1] = pos[1] + rampBase / 2;
    pos[1] = pos[1] - Math.sin(rot) * thickness / 2;

    let mesh = self.addBox(scene, mat, size, pos, false, true, true, [rot, 0, 0]);

    return mesh;
  };

  // Add a ramp in the x direction
  this.addRampX = function (scene, mat, rampBase, rampHeight, width, pos, thickness=1) {
    let rot = Math.atan(rampHeight / rampBase);
    let boxLength = Math.sqrt(rampBase**2 + rampHeight**2);
    let size = [
      boxLength,
      width,
      thickness
    ];
    pos[2] = pos[2] - thickness / 2;
    pos[2] = pos[2] + rampHeight / 2;
    pos[2] = pos[2] - Math.cos(rot) * thickness / 2;
    pos[0] = pos[0] + rampBase / 2;
    pos[0] = pos[0] - Math.sin(rot) * thickness / 2;

    let mesh = self.addBox(scene, mat, size, pos, false, true, true, [0, 0, rot]);

    return mesh;
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
}

// Init class
world_FireRescue.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_FireRescue);