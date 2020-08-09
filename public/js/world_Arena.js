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
    plain: [
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
        ['Plain', 'plain'],
        ['Paintball Islands', 'island'],
        ['Sumo', 'sumo']
      ],
      optionsHTML: {
        plain:
          '<p>Just a plain arena.</p>' +
          '<p>There are no missions or objectives here. ' +
          'It is up to you to decide what to do. ' +
          'You can use it for a synchronized robot dance, shoot paintballs at each other, or just ram each other for fun.</p>',
        island:
          '<p>Every robot is on its own island. ' +
          'You have 2 mins to hit your opponent with your paintballs, while avoiding being hit yourself. ' +
          'Be careful not to fall off! Robots that have fallen off their island are disqualified.</p>' +
          '<ul><li>Hitting an opponent with your paintball will gain you 2 points.</li>' +
          '<li>Being hit with a paintball will deduct 1 point from your score.</li></ul>',
        sumo:
          '<p>Push the opponent off the platform, but be careful not to fall off yourself!</p>',
      }
    },
    {
      option: 'timeLimit',
      title: 'Time Limit',
      type: 'checkbox',
      label: 'Enforce',
      help: 'If enforced, the robots will be automatically stopped when time is up.'
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
    plain: 'textures/maps/grid.png',
    island: 'textures/maps/Arena/island.png',
    sumo: 'textures/maps/Sumo/Red Circle.png',
  };

  this.defaultOptions = {
    challenge: 'plain',
    image: 'textures/maps/grid.png',
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
    timeLimit: true
  };

  // Set options, including default
  this.setOptions = function(options) {
    let tmpOptions = {};
    Object.assign(tmpOptions, self.defaultOptions);
    Object.assign(tmpOptions, self.options);
    Object.assign(self.options, tmpOptions);

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }

    self.arenaStart = self.arenaStarts[self.options.challenge];
    self.robotStart = self.arenaStarts[parseInt(self.options.startPos)];

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
    return new Promise(function(resolve, reject) {
      if (self.options.challenge == 'plain') {
        self.loadPlain(scene);
      } else if (self.options.challenge == 'island') {
        self.loadIsland(scene);
      } else if (self.options.challenge == 'sumo') {
        self.loadSumo(scene);
      }

      resolve();
    });
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
    self.addCylinder(scene, groundMat, [10, 200], [0,0,-10]);

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

  // Plain grid map
  this.loadPlain = function(scene) {
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

    var options = self.options;

    var groundMat = new BABYLON.StandardMaterial('ground', scene);
    var groundTexture = new BABYLON.Texture(options.image, scene);
    groundMat.diffuseTexture = groundTexture;
    groundMat.diffuseTexture.uScale = options.width / 20;
    groundMat.diffuseTexture.vScale = options.length / 20;
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
        width: options.length,
        height: 10,
        depth: options.width,
        faceUV: faceUV
    };

    var ground = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.position.y = -5;

    if (options.wall) {
      var wallMat = new BABYLON.StandardMaterial('wallMat', scene);
      wallMat.diffuseColor = new BABYLON.Color3(0.64, 0.64, 0.64);
      wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      let wall1 = {
        height: options.wallHeight + 10,
        width: options.length + options.wallThickness * 2,
        depth: options.wallThickness
      }

      var wallTop = BABYLON.MeshBuilder.CreateBox('wallTop', wall1, scene);
      wallTop.position.y = wall1.height / 2 - 10;
      wallTop.position.z = (options.width + options.wallThickness) / 2;
      wallTop.material = wallMat;

      var wallBottom = BABYLON.MeshBuilder.CreateBox('wallBottom', wall1, scene);
      wallBottom.position.y = wall1.height / 2 - 10;
      wallBottom.position.z = -(options.width + options.wallThickness) / 2;
      wallBottom.material = wallMat;

      let wall2 = {
        height: options.wallHeight + 10,
        width: options.wallThickness,
        depth: options.width
      }

      var wallLeft = BABYLON.MeshBuilder.CreateBox('wallLeft', wall2, scene);
      wallLeft.position.y = wall1.height / 2 - 10;
      wallLeft.position.x = -(options.length + options.wallThickness) / 2;
      wallLeft.material = wallMat;

      var wallRight = BABYLON.MeshBuilder.CreateBox('wallRight', wall2, scene);
      wallRight.position.y = wall1.height / 2 - 10;
      wallRight.position.x = (options.length + options.wallThickness) / 2;
      wallRight.material = wallMat;
    }

    // Physics
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        friction: options.groundFriction,
        restitution: options.groundRestitution
      },
      scene
    );

    if (options.wall) {
      var wallOptions = {
        mass: 0,
        friction: options.wallFriction,
        restitution: options.wallRestitution
      };
      wallTop.physicsImpostor = new BABYLON.PhysicsImpostor(
        wallTop,
        BABYLON.PhysicsImpostor.BoxImpostor,
        wallOptions,
        scene
      );
      wallBottom.physicsImpostor = new BABYLON.PhysicsImpostor(
        wallBottom,
        BABYLON.PhysicsImpostor.BoxImpostor,
        wallOptions,
        scene
      );
      wallLeft.physicsImpostor = new BABYLON.PhysicsImpostor(
        wallLeft,
        BABYLON.PhysicsImpostor.BoxImpostor,
        wallOptions,
        scene
      );
      wallRight.physicsImpostor = new BABYLON.PhysicsImpostor(
        wallRight,
        BABYLON.PhysicsImpostor.BoxImpostor,
        wallOptions,
        scene
      );
    }

    // set time limits
    self.game.TIME_LIMIT = Infinity;

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
      if (magnetic) {
        box.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
      }
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
      if (magnetic) {
        cylinder.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
      }
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