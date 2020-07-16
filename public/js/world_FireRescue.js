var world_FireRescue = new function() {
  var self = this;

  this.name = 'fireRescue';
  this.shortDescription = 'Fire Rescue';
  this.longDescription =
    '<p>Rescue the victims from the fire!</p>' +
    '<p>Red victims are worth 10 points, but must be rescued fast! ' +
    'Green victims are worth 5 points, and can be rescued as long as you have time left.</p>' +
    '<p>Your time starts when the center of your robot moves out of the starting area</p>';
  // this.thumbnail = 'images/worlds/lineFollowing.jpg';

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
          '<p>There are 7 randomly placed victims. ' +
          'Bring the red victims to the red rescue point within the first 2 mins, and the green victims to the green rescue point.<p>' +
          '<p>You have 4 mins to complete this challenge.</p>'
      }
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

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      // Set standby game state
      self.game = {
        state: 'standby'
      };

      if (self.options.challenge == 'grocers') {
        self.loadImageTile(
          scene,
          self.imagesURL[self.options.challenge],
          [300, 300]
        );

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
        red = self.shuffleArray(red);
        for (let i=0; i<victims.length; i++) {
          if (red[i]) {
            let victim = self.addBox(scene, redMat, [0.5, 3, 3], victims[i]);
            victim.color = 'red';
            victim.magnetic = true;
          } else {
            let victim = self.addBox(scene, greenMat, [0.5, 3, 3], victims[i]);
            victim.color = 'green';
            victim.magnetic = true;
          }
        }

        self.game.startMesh = self.addBox(scene, null, [30, 27, 27], [0, -136.5], false, false);
        self.game.startMesh.isPickable = false;
      }
      resolve();
    });
  };

  // Reset game state
  this.reset = function() {
    self.game.state = 'ready';
  };

  // Called by babylon and used to detect states
  this.render = function(delta) {
    if (self.game.state == 'ready') {
      if (self.game.startMesh.intersectsPoint(robot.body.absolutePosition) == false) {
        self.game.state = 'started';
        self.game.startTime = Date.now();
      }
    } else if (self.game.state == 'started') {
      console.log(Math.round((Date.now() - self.game.startTime)/1000));
    }
  };

  //

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
  this.addBox = function(scene, material, size, pos, physics=true, visible=true) {
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

    if (physics) {
      box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: 0,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
        },
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