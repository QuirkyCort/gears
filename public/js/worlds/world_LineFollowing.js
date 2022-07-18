var world_LineFollowing = new function() {
  var self = this;

  this.name = 'lineFollowing';
  this.shortDescription = 'Line Following Challenges';
  this.longDescription =
    '<p>A series of challenges relating to line following.</p>' +
    '<p>Meta challenge: Write a single program that can complete all of the challenges except "Junctions 1".</p>';
  this.thumbnail = 'images/worlds/lineFollowing.jpg';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0),
    rotation: new BABYLON.Vector3(0, 0, 0)
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
        ['Obstacles 2', 'obstacles2'],
        ['Obstacles 3', 'obstacles3'],
        ['Obstacles 4', 'obstacles4'],
        ['Junctions 1', 'junctions1'],
        ['Junctions 2', 'junctions2'],
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
          '<p>The obstacles are immovable and are 20cm x 20cm. ' +
          'You\'ll need to leave the line to navigate around them.<p>',
        obstacles2:
          '<p class="bold">Obstacles and blocked path.</p>' +
          '<p>Sometimes, there\'s only one way to navigate around the obstacle.</p>' +
          '<p class="bold">This world randomizes on reset!<p>',
        obstacles3:
          '<p class="bold">Obstacles and world edge.</p>' +
          '<p>Obstacles are not the only things that can block your path.</p>' +
          '<p class="bold">This world randomizes on reset!<p>',
        obstacles4:
          '<p class="bold">Different obstacles and lines.</p>' +
          '<p>Obstacles are not always the same size, the exit point isn\'t always opposite of the entry point either.</p>' +
          '<p>Hint: The maze runner robot can be useful for this world, but isn\'t absolutely necessary.</p>' +
          '<p class="bold">The obstacle sizes randomizes on reset!<p>',
        junctions1:
          '<p class="bold">Handling junctions.</p>' +
          '<p>Junctions are not difficult to handle, but can be tedious to program for unless you have prepared suitable functions.</p>' +
          '<p>Task 1: Pick a random point (eg. "D") and program your robot to go there and stop.</p>' +
          '<p>Task 2: Pick a series of random points (eg. "C, L, A, Q, J,") and program your robot to go to each end point in turn. ' +
          'Beep at each point and stop at the last.</p>' +
          '<p>You\'ll need a double sensor line follower robot for this world.</p>',
        junctions2:
          '<p class="bold">Turn Indicators.</p>' +
          '<p>At each junction, turn in the direction marked by the green indicator. ' +
          'Load the world to see an illustrated guide.</p>' +
          '<p>Follow the indicated turns and get to the end point.</p>' +
          '<p>You\'ll need a double sensor line follower robot for this world.</p>'
      }
    },
    {
      option: 'startPosXY',
      title: 'Starting Position (x, y)',
      type: 'text',
      help: 'Enter using this format "x, y" (in cm, without quotes) and it will override the above. Center of image is "0, 0".'
    },
    {
      option: 'startRot',
      title: 'Starting Rotation (degrees)',
      type: 'text',
      help: 'Set the starting rotation in degrees. Positive rotation is clockwise.'
    }
  ];

  this.imagesURL = {
    simple: 'textures/maps/Line Following/Simple.png',
    sharp: 'textures/maps/Line Following/Sharp.png',
    gaps1: 'textures/maps/Line Following/Gaps 1.png',
    gaps2: 'textures/maps/Line Following/Gaps 2.png',
    obstacles1: 'textures/maps/Line Following/Obstacles 1.png',
    obstacles2: 'textures/maps/Line Following/Obstacles 2.png',
    obstacles3: null,
    obstacles4: 'textures/maps/Line Following/Obstacles 4.png',
    junctions1: 'textures/maps/Line Following/Junctions 1.png',
    junctions2: 'textures/maps/Line Following/Junctions 2.png',
  };

  this.robotStarts = {
    simple: new BABYLON.Vector3(0, 0, -91),
    sharp: new BABYLON.Vector3(15, 0, -91),
    gaps1: new BABYLON.Vector3(0, 0, -91),
    gaps2: new BABYLON.Vector3(15, 0, -91),
    obstacles1: new BABYLON.Vector3(0, 0, -91),
    obstacles2: new BABYLON.Vector3(0, 0, -141),
    obstacles3: new BABYLON.Vector3(0, 0, -141),
    obstacles4: new BABYLON.Vector3(75, 0, -91),
    junctions1: new BABYLON.Vector3(0, 0, -6),
    junctions2: new BABYLON.Vector3(0, 0, -91),
  }

  this.defaultOptions = {
    image: 'simple',
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

    self.robotStart.position = self.robotStarts[self.options.image];

    if (typeof self.options.startPosXY != 'undefined' && self.options.startPosXY.trim() != '') {
      let xy = self.options.startPosXY.split(',');
      self.robotStart.position = new BABYLON.Vector3(parseFloat(xy[0]), 0, parseFloat(xy[1]));
    }
    if (typeof self.options.startRot != 'undefined' && self.options.startRot.trim() != '') {
      self.robotStart.rotation.y = parseFloat(self.options.startRot) / 180 * Math.PI;
    }

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

  // Obstacles 2
  this.loadObstacles2 = function(scene) {
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.image],
      [self.options.width, self.options.length]
    );

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
  };

  // Obstacles 3
  this.loadObstacles3 = function(scene) {
    function loadCenter(y, length) {
      self.loadImageTile(
        scene,
        'textures/maps/Line Following/Obstacles 3 Center.png',
        [length, 100],
        [0, y]
      );
    }

    function loadLeftRight(y, length) {
      let posAndRot = [];
      if (Math.random() > 0.5) {
        posAndRot = [35, Math.PI/2]
      } else {
        posAndRot = [-35, -Math.PI/2]
      }
      self.loadImageTile(
        scene,
        'textures/maps/Line Following/Obstacles 3 Left.png',
        [length, 100],
        [posAndRot[0], y],
        posAndRot[1]
      );
    }

    loadCenter(-135, 30);
    loadLeftRight(-110, 20);
    self.addBox(scene, [20,20,20], [0, -110]);

    loadCenter(-70, 60);
    loadLeftRight(-30, 20);
    loadCenter(45, 130);
    self.addBox(scene, [20,20,20], [0, -10]);

    loadLeftRight(155, 90);
    self.addBox(scene, [20,20,20], [0, 100]);
  };

  // Obstacles 4
  this.loadObstacles4 = function(scene) {
    function randomSizedBox(x, y) {
      let width = Math.random() * 30 + 10;
      let depth = Math.random() * 30 + 10;

      self.addBox(scene, [20,width,depth], [x, y]);
    }

    self.loadImageTile(
      scene,
      self.imagesURL[self.options.image],
      [self.options.width, self.options.length]
    );

    randomSizedBox(75.0, -36.9);
    randomSizedBox(-68.9, -36.9);
    randomSizedBox(-68.9, 74.6);
    randomSizedBox(-9.6, 15.3);
    randomSizedBox(73.1, 15.3);
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      self.obstacleMat = babylon.getMaterial(scene, 'CC1ACC')

      if (self.options.image == 'obstacles1') {
        self.loadImageTile(
          scene,
          self.imagesURL[self.options.image],
          [self.options.width, self.options.length]
        );

        self.addBox(scene, [20,20,20], [0, -48]);
        self.addBox(scene, [20,20,20], [0, 48]);
      } else if (self.options.image == 'obstacles2') {
        self.loadObstacles2(scene);
      } else if (self.options.image == 'obstacles3') {
        self.loadObstacles3(scene);
      } else if (self.options.image == 'obstacles4') {
        self.loadObstacles4(scene);
      } else {

        self.loadImageTile(
          scene,
          self.imagesURL[self.options.image],
          [self.options.width, self.options.length]
        );
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