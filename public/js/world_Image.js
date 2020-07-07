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
    position: new BABYLON.Vector3(0, 0, 0)
  };

  this.optionsConfigurations = [
    {
      option: 'image',
      title: 'Select Image',
      type: 'select',
      options: [
        ['WRO 2019', 'textures/maps/WRO-2019-Regular-Junior.jpg'],
        ['WRO 2018', 'textures/maps/WRO-2018-Regular-Junior.png'],
        ['FLL 2019', 'textures/maps/FLL2019.jpg'],
        ['FLL 2018', 'textures/maps/FLL2018.jpg']
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
      option: 'wall',
      title: 'Wall',
      type: 'checkbox',
      label: 'Wall Present',
      checked: true
    },
    {
      option: 'wallHeight',
      title: 'Wall Height (cm)',
      type: 'slider',
      min: '0',
      max: '30',
      step: '0.1',
      default: '7.7'
    },
    {
      option: 'wallThickness',
      title: 'Wall Thickness (cm)',
      type: 'slider',
      min: '0',
      max: '30',
      step: '0.1',
      default: '4.5'
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
    }
  ];

  // Set options, including default
  this.setOptions = function(options) {
    self.options = {
      image: 'textures/maps/WRO-2019-Regular-Junior.jpg',
      length: 100,
      width: 100,
      wall: true,
      wallHeight: 7.7,
      wallThickness: 4.5,
      groundFriction: 1,
      wallFriction: 0.1,
      groundRestitution: 0.0,
      wallRestitution: 0.1,
      startPos: 'center'
    };

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
        self.options.length = this.width / 10.0;
        self.options.width = this.height / 10.0;

        if (self.options.startPos == 'center') {
          self.robotStart.position = new BABYLON.Vector3(0, 0, 0);
        } else if (self.options.startPos == 'bottomLeft') {
          let x = -(self.options.length / 2 - 12.5);
          let z = -(self.options.width / 2 - 12.5) + 9;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
        } else if (self.options.startPos == 'bottomCenter') {
          let z = -(self.options.width / 2 - 12.5) + 9;
          self.robotStart.position = new BABYLON.Vector3(0, 0, z);
        } else if (self.options.startPos == 'bottomRight') {
          let x = (self.options.length / 2 - 12.5);
          let z = -(self.options.width / 2 - 12.5) + 9;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
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

      resolve();
    });
  };
}

// Init class
world_Image.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Image);