var world_Gyro = new function() {
  var self = this;

  this.name = 'gyro';
  this.shortDescription = 'Gyro Challenges';
  this.longDescription =
    '<p>A series of challenges that focuses on gyro usage.</p>';
  this.thumbnail = 'images/worlds/gyro.jpg';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, -6)
  };

  this.optionsConfigurations = [
    {
      option: 'image',
      title: 'Select Challenge',
      type: 'selectWithHTML',
      options: [
        ['Straight Run', 'straight'],
        ['Square Loops', 'square'],
        ['Random Direction', 'randomDirection'],
      ],
      optionsHTML: {
        straight:
          '<p class="bold">A simple straight run.</p>' +
          '<p>You just have to drive straight to the end. Easy right?<p>',
        straightHard:
          '<p class="bold">A simple straight run.</p>' +
          '<p>You just have to drive straight to the end. Easy right?<p>',
        square:
          '<p class="bold">Drive around the square.</p>' +
          '<p>The black area can be used to help you align your turns.<p>' +
          '<p>Task 1: Drive around the loop without falling off.<p>' +
          '<p>Task 2: Complete as many loops as you can without falling off.<p>',
        randomDirection:
          '<p class="bold">Detect and drive down the path</p>' +
          '<p>Use your ultrasonic and gyro to find the wall, then drive straight down the path.<p>' +
          '<p class="bold">This world randomizes on reset!<p>',
      }
    },
    {
      option: 'straightRunWidth',
      title: 'Width of Straight Run challenge',
      type: 'slider',
      min: '18',
      max: '40',
      step: '1'
    },
  ];

  this.imagesURL = {
    straight: 'textures/maps/Gyro/Straight1.png',
    square: 'textures/maps/Gyro/Square.png',
    randomDirection: 'textures/maps/Gyro/Square.png',
  };

  this.robotStarts = {
    straight: new BABYLON.Vector3(0, 0, -504),
    square: new BABYLON.Vector3(-100, 0, -100),
    randomDirection: new BABYLON.Vector3(0, 0, -6),
  }

  this.defaultOptions = {
    image: 'straight',
    length: 100,
    width: 100,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    straightRunWidth: 18
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

    self.robotStart.position = self.robotStarts[self.options.image];

    return new Promise(function(resolve, reject) {
      if (! self.imagesURL[self.options.image]) {
        resolve();
        return;
      }

      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        self.options.length = this.width / 10.0;
        self.options.width = this.height / 10.0;

        resolve();
      }
      img.src = self.imagesURL[self.options.image];
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Load image into ground tile
  this.loadImageTile = function (scene, imageSrc, size, pos=[0,0], rot=0) {
    var groundMat = new BABYLON.StandardMaterial('ground' + imageSrc, scene);
    if (imageSrc) {
      var groundTexture = new BABYLON.Texture(imageSrc, scene);
      groundMat.diffuseTexture = groundTexture;
    }
    groundMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
        width: size[1],
        height: 10,
        depth: size[0],
        faceUV: faceUV,
        wrap: true
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
      self.obstacleMat = new BABYLON.StandardMaterial('obstacle', scene);
      self.obstacleMat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.8);

      if (self.options.image == 'straight') {
        self.loadImageTile(
          scene,
          'textures/maps/Gyro/Straight1.png',
          [self.options.width, self.options.straightRunWidth],
          [0, -1.5*257.5]
        );
        self.loadImageTile(
          scene,
          'textures/maps/Gyro/Straight2.png',
          [self.options.width, self.options.straightRunWidth],
          [0, -0.5*257.5]
        );
        self.loadImageTile(
          scene,
          'textures/maps/Gyro/Straight3.png',
          [self.options.width, self.options.straightRunWidth],
          [0, 0.5*257.5]
        );
        self.loadImageTile(
          scene,
          'textures/maps/Gyro/Straight4.png',
          [self.options.width, self.options.straightRunWidth],
          [0, 1.5*257.5]
        );
      } else if (self.options.image == 'square') {
        self.loadImageTile(
          scene,
          self.imagesURL[self.options.image],
          [self.options.width, self.options.length],
          [-self.options.width/2, self.options.length/2],
          0
        );
        self.loadImageTile(
          scene,
          self.imagesURL[self.options.image],
          [self.options.width, self.options.length],
          [self.options.length/2, self.options.width/2],
          Math.PI / 2
        );
        self.loadImageTile(
          scene,
          self.imagesURL[self.options.image],
          [self.options.width, self.options.length],
          [self.options.width/2, -self.options.length/2],
          -Math.PI
        );
        self.loadImageTile(
          scene,
          self.imagesURL[self.options.image],
          [self.options.width, self.options.length],
          [-self.options.length/2, -self.options.width/2],
          -Math.PI / 2
        );
      } else if (self.options.image == 'randomDirection') {
        let theta = Math.random() * 360;
        theta = Math.round(theta);
        theta = theta / 180 * Math.PI;
        let x = 100 * Math.cos(theta);
        let y = 100 * Math.sin(theta);

        self.loadImageTile(
          scene,
          null,
          [50, 50],
          [0, 0],
          0
        );
        self.loadImageTile(
          scene,
          self.imagesURL[self.options.image],
          [self.options.width, self.options.length],
          [x, y],
          -(theta - Math.PI / 2)
        );
        self.addBox(scene, [25,18,18], [x*2,y*2], -(theta - Math.PI), 0, self.obstacleMat)
      }

      resolve();
    });
  };

  // Add static box
  this.addBox = function(scene, size, pos, rot, mass, mat, friction=0.1, restitution=0.1) {
    var boxOptions = {
      height: size[0],
      width: size[1],
      depth: size[2]
    };

    var box = BABYLON.MeshBuilder.CreateBox('obstacle', boxOptions, scene);
    box.material = mat;
    box.position.y = size[0] / 2;
    box.position.x = pos[0];
    box.position.z = pos[1];
    box.rotation.y = rot;

    box.physicsImpostor = new BABYLON.PhysicsImpostor(
      box,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: mass,
        friction: friction,
        restitution: restitution
      },
      scene
    );
  };
}

// Init class
world_Gyro.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Gyro);