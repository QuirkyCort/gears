var world_TFC = new function() {
  var self = this;

  this.name = 'Trinity Firefighting competition';
  this.shortDescription = 'Trinity Firefighting competition Field';
  this.longDescription =
    '<p>This world is the Trinity Firefighting competition 2020 arena.</p>';
  this.thumbnail = 'images/worlds/tfc.png';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0), // Overridden by position setting,
    rotation: new BABYLON.Vector3(0, 0, 0)
  };
  this.arenaStart = null;

  this.optionsConfigurations = [
    {
      option: 'random',
      title: 'Random Bot',
      type: 'checkbox',
      label: 'Random Bot Position',
    },
    // {
    //   option: 'randomWalls',
    //   title: 'Random Walls',
    //   type: 'checkbox',
    //   label: 'Random Walls Positions',
    // },
    {
      option: 'randomWall',
      title: 'Random Walls',
      type: 'checkbox',
      label: 'Random Walls Positions'
    },
    {
      option: 'randomDog',
      title: 'Random Dog',
      type: 'checkbox',
      label: 'Random Dog Positions'
    },
    {
      option: 'randomFire',
      title: 'RandomFire',
      type: 'checkbox',
      label: 'Random Fire Positions'
    },
    {
      option: 'dogPos',
      title: 'Dog Position (Red)',
      type: 'select',
      options: [
        ['Pos 1', 0],
        ['Pos 2', 1],
        ['Pos 3', 2],
      ]
    },
    {
      option: 'passagePos1',
      title: 'Passage Position (Blue)',
      type: 'select',
      options: [
        ['Pos 1', 0],
        ['Pos 2', 1],
      ]
    },
    {
      option: 'passagePos2',
      title: 'Passage Position (Green)',
      type: 'select',
      options: [
        ['Pos 1', 0],
        ['Pos 2', 1],
      ]
    },
    {
      option: 'candlePos',
      title: 'Candle Position (Yellow)',
      type: 'select',
      options: [
        ['Pos 1', 0],
        ['Pos 2', 1],
        ['Pos 3', 2],
        ['Pos 4', 3],
        ['Pos 5', 4],
        ['Pos 6', 5],
        ['Pos 7', 6],
        ['Pos 8', 7],
        ['Pos 9', 8],
        ['Pos 10', 9],
        ['Pos 11', 10],
      ]
    },
    {
      option: 'wall',
      title: 'Wall',
      type: 'checkbox',
      label: 'Wall Present'
    },
    {
      option: 'wallHeight',
      title: 'Wall Height (cm)',
      type: 'slider',
      min: '0',
      max: '30',
      step: '0.1'
    },
    {
      option: 'wallThickness',
      title: 'Wall Thickness (cm)',
      type: 'slider',
      min: '0',
      max: '30',
      step: '0.1'
    },
    {
      option: 'obstacles',
      type: 'set',
      value: []
    },
    {
      option: 'startPos',
      title: 'Starting Position',
      type: 'select',
      options: [
        ['Top', 'top'],
        ['Bottom Left Room', 'bottomLeft'],
        ['Bottom Right Room', 'bottomRight'],
        ['Top Left Room', 'topLeft'],
        ['Top Right Room', 'topRight'],
      ]
    },
    {
      option: 'startRot',
      title: 'Starting Rotation (degrees)',
      type: 'select',
      options: [
        ['0', '0'],
        ['45', '45'],
        ['90', '90'],
        ['135', '135'],
        ['180', '180'],
        ['225', '225'],
        ['270', '270'],
        ['315', '315'],
      ],
      help: 'Set the starting rotation in degrees. Positive rotation is clockwise.'
    }
  ];

  this.defaultOptions = {
    image: 'textures/maps/tfc.png',
    width: 244,
    length: 244,
    wall: true,
    random: false,
    randomWall: false,
    randomDog: false,
    randomFire: false,
    wallHeight: 30.5,
    wallThickness: 1.9,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    obstacles: [],
    magnetics: [],
    startPos: 'top',
    startRot: '180',
    dogPos: 0,
    passagePos1: 0,
    passagePos2: 0,
    candlePos: 0,
  };

  var topPos = new BABYLON.Vector3(-23, 0, 97);
  var bottomLeft = new BABYLON.Vector3(-80, 0, -65);
  var bottomRight = new BABYLON.Vector3(40, 0, -70);
  var topLeft = new BABYLON.Vector3(-85, 0, 80);
  var topRight = new BABYLON.Vector3(40, 0, 50);

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

    return new Promise(function(resolve, reject) {


      let xPos = self.options.length / 2 - 12;
      let yPos = self.options.width / 2 - 12;
      self.arenaStart = [
        {
          position: new BABYLON.Vector3(-xPos, 0, yPos),
          rotation: new BABYLON.Vector3(0, Math.PI, 0)
        },
        {
          position: new BABYLON.Vector3(-xPos, 0, -yPos),
          rotation: new BABYLON.Vector3(0, 0, 0)
        },
        {
          position: new BABYLON.Vector3(xPos, 0, yPos),
          rotation: new BABYLON.Vector3(0, Math.PI, 0)
        },
        {
          position: new BABYLON.Vector3(xPos, 0, -yPos),
          rotation: new BABYLON.Vector3(0, 0, 0)
        },
      ];

      self.robotStart = {
        position: new BABYLON.Vector3(0, 0, 0),
        rotation: new BABYLON.Vector3(0, 0, 0)
      };

      if (self.options.startPos == 'top') {
        self.robotStart.position = topPos;
      } else if (self.options.startPos == 'bottomLeft') {
        self.robotStart.position = bottomLeft;
      } else if (self.options.startPos == 'bottomRight') {
        self.robotStart.position = bottomRight;
      } else if (self.options.startPos == 'topLeft') {
        self.robotStart.position = topLeft;
      } else if (self.options.startPos == 'topRight') {
        self.robotStart.position = topRight;
      }

      if (typeof self.options.startRot != 'undefined' && self.options.startRot.trim() != '') {
        self.robotStart.rotation.y = parseFloat(self.options.startRot) / 180 * Math.PI;
      }

      resolve();
    
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Create the scene
  this.load = function (scene) {
    var options = self.options;

    return new Promise(function(resolve, reject) {
      var groundMat = new BABYLON.StandardMaterial('ground', scene);
      var groundTexture = new BABYLON.Texture(options.image, scene);
      groundMat.diffuseTexture = groundTexture;
      groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      var faceUV = new Array(6);
      for (var i = 0; i < 6; i++) {
          faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
      }
      faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

      var boxOptions = {
          width: options.width,
          height: 10,
          depth: options.length,
          faceUV: faceUV
      };

      var ground = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
      ground.material = groundMat;
      ground.receiveShadows = true;
      ground.position.y = -5;
      ground.rotation.y = Math.PI / 2;

      if (options.wall) {
        var wallMat = babylon.getMaterial(scene, '1A1A1A');

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

      // obs: pos, size, rot, col
      // Walls
      self.addObstacles(scene, [
        [[36, 105 + self.options.wallThickness/2, 0], [72, self.options.wallThickness, self.options.wallHeight]],
        [[72 + self.options.wallThickness/2, 75.5, 0], [self.options.wallThickness, 59, self.options.wallHeight]],

        [[59, 151 + self.options.wallThickness * 1.5, 0],[26, self.options.wallThickness, self.options.wallHeight]],
        [[72 + self.options.wallThickness/2, 195.5 + self.options.wallThickness * 2, 0],[self.options.wallThickness, 89, self.options.wallHeight]],

        [[118 + (76 + self.options.wallThickness)/2 + self.options.wallThickness, 95 + self.options.wallThickness/2, 0],[76 + self.options.wallThickness, self.options.wallThickness, self.options.wallHeight]],

        [[118 + self.options.wallThickness * 1.5, 166.5 + self.options.wallThickness*2, 0],[self.options.wallThickness, 51, self.options.wallHeight]],
        [[192 + self.options.wallThickness * 2.5, 166.5 + self.options.wallThickness*2, 0],[self.options.wallThickness, 51, self.options.wallHeight]],
      ])
      
      var dogPosState = 0;
      var passagePos1State = 0;
      var passagePos2State = 0;
      var candlePosState = 0;
      var startPosState = 0;
      var startRot = 0;
      var _randomTester = false;
      if (self.options.randomDog){
        var x = Math.floor(Math.random() * 3)
        if (!((x == 0 && passagePos1State ==0)||(x == 2 && passagePos1State == 1))) {
          dogPosState = x;
          _randomTester = true;
        }
      }else{
        dogPosState = self.options.dogPos;
      }if(self.options.randomWall){
        console.log(passagePos1State + " " + passagePos2State);
        var x = Math.floor(Math.random() * 2);
        var y = Math.floor(Math.random() * 2);
        if (!((dogPosState == 0 && x ==0)||(dogPosState == 2 && x == 1)||(x == 1 && candlePosState == 7)||(x == 0 && candlePosState == 6)||(y == 0 && candlePosState == 5)||(y == 1 && candlePosState == 4))) {
          passagePos1State = x
          passagePos2State = y
          _randomTester = true;
        }
      }else{
        passagePos1State = self.options.passagePos1;
        passagePos2State = self.options.passagePos2;
      }if(self.options.randomFire){
        var x = Math.floor(Math.random() * 11);
        if (!((passagePos1State == 1 && x == 7)||(passagePos1State == 0 && candlePosState == 6)||(passagePos1State == 0 && x == 6)||(passagePos2State == 0 && candlePosState == 5)||(passagePos2State == 1 && x == 4))) {
          candlePosState = x;
          _randomTester = true;
        }
      }else{
        candlePosState = self.options.candlePos;
      }if(self.options.random){
        startPosState = Math.floor(Math.random() * 4);
        startRot = Math.floor(Math.random() * 8) * 45;
        _randomTester = true;
      }
      console.log("dogPosState" + dogPosState);
      console.log("passagePos1State" + passagePos1State);
      console.log("passagePos2State" + passagePos2State);
      console.log("candlePosState" + candlePosState);
      console.log("startPosState" + startPosState);
      console.log("startRot" + startRot);

      if (self.options.random){
        self.robotStart.rotation.y = startRot / 180 * Math.PI;

        switch (+startPosState){
          case 0:
            self.robotStart.position = bottomLeft;
            break;
          case 1:
            self.robotStart.position = bottomRight;
            break;
          case 2:
            self.robotStart.position = topLeft;
            break;
          case 3:
            self.robotStart.position = topRight;
            break;
        }
      }
      

      var dogPos = [0, 0, 0]
      console.log('dogPosState: ' + dogPosState);
      switch(+dogPosState){
        case 0:
          dogPos = [169 + self.options.wallThickness*2, 215 + self.options.wallThickness*2, 0];
          break;
        case 1:
          dogPos = [215 + self.options.wallThickness*2, 166.5 + self.options.wallThickness*2, 0];
          break;
        case 2:
          dogPos = [156 + self.options.wallThickness*1.5, 118 + self.options.wallThickness, 0];
          break;
        default:
          dogPos = [169 + self.options.wallThickness*2, 215 + self.options.wallThickness*2, 0];
          break;
      }
      self.addObstacles(scene, [[dogPos, [15, 15, 15], [0, 0, 0], "#ff0000"]]);


      var longWall = [0, 0, 0];
      var shortWall = [0, 0, 0];
      switch(+passagePos1State){
        case 0:
          longWall = [155 + self.options.wallThickness * 2, 141 + self.options.wallThickness*1.5, 0];
          shortWall = [132 + self.options.wallThickness * 2, 192 + self.options.wallThickness*2.5, 0];
          break;
        case 1:
          longWall = [155 + self.options.wallThickness * 2, 192 + self.options.wallThickness*2.5, 0];
          shortWall = [178 + self.options.wallThickness * 2, 141 + self.options.wallThickness*1.5, 0];
          break;
        default:
          longWall = [155 + self.options.wallThickness * 2, 141 + self.options.wallThickness*1.5, 0];
          shortWall = [132 + self.options.wallThickness * 2, 192 + self.options.wallThickness*2.5, 0];
          break;
      }
      self.addObstacles(scene, [[longWall, [74, self.options.wallThickness, self.options.wallHeight], [0, 0, 0], "#0000ff"]]);
      self.addObstacles(scene, [[shortWall, [28, self.options.wallThickness, self.options.wallHeight], [0, 0, 0], "#0000ff"]]);


      var wall = [0, 0, 0];
      switch(+passagePos2State){
        case 0:
          wall = [118 + self.options.wallThickness * 1.5, 70.5, 0];
          break;
        case 1:
          wall = [118 + self.options.wallThickness * 1.5, 24.5, 0];
          break;
        default:
          wall = [118 + self.options.wallThickness * 1.5, 70.5, 0];
          break;
      }
      self.addObstacles(scene, [[wall, [self.options.wallThickness, 49, self.options.wallHeight], [0, 0, 0], "#00ff00"]]);


      var candle = [0, 0, 0];
      switch(+candlePosState){
        case 0:
          candle = [15, 15, 0]; // lower left room, lower left corner
          break;
        case 1:
          candle = [229, 15, 0]; // lower right room, lower right corener
          break;
        case 2:
          candle = [15, 90, 0]; // lower left room, upper left corner
          break;
        case 3:
          candle = [60.5, 90, 0]; // lower left room, upper right corner
          break;
        case 4:
          candle = [132, 85, 0]; // lower right room, upper left corner
          break;
        case 5:
          candle = [132, 15, 0]; // lower right room, lower left corner
          break;
        case 6:
          candle = [183, 186, 0]; // upper right room, upper right corner
          break;
        case 7:
          candle = [132, 154, 0]; // upper right room, lower left corner
          break;
        case 8:
          candle = [60.5, 167, 0]; // upper right room, lower left corner
          break;
        case 9:
          candle = [60.5, 232, 0]; // upper right room, lower left corner
          break;
        case 10:
          candle = [15, 232, 0]; // upper right room, lower left corner
          break;
        default:
          candle = [15, 15, 0]; // lower left room, lower left corner
          break;
      }
      self.addObstacles(scene, [[candle, [10, 10, 30], [0, 0, 0], "#ffff00"]]);

      


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

      // obstacles
      if (self.options.obstacles.length > 0) {
        self.addObstacles(scene, self.options.obstacles);
      }

      // magnetic objects
      if (self.options.magnetics.length > 0) {
        self.addMagnetics(scene, self.options.magnetics);
      }

      resolve();
    });
  };

  // Add obstacles
  this.addObstacles = function(scene, obstacles) {
    var offset = [self.options.width / 2, self.options.length / 2, 0];
    let obstacleMeshes = [];
    for (let i=0; i<obstacles.length; i++) {
      let pos = [obstacles[i][0][0] - offset[0], obstacles[i][0][1] - offset[1], obstacles[i][0][2] - offset[2]];
      let size = [10, 10, 10];
      if (obstacles[i][1]) {
        size = obstacles[i][1];
      }
      let rot = [0, 0, 0];
      if (obstacles[i][2]) {
        for (let r=0; r < obstacles[i][2].length; r++){
          obstacles[i][2][r] = obstacles[i][2][r] * (Math.PI/180)
        }
        rot = obstacles[i][2];
      }
      let defaultColor = '#666666';
      let color = defaultColor;
      if (obstacles[i][3]) {
        color = obstacles[i][3];
      }
      let obstacleMat = babylon.getMaterial(scene, color);

      let obstacle = self.addBox(scene, obstacleMat, size, pos, false, true, true, rot);
      obstacleMeshes.push(obstacle);
    }
    return obstacleMeshes;
  };

  // Add magnetic
  this.addMagnetics = function(scene, magnetics) {
    let magneticMat = new BABYLON.StandardMaterial('magnetic', scene);
    magneticMat.diffuseColor = new BABYLON.Color3(0.1, 0.9, 0.1);

    let physicsOptions = {
      mass: 10,
      friction: 0.5
    };

    let magneticMeshes = [];
    for (let i=0; i<magnetics.length; i++) {
      let pos = magnetics[i][0];
      let size = [5, 5, 0.5];
      if (magnetics[i][1]) {
        size = magnetics[i][1];
      }
      let rot = [0, 0, 0];
      if (magnetics[i][2]) {
        rot = magnetics[i][2];
      }
      let defaultColor = '#1AE61AFF';
      let color = defaultColor;
      if (magnetics[i][3]) {
        color = magnetics[i][3];
      }
      let magneticMat = babylon.getMaterial(scene, color);

      let magnetic = self.addBox(scene, magneticMat, size, pos, true, physicsOptions, true, rot);
      magneticMeshes.push(magnetic);
    }
    return magneticMeshes;
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
}

// Init class
world_TFC.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_TFC);