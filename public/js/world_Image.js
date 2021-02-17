var world_Image = new function() {
  var self = this;

  this.name = 'image';
  this.shortDescription = 'Generate from image';
  this.longDescription =
    '<p>This world is automatically generated from the selected image.</p>' +
    '<p>You can use your own image or choose one of the provided images. The 3D world will be generated at a scale of 1px to 1mm.</p>';
  this.thumbnail = 'images/worlds/fll.jpg';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0), // Overridden by position setting,
    rotation: new BABYLON.Vector3(0, 0, 0)
  };
  this.arenaStart = null;

  this.optionsConfigurations = [
    {
      option: 'image',
      title: 'Select Image',
      type: 'select',
      options: [
        ['FLL 2020', 'textures/maps/FLL2020.jpg'],
        ['FLL 2019', 'textures/maps/FLL2019.jpg'],
        ['FLL 2018', 'textures/maps/FLL2018.jpg'],
        ['WRO 2020', 'textures/maps/WRO-2020-Regular-Junior.jpg'],
        ['WRO 2019', 'textures/maps/WRO-2019-Regular-Junior.jpg'],
        ['WRO 2018', 'textures/maps/WRO-2018-Regular-Junior.png'],
      ],
      help: 'You can override this by setting an image URL or uploading a file'
    },
    {
      option: 'imageURL',
      title: 'Image URL',
      type: 'text',
      help: 'This will not work with many webhosts, as they block their images from being used in a different domain. Imgur will work.'
    },
    {
      option: 'imageFile',
      title: 'Upload Image',
      type: 'file',
      accept: 'image/*',
      help: 'This will override both "Select Image" and "Image URL"'
    },
    {
      option: 'imageScale',
      title: 'Image Scale Factor',
      type: 'text',
      help: 'Scales the image (eg. when set to 2, each pixel will equal 2mm). Default to 1.'
    },
    {
      option: 'wall',
      title: 'Wall',
      type: 'checkbox',
      label: 'Wall Present'
    },
    {
      option: 'missions',
      title: 'Missions',
      type: 'checkbox',
      label: 'Mission Objects Present',
      help: '(Currently supports only the FLL 2020 mission)'
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
      option: 'magnetics',
      type: 'set',
      value: []
    },
    {
      option: 'objects',
      type: 'set',
      value: []
    },
    {
      option: 'startPos',
      title: 'Starting Position',
      type: 'select',
      options: [
        ['Image Default', 'imageDefault'],
        ['Center', 'center'],
        ['Bottom Left', 'bottomLeft'],
        ['Bottom Center', 'bottomCenter'],
        ['Bottom Right', 'bottomRight'],
        ['Player 0', 'P0'],
        ['Player 1', 'P1'],
        ['Player 2', 'P2'],
        ['Player 3', 'P3'],
      ]
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

  // Default starting position for this image in x, z, rotY (radians)
  this.imageStartPos = {
    'textures/maps/FLL2020.jpg': [-70, -40, 0],
  },

  this.missions = {
    'textures/maps/FLL2020.jpg': {
      obstacles: [
        // Step Counter (M02):
        [[40, -53, 0], [30, 7, 7], [0,0,0], '#666666'],
        // Slide (M03):
        [[0, -2, 0], [4, 10, 10], [0, 0.872664625997165, 0], '#666666'],
        // Bench (M04):
        [[-67, 15, 0], [20, 7, 7], [0, -2.87979326579064, 0], '#666666'],
        // Basketball (M05):
        [[-52, 49, 0], [7, 7, 20], [0, -2.32128790515246, 0], '#666666'],
        // Push ups (M06):
        [[12, -7, 0], [5, 10, 2], [0,0,0], '#666666'],
        [[15, -10, 0], [3, 3, 20], [0,0,0], '#666666'],
        [[27, -10, 17], [24, 3, 3], [0,0,0], '#666666'],
        [[39, -10, 0], [3, 3, 20], [0,0,0], '#666666'],
        [[42, -7, 0], [5, 10, 2], [0,0,0], '#666666'],
        // Boccia (M08):
        [[-32, 57, 0], [20, 3, 8], [0,0,0], '#666666'],
        [[-32, 60, 8], [10, 10, 3], [0,0,0], '#666666'],
        // Tire Flip (M09):
        [[55, -13, 0], [7, 7, 3], [0,0,0], '#666666'],
        [[55, 0, 0], [10, 10, 5], [0,0,0], '#666666'],
        [[42, 39, 0], [5, 15, 10], [0,0,0], '#666666'],
        // Cell Phone (M10):
        [[55, 48, 0], [10, 5, 2], [0, 0.785398163397448, 0], '#666666'],
        // Treadmill (M11):
        [[105, -41, 0], [10, 10, 5], [0,0,0], '#666666'],
        // Row Machine (M12):
        [[108, -8, 0], [5, 5, 10], [0,0,0], '#666666'],
        [[101, -11, 0], [5, 5, 2], [0,0,0], '#666666'],
        // Weight Machine (M13):
        [[103, 44, 0], [20, 5, 10], [0,0,0], '#666666'],
      ],
      magnetics: []
    }
  }

  this.defaultOptions = {
    image: 'textures/maps/FLL2020.jpg',
    imageURL: '',
    length: 100,
    width: 100,
    imageScale: '1',
    wall: true,
    missions: true,
    wallHeight: 7.7,
    wallThickness: 4.5,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    obstacles: [],
    magnetics: [],
    startPos: 'center',
    startPosXY: '-70, -40',
    startRot: '',
    objects: [],
    startPos: 'imageDefault',
    startPosXY: '',
    startRot: '',
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

    if (
      typeof options != 'undefined'
      && typeof options.imageURL != 'undefined'
      && options.imageURL.trim() != ''
    ) {
      self.options.image = options.imageURL;
    }

    if (
      typeof options != 'undefined'
      && typeof options.imageFile != 'undefined'
    ) {
      self.options.image = options.imageFile;
    }

    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        let scale = 1;
        if (self.options.imageScale.trim()) {
          scale = parseFloat(self.options.imageScale);
        }

        self.options.length = this.width / 10.0 * scale;
        self.options.width = this.height / 10.0 * scale;

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

        self.robotStart = {
          position: new BABYLON.Vector3(0, 0, 0),
          rotation: new BABYLON.Vector3(0, 0, 0)
        };

        if (self.options.startPos == 'center') {
          self.robotStart.position = new BABYLON.Vector3(0, 0, -6);
        } else if (self.options.startPos == 'bottomLeft') {
          let x = -(self.options.length / 2 - 12.5);
          let z = -(self.options.width / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
        } else if (self.options.startPos == 'bottomCenter') {
          let z = -(self.options.width / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(0, 0, z);
        } else if (self.options.startPos == 'bottomRight') {
          let x = (self.options.length / 2 - 12.5);
          let z = -(self.options.width / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
        } else if (self.options.startPos == 'P0') {
          self.robotStart = self.arenaStart[0];
        } else if (self.options.startPos == 'P1') {
          self.robotStart = self.arenaStart[1];
        } else if (self.options.startPos == 'P2') {
          self.robotStart = self.arenaStart[2];
        } else if (self.options.startPos == 'P3') {
          self.robotStart = self.arenaStart[3];
        } else if (self.options.startPos == 'imageDefault') {
          let imageStartPos = self.imageStartPos[self.options.image];
          if (typeof imageStartPos != 'undefined') {
            self.robotStart.position = new BABYLON.Vector3(imageStartPos[0], 0, imageStartPos[1]);
            self.robotStart.rotation.y = imageStartPos[2];
          } else {
            self.robotStart.position = new BABYLON.Vector3(0, 0, -6);
          }
        }

        if (typeof self.options.startPosXY != 'undefined' && self.options.startPosXY.trim() != '') {
          let xy = self.options.startPosXY.split(',');
          self.robotStart.position = new BABYLON.Vector3(parseFloat(xy[0]), 0, parseFloat(xy[1]));
        }
        if (typeof self.options.startRot != 'undefined' && self.options.startRot.trim() != '') {
          self.robotStart.rotation.y = parseFloat(self.options.startRot) / 180 * Math.PI;
        }

        if (self.options.missions && typeof self.missions[self.options.image] != 'undefined') {
          if (self.options.obstacles.length == 0) {
            self.options.obstacles = self.missions[self.options.image].obstacles;
          }
          if (self.options.magnetics.length == 0) {
            self.options.magnetics = self.missions[self.options.image].magnetics;
          }
        }

        resolve();
      }
      img.src = self.options.image;
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

      
      // 2020 Missions:
      if (self.options.image == 'textures/maps/FLL2020.jpg' && self.options.missions){
        // Step Counter (M02):
        self.addObstacles(scene, [[[40, -53, 0], [30, 7, 7]]])

        // Slide (M03):
        self.addObstacles(scene, [[[0, -2, 0], [4, 10, 10], [0, 50, 0]]])

        // Bench (M04):
        self.addObstacles(scene, [[[-67, 15, 0], [20, 7, 7], [0, -165, 0]]])

        // Basketball (M05):
        self.addObstacles(scene, [[[-52, 49, 0], [7, 7, 20], [0, -133, 0]]])

        // Push ups (M06):
        self.addObstacles(scene, [[[12, -7, 0], [5, 10, 2]], 
                                  [[15, -10, 0], [3, 3, 20]], 
                                  [[27, -10, 17], [24, 3, 3]], 
                                  [[39, -10, 0], [3, 3, 20]], 
                                  [[42, -7, 0], [5, 10, 2]]])

        // Boccia (M08):
        self.addObstacles(scene, [[[-32, 57, 0], [20, 3, 8]], 
                                  [[-32, 60, 8], [10, 10, 3]]])

        // Tire Flip (M09):
        self.addObstacles(scene, [[[55, -13, 0], [7, 7, 3]], 
                                  [[55, 0, 0], [10, 10, 5]]])

        self.addObstacles(scene, [[[42, 39, 0], [5, 15, 10]]])

        // Cell Phone (M10):
        self.addObstacles(scene, [[[55, 48, 0], [10, 5, 2], [0, 45, 0]]])

        // Treadmill (M11):
        self.addObstacles(scene, [[[105, -41, 0], [10, 10, 5]]])

        // Row Machine (M12):
        self.addObstacles(scene, [[[108, -8, 0], [5, 5, 10]], 
                                  [[101, -11, 0], [5, 5, 2]]])

        // Weight Machine (M13):
        self.addObstacles(scene, [[[103, 44, 0], [20, 5, 10]]])
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

      // obstacles
      if (self.options.obstacles.length > 0) {
        self.addObstacles(scene, self.options.obstacles);
      }

      // magnetic objects
      if (self.options.magnetics.length > 0) {
        self.addMagnetics(scene, self.options.magnetics);
      }

      // General objects
      if (self.options.objects instanceof Array) {
        for (let i=0; i<self.options.objects.length; i++) {
          self.addObject(scene, self.options.objects[i]);
        }
      }

      resolve();
    });
  };

  // Add a single object
  this.addObject = function(scene, object) {
    let options = {
      type: 'box',
      position: [0,0,0],
      size: [10,10,10],
      rotationMode: 'degrees',
      rotation: [0,0,0],
      color: '#E6808080',
      physicsOptions: 'fixed',
      magnetic: false
    };

    let tmp = JSON.parse(JSON.stringify(object));
    Object.assign(options, tmp);

    if (typeof options.physicsOptions == 'string') {
      if (options.physicsOptions == 'fixed') {
        options.physicsOptions = {
          mass: 0,
          friction: 0.1,
          restitution: 0.1
        }
      } else if (options.physicsOptions == 'moveable') {
        options.physicsOptions = {
          mass: 10,
          friction: 0.1,
          restitution: 0.1
        }
      } else {
        console.log('Invalid physicsOption for object. Using default.');
        options.physicsOptions = {
          mass: 0,
          friction: 0.1,
          restitution: 0.1
        }
      }
    }

    if (options.position.length < 3) {
      options.position.push(0);
    }

    if (options.rotationMode == 'degrees') {
      for (let i=0; i<options.rotation.length; i++) {
        options.rotation[i] = options.rotation[i] / 180 * Math.PI;
      }
    }

    let meshOptions = {
      material: babylon.getMaterial(scene, options.color),
      size: options.size,
      position: new BABYLON.Vector3(options.position[0], options.position[2],options.position[1]),
      rotation: new BABYLON.Vector3(options.rotation[0], options.rotation[1], options.rotation[2]),
      physicsOptions: options.physicsOptions
    };

    if (options.type == 'box') {
      var objectMesh = self.addBox(scene, meshOptions);
    } else if (options.type == 'cylinder') {
      var objectMesh = self.addCylinder(scene, meshOptions);
    } else if (options.type == 'sphere') {
      var objectMesh = self.addSphere(scene, meshOptions);
    }

    if (options.magnetic) {
      objectMesh.isMagnetic = true;
      objectMesh.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
    }

    if (typeof options.laserDetection == 'undefined') {
      if (options.physicsOptions === false) {
        objectMesh.laserDetection = 'invisible';
      } else {
        objectMesh.laserDetection = 'normal';
      }
    } else {
      objectMesh.laserDetection = options.laserDetection;
    }

    if (typeof options.ultrasonicDetection == 'undefined') {
      if (options.physicsOptions === false) {
        objectMesh.ultrasonicDetection = 'invisible';
      } else {
        objectMesh.ultrasonicDetection = 'normal';
      }
    } else {
      objectMesh.ultrasonicDetection = options.ultrasonicDetection;
    }

    return objectMesh;
  };

  // Add sphere
  this.addSphere = function(scene, options) {
    var meshOptions = {
      diameter: options.size[0],
    };
    if (options.faceUV) {
      meshOptions.faceUV = options.faceUV;
    }

    var mesh = BABYLON.MeshBuilder.CreateSphere('sphere', meshOptions, scene);
    mesh.material = options.material;

    mesh.position = options.position;
    mesh.rotation = options.rotation;

    if (options.physicsOptions !== false) {
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        mesh,
        BABYLON.PhysicsImpostor.SphereImpostor,
        options.physicsOptions,
        scene
      );
    }

    return mesh;
  };

  // Add cylinder
  this.addCylinder = function(scene, options) {
    var meshOptions = {
      height: options.size[0],
      diameter: options.size[1],
    };
    if (options.faceUV) {
      meshOptions.faceUV = options.faceUV;
    }

    var mesh = BABYLON.MeshBuilder.CreateCylinder('cylinder', meshOptions, scene);
    mesh.material = options.material;

    mesh.position = options.position;
    mesh.rotation = options.rotation;

    if (options.physicsOptions !== false) {
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        mesh,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        options.physicsOptions,
        scene
      );
    }

    return mesh;
  };

  // Add box
  this.addBox = function(scene, options) {
    var meshOptions = {
      width: options.size[0],
      depth: options.size[1],
      height: options.size[2],
    };
    if (options.faceUV) {
      meshOptions.faceUV = options.faceUV;
    }

    var mesh = BABYLON.MeshBuilder.CreateBox('box', meshOptions, scene);
    mesh.material = options.material;

    mesh.position = options.position;
    mesh.rotation = options.rotation;

    if (options.physicsOptions !== false) {
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        mesh,
        BABYLON.PhysicsImpostor.BoxImpostor,
        options.physicsOptions,
        scene
      );
    }

    return mesh;
  };

  // Add obstacles
  this.addObstacles = function(scene, obstacles) {
    let obstacleMeshes = [];
    for (let i=0; i<obstacles.length; i++) {
      let pos = obstacles[i][0];
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

      let obstacle = self.addBoxDeprecated(scene, obstacleMat, size, pos, false, true, true, rot);
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

      let magnetic = self.addBoxDeprecated(scene, magneticMat, size, pos, true, physicsOptions, true, rot);
      magneticMeshes.push(magnetic);
    }
    return magneticMeshes;
  };

  // Add box
  this.addBoxDeprecated = function(scene, material, size, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null) {
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
world_Image.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Image);