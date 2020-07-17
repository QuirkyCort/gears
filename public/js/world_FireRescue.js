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
    position: new BABYLON.Vector3(0, 0, 0)
  };

  this.optionsConfigurations = [
    {
      option: 'challenge',
      title: 'Select Challenge',
      type: 'selectWithHTML',
      options: [
        ['Fire at the Grocers', 'grocers'],
      ],
      optionsHTML: {
        grocers:
          '<p>The grocery store is on fire, and there are 7 victims inside. ' +
          'Bring the red victims to the red rescue point within the first 4 mins, and the green victims to the green rescue point.<p>' +
          '<p>You have 8 mins to rescue everyone!</p>'
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
  };

  this.robotStarts = {
    grocers: new BABYLON.Vector3(0, 0, -136.5 + 3),
  }

  this.defaultOptions = {
    challenge: 'grocers',
    random: 'fixed',
    length: 100,
    width: 100,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1
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

    self.robotStart.position = self.robotStarts[self.options.challenge];

    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Load image into ground tile
  this.loadImageTile = function (scene, imageSrc, size, pos=[0,0], rot=Math.PI/2) {
    var groundMat = new BABYLON.StandardMaterial('ground', scene);
    var groundTexture = new BABYLON.Texture(imageSrc, scene);
    groundMat.diffuseTexture = groundTexture;
    groundMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
        width: size[0],
        height: 10,
        depth: size[1],
        faceUV: faceUV
    };

    var ground = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.position.y = -5;
    ground.position.x = pos[0];
    ground.position.z = pos[1];
    ground.rotation.y = rot;

    // Physics
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        friction: self.options.groundFriction,
        restitution: self.options.groundRestitution
      },
      scene
    );
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
      fire.position.y = position[1] + size / 2;
      fire.position.z = position[2];
      fire.size = size;
      setTimeout(function(){
        fire.playAnimation(0, 3, true, 100);
      }, Math.random() * 400);
      fires.push(fire);
    });

    return fires;
  }

  // Grocers challenge
  this.loadGrocers = function(scene) {
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [300, 300]
    );

    let fires = [
      [-85,0,3.5],
      [40.7,0,1.9],
      [-47.4,0,126.3],
      [78.9,0,127.9],
      [120.3,0,40.7],
    ];
    self.addSpriteFire(scene, fires, 30);

    let wallMat = new BABYLON.StandardMaterial('wall', scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.72, 0.45, 0.40);
    let walls = [
      [0.15,140.1,286.7,8],
      [-139.2,76.05,8,120.1],
      [139.5,76.05,8,120.1],
      [-81,12,124.6,8],
      [81,12,124.6,8],
    ];
    walls.forEach(function(wall){
      self.addBox(scene, wallMat, [20, wall[2], wall[3]], [wall[0], wall[1]]);
    })

    let redMat = new BABYLON.StandardMaterial('red', scene);
    redMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
    let greenMat = new BABYLON.StandardMaterial('green', scene);
    greenMat.diffuseColor = new BABYLON.Color3(0.1, 0.9, 0.1);
    let victims = [
      [-85.7,120.9],
      [-0.1,120.4],
      [102.6,120.6],
      [-122.9,74.7],
      [46.3,74.6],
      [-85.7,26.9],
      [84.6,28],
    ];
    let red = [1,1,1,0,0,0,0];
    if (self.options.random == 'random') {
      red = self.shuffleArray(red);
    }
    self.game.victims = [];
    for (let i=0; i<victims.length; i++) {
      let victim = null;
      if (red[i]) {
        victim = self.addBox(scene, redMat, [0.5, 5, 5], victims[i], true);
        victim.color = 'red';
      } else {
        victim = self.addBox(scene, greenMat, [0.5, 5, 5], victims[i], true);
        victim.color = 'green';
      }
      self.game.victims.push(victim);
    }

    self.game.startMesh = self.addBox(scene, null, [30, 27, 27], [0, -136.5], false, false, false);
    self.game.startMesh.isPickable = false;

    self.game.redRescueMesh = self.addBox(scene, null, [0.4, 70, 30], [-85, -120], false, false, false);
    self.game.redRescueMesh.isPickable = false;

    self.game.greenRescueMesh = self.addBox(scene, null, [0.4, 70, 30], [85, -120], false, false, false);
    self.game.greenRescueMesh.isPickable = false;

    // set time limits
    const RED_EXPIRY = 4 * 60 * 1000;
    const TIME_LIMIT = 8 * 60 * 1000;

    // set the render function
    self.render = function(delta) {
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
          if ((Date.now() - self.game.startTime) > RED_EXPIRY) {
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
          }
        });

        self.drawWorldInfo();
      }
    };

    // Set the function for drawing scores
    self.drawWorldInfo = function() {
      let time = TIME_LIMIT;
      if (self.game.startTime != null) {
        time -= (Date.now() - self.game.startTime);
      }
      time = Math.round(time / 1000);
      time = Math.floor(time/60) + ':' + ('0' + time % 60).slice(-2);

      let html =
        '<div class="mono row">' +
          '<div class="center">Time ' + time + '</div>' +
        '</div>' +
        '<div class="mono row">' +
          '<div class="">Red: ' + self.game.red + '</div>' +
          '<div class="">Green: ' + self.game.green + '</div>' +
          '<div class="">Score: ' + self.game.score + '</div>' +
        '</div>';

      if (html != self.cachedHtml) {
        simPanel.drawWorldInfo(html);
        self.cachedHtml = html;
      }
    }

    self.drawWorldInfo();
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
      simPanel.showWorldInfoPanel();

      if (self.options.challenge == 'grocers') {
        self.loadGrocers(scene);
      }

      resolve();
    });
  };

  // Reset game state
  this.reset = function() {
    self.game.state = 'ready';
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

  // Add static box
  this.addBox = function(scene, material, size, pos, magnetic=false, physics=true, visible=true) {
    var boxOptions = {
      height: size[0],
      width: size[1],
      depth: size[2]
    };

    var box = BABYLON.MeshBuilder.CreateBox('obstacle', boxOptions, scene);
    if (visible) {
      box.material = material;
    } else {
      box.visibility = 0;
    }
    box.position.y = size[0] / 2;
    box.position.x = pos[0];
    box.position.z = pos[1];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      box.isMagnetic = true;
    }

    if (physics) {
      box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: mass,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
        },
        scene
      );
      if (magnetic) {
        box.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
      }
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