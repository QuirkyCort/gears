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
      option: 'startPos',
      title: 'Starting Position',
      type: 'select',
      options: [
        ['Center', 'center'],
        ['Bottom Left', 'bottomLeft'],
        ['Bottom Center', 'bottomCenter'],
        ['Bottom Right', 'bottomRight']
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

  this.defaultOptions = {
    image: 'textures/maps/FLL2020.jpg',
    imageURL: '',
    length: 100,
    width: 100,
    imageScale: '1',
    wall: true,
    wallHeight: 7.7,
    wallThickness: 4.5,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    obstacles: [],
    magnetics: [],
    startPos: 'center',
    startPosXY: '',
    startRot: ''
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
        }

        if (typeof self.options.startPosXY != 'undefined' && self.options.startPosXY.trim() != '') {
          let xy = self.options.startPosXY.split(',');
          self.robotStart.position = new BABYLON.Vector3(parseFloat(xy[0]), 0, parseFloat(xy[1]));
        }
        if (typeof self.options.startRot != 'undefined' && self.options.startRot.trim() != '') {
          self.robotStart.rotation.y = parseFloat(self.options.startRot) / 180 * Math.PI;
        } else {
          self.robotStart.rotation.y = 0;
        }

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
        var wallMat = new BABYLON.StandardMaterial('wallMat', scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
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

  // Get material from rgba string, creating new if not existing
  this.getMaterial = function(scene, rgba, defaultRgba=null) {
    rgba = rgba.replace(/^#/g, '');
    let color = new Array(4);

    let existing = scene.getMaterialByID(rgba);
    if (existing) {
      return existing;
    }

    if (rgba.length == 3 || rgba.length == 4) {
      color[0] = parseInt(rgba[0]+rgba[0], 16) / 255;
      color[1] = parseInt(rgba[1]+rgba[1], 16) / 255;
      color[2] = parseInt(rgba[2]+rgba[2], 16) / 255;
    }

    if (rgba.length == 6 || rgba.length == 8) {
      color[0] = parseInt(rgba[0]+rgba[1], 16) / 255;
      color[1] = parseInt(rgba[2]+rgba[3], 16) / 255;
      color[2] = parseInt(rgba[4]+rgba[5], 16) / 255;
    }

    if (rgba.length == 4) {
      color[3] = parseInt(rgba[3]+rgba[3], 16) / 255;
    } else if (rgba.length == 8) {
      color[3] = parseInt(rgba[6]+rgba[7], 16) / 255;
    } else {
      color[3] = 1;
    }

    for (tmp of color) {
      if (! (tmp >= 0 && tmp <= 1)) {
        return self.getMaterial(scene, defaultRgba);
      }
    }

    let mat = new BABYLON.StandardMaterial(rgba, scene);
    mat.diffuseColor = new BABYLON.Color3(color[0], color[1], color[2]);
    mat.alpha = color[3];

    return mat;
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
        rot = obstacles[i][2];
      }
      let defaultColor = '#E6808080';
      let color = defaultColor;
      if (obstacles[i][3]) {
        color = obstacles[i][3];
      }
      let obstacleMat = self.getMaterial(scene, color, defaultColor);

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
      let magneticMat = self.getMaterial(scene, color, defaultColor);

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
world_Image.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Image);