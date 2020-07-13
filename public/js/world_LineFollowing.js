var world_LineFollowing = new function() {
  var self = this;

  this.name = 'lineFollowing';
  this.shortDescription = 'Line Following Challenges';
  this.longDescription =
    '<p>A series of challenges relating to line following.</p>';
  this.thumbnail = 'images/worlds/lineFollowing.jpg';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0)
  };

  this.optionsConfigurations = [
    {
      option: 'image',
      title: 'Select Challenge',
      type: 'selectWithHTML',
      options: [
        ['Simple Curves', 'simple'],
        ['Sharp Turns', 'sharp'],
        ['Gaps 1', 'gaps1'],
        ['Gaps 2', 'gaps2'],
        ['Obstacles 1', 'obstacles1'],
        ['Obstacles 2', 'obstacles2']
      ],
      optionsHTML: {
        simple:
          '<p class="bold">A simple line following map.</p>' +
          '<p>You should be able to complete this using either a single sensor or double sensor line follower robot.<p>',
        sharp:
          '<p class="bold">Line following map with sharper turns.</p>' +
          '<p>It can be hard to make all the sharp turns while maintaining a smooth movement on the straights.<p>',
        gaps1:
          '<p class="bold">Line following map with gaps.</p>' +
          '<p>You\'ll need a double sensor line follower robot to cross these gaps.<p>',
        gaps2:
          '<p class="bold">Line following map with gaps (hard).</p>' +
          '<p>These gaps are wider and have only a short straight section between them.<p>',
        obstacles1:
          '<p class="bold">Line following map with obstacles.</p>' +
          '<p>The obstacles are immovable and are 20cm x 20cm.' +
          'You\'ll need to leave the line to navigate around them.<p>',
        obstacles2:
          '<p class="bold">Obstacles and blocked path.</p>' +
          '<p>Sometimes, there\'s only one way to navigate around the obstacle.</p>' +
          '<p class="bold">This world randomizes on reset!<p>'
      }
    }
  ];

  this.imagesURL = {
    simple: 'textures/maps/Line Following/Simple.png',
    sharp: 'textures/maps/Line Following/Sharp.png',
    gaps1: 'textures/maps/Line Following/Gaps 1.png',
    gaps2: 'textures/maps/Line Following/Gaps 2.png',
    obstacles1: 'textures/maps/Line Following/Obstacles 1.png',
    obstacles2: 'textures/maps/Line Following/Obstacles 2.png'
  };

  this.robotStarts = {
    simple: new BABYLON.Vector3(0, 0, -85),
    sharp: new BABYLON.Vector3(15, 0, -85),
    gaps1: new BABYLON.Vector3(0, 0, -85),
    gaps2: new BABYLON.Vector3(15, 0, -85),
    obstacles1: new BABYLON.Vector3(0, 0, -85),
    obstacles2: new BABYLON.Vector3(0, 0, -135)
  }

  this.defaultOptions = {
    image: 'simple',
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

    self.robotStart.position = self.robotStarts[self.options.image];

    return new Promise(function(resolve, reject) {
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

  // Load image into map
  this.loadImageMap = function (scene) {
    var groundMat = new BABYLON.StandardMaterial('ground', scene);
    var groundTexture = new BABYLON.Texture(self.imagesURL[self.options.image], scene);
    groundMat.diffuseTexture = groundTexture;
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
        width: self.options.width,
        height: 10,
        depth: self.options.length,
        faceUV: faceUV
    };

    var ground = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.position.y = -5;
    ground.rotation.y = Math.PI / 2;

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

      if (self.options.image == 'obstacles1') {
        self.loadImageMap(scene);

        self.addBox(scene, [20,20,20], [0, -48]);
        self.addBox(scene, [20,20,20], [0, 48]);
      } else if (self.options.image == 'obstacles2') {
        self.loadImageMap(scene);

        self.addBox(scene, [20,20,20], [0, -98]);
        if (Math.random() > 0.5) {
          self.addBox(scene, [20,30,20], [30, -123]);
        } else {
          self.addBox(scene, [20,30,20], [-30, -123]);
        }

        self.addBox(scene, [20,20,20], [0, -2]);
        if (Math.random() > 0.5) {
          self.addBox(scene, [20,30,20], [30, -2]);
        } else {
          self.addBox(scene, [20,30,20], [-30, -2]);
        }

        self.addBox(scene, [20,20,20], [0, 90]);
        if (Math.random() > 0.5) {
          self.addBox(scene, [20,30,20], [30, 115]);
        } else {
          self.addBox(scene, [20,30,20], [-30, 115]);
        }
      } else {
        self.loadImageMap(scene);
      }
      resolve();
    });
  };

  // Add static box
  this.addBox = function(scene, size, pos) {
    var boxOptions = {
      height: size[0],
      width: size[1],
      depth: size[2]
    };

    var box = BABYLON.MeshBuilder.CreateBox('obstacle', boxOptions, scene);
    box.material = self.obstacleMat;
    box.position.y = size[0] / 2;
    box.position.x = pos[0];
    box.position.z = pos[1];

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
  };
}

// Init class
world_LineFollowing.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_LineFollowing);