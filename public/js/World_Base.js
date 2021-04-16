var World_Base = function() {
  var self = this;

  this.name = 'base';
  this.shortDescription = 'Base world';
  this.longDescription =
    '<p>This world is used as a base for other worlds.</p>';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0), // Overridden by position setting,
    rotation: new BABYLON.Vector3(0, 0, 0)
  };
  this.arenaStart = [
    {
      position: new BABYLON.Vector3(0, 0, 0),
      rotation: new BABYLON.Vector3(0, 0, 0)
    },
    {
      position: new BABYLON.Vector3(0, 0, 0),
      rotation: new BABYLON.Vector3(0, 0, 0)
    },
    {
      position: new BABYLON.Vector3(0, 0, 0),
      rotation: new BABYLON.Vector3(0, 0, 0)
    },
    {
      position: new BABYLON.Vector3(0, 0, 0),
      rotation: new BABYLON.Vector3(0, 0, 0)
    },
  ];

  this.defaultOptions = {
    imageURL: '',
    groundType: 'box',     // none, box, cylinder
    length: 100,
    width: 100,
    uScale: 1,
    vScale: 1,
    imageScale: 1,
    timer: 'none',         // none, up, down
    timerDuration: 60,
    timerEnd: 'continue',  // continue, stopTimer, stopRobot
    wall: true,
    wallHeight: 7.7,
    wallThickness: 4.5,
    wallColor: '#1A1A1A',
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    objects: [],
    startPos: 'center',
    startPosXYZStr: '',
    startRotStr: '',
    startPosXYZ: null,
    startRot: null,
    arenaStartPosXYZ: null,
    arenaStartRot: null
  };

  this.objectDefault = {
    type: 'box',
    position: [0,0,0],
    size: [10,10,10],
    rotationMode: 'degrees',
    rotation: [0,0,0],
    color: '#80E680',
    imageType: 'repeat',
    imageURL: '',
    uScale: 1,
    vScale: 1,
    physicsOptions: 'fixed',
    magnetic: false,
    laserDetection: null,
    ultrasonicDetection: null,
    isPickable: true
  };

  this.physicsDefault = {
    mass: 0,
    friction: 0.1,
    restitution: 0.1,
    dampLinear: 0,
    dampAngular: 0,
    group: 1,
    mask: -1
  };

  // Set default options
  this.mergeOptionsWithDefault = function(options) {
    Object.assign(self.options, self.defaultOptions);

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }
  };

  // Set options, NOT including default
  this.setOptions = function(options) {
    function processOptionsObject(options) {
      let processed = {};

      for (let key in options) {
        if (options[key] instanceof Array) {
          processed[key] = processOptionsArray(options[key]);
        } else if (typeof options[key] == 'object') {
          processed[key] = processOptionsObject(options[key]);
        } else if (typeof options[key] == 'string') {
          processed[key] = self.processSettingsString(options[key]);
        } else {
          processed[key] = options[key];
        }
      }

      return processed;
    }

    function processOptionsArray(options) {
      let processed = [];

      for (let value of options) {
        if (value instanceof Array) {
          processed.push(processOptionsArray(value));
        } else if (typeof value == 'object') {
          processed.push(processOptionsObject(value));
        } else if (typeof value == 'string') {
          processed.push(self.processSettingsString(value));
        } else {
          processed.push(value);
        }
      }

      return processed;
    }

    self.setSeed(self.options.seed);
    self.processedOptions = processOptionsObject(self.options);

    if (
      typeof self.processedOptions != 'undefined'
      && typeof self.processedOptions.imageURL != 'undefined'
      && self.processedOptions.imageURL.trim() != ''
    ) {
      self.processedOptions.image = self.processedOptions.imageURL;
    }

    if (
      typeof options != 'undefined'
      && typeof options.imageFile != 'undefined'
    ) {
      self.processedOptions.image = options.imageFile;
    }

    return new Promise(function(resolve, reject) {
      function setStartPosRot() {
        if (self.processedOptions.arenaStartPosXYZ instanceof Array) {
          for (let i=0; i < self.processedOptions.arenaStartPosXYZ.length; i++) {
            self.arenaStart[i].position = new BABYLON.Vector3(
              self.processedOptions.arenaStartPosXYZ[i][0],
              self.processedOptions.arenaStartPosXYZ[i][2],
              self.processedOptions.arenaStartPosXYZ[i][1]
            );
          }
        }

        if (self.processedOptions.arenaStartRot instanceof Array) {
          for (let i=0; i < self.processedOptions.arenaStartRot.length; i++) {
            self.arenaStart[i].rotation = new BABYLON.Vector3(
              0,
              self.processedOptions.arenaStartRot[i] / 180 * Math.PI,
              0,
            );
          }
        }

        if (self.processedOptions.startPos == 'center') {
          self.robotStart.position = new BABYLON.Vector3(0, 0, 0);
        } else if (self.processedOptions.startPos == 'bottomLeft') {
          let x = -(self.processedOptions.groundLength / 2 - 12.5);
          let z = -(self.processedOptions.groundWidth / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
        } else if (self.processedOptions.startPos == 'bottomCenter') {
          let z = -(self.processedOptions.groundWidth / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(0, 0, z);
        } else if (self.processedOptions.startPos == 'bottomRight') {
          let x = (self.processedOptions.groundLength / 2 - 12.5);
          let z = -(self.processedOptions.groundWidth / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
        } else if (self.processedOptions.startPos == 'P0') {
          self.robotStart = self.arenaStart[0];
        } else if (self.processedOptions.startPos == 'P1') {
          self.robotStart = self.arenaStart[1];
        } else if (self.processedOptions.startPos == 'P2') {
          self.robotStart = self.arenaStart[2];
        } else if (self.processedOptions.startPos == 'P3') {
          self.robotStart = self.arenaStart[3];
        }

        if (self.processedOptions.startPosXYZStr.trim() != '') {
          let xy = self.processedOptions.startPosXYZStr.split(',');
          let alt = 0;
          if (xy.length > 2) {
            alt = parseFloat(xy[2]);
          }
          self.processedOptions.startPosXYZ = [parseFloat(xy[0]), parseFloat(xy[1]), alt];
        }

        if (typeof self.processedOptions.startRotStr == 'string') {
          startRot = parseFloat(self.processedOptions.startRotStr);
        } else {
          startRot = self.processedOptions.startRotStr; // May be parsed by setting string processor
        }
        if (! isNaN(startRot)) {
          self.processedOptions.startRot = parseFloat(self.processedOptions.startRotStr);
        }

        if (typeof self.processedOptions.startPosXYZ == 'string') {
          var startPosXYZ = self.processedOptions.startPosXYZ;
        } else {
          var startPosXYZ = self.processedOptions.startPosXYZ;
        }

        if (startPosXYZ instanceof Array) {
          if (startPosXYZ.length < 3) {
            startPosXYZ.push(0);
          }
          self.robotStart.position = new BABYLON.Vector3(
            startPosXYZ[0],
            startPosXYZ[2],
            startPosXYZ[1]
          );
        }

        if (typeof self.processedOptions.startRot == 'number') {
          self.robotStart.rotation.y = self.processedOptions.startRot / 180 * Math.PI;
        }
      }

      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onerror = function() {
        showErrorModal(
          '<p>Gears cannot load this image.</p>' +
          '<p>Either the image URL is wrong, or the server that hosts this image do not allow cross origin access (...most servers do not).</p>' +
          '<p>Try hosting the image on Imgur. They are known to allow cross origin access.</p>'
        );
      };
      img.onload = function() {
        self.processedOptions.groundLength = this.width / 10.0 * self.processedOptions.imageScale * self.processedOptions.uScale;
        self.processedOptions.groundWidth = this.height / 10.0 * self.processedOptions.imageScale * self.processedOptions.vScale;

        let xPos = self.processedOptions.groundLength / 2 - 12;
        let yPos = self.processedOptions.groundWidth / 2 - 12;
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

        setStartPosRot();

        resolve();
      }
      if (self.processedOptions.groundType == 'none') {
        var VALID_STARTPOS = ['center','P0','P1','P2','P3'];
        if (VALID_STARTPOS.indexOf(self.processedOptions.startPos) == -1) {
          self.processedOptions.startPos = 'center';
        }
        setStartPosRot();
        resolve();
      } else if (typeof self.processedOptions.image != 'undefined' && self.processedOptions.image != '') {
        img.src = self.processedOptions.image;
      }
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Box ground
  this.boxGround = function(scene, groundMat) {
    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
      width: self.processedOptions.groundWidth,
      height: 10,
      depth: self.processedOptions.groundLength,
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
        friction: self.processedOptions.groundFriction,
        restitution: self.processedOptions.groundRestitution,
        group: 1,
        mask: -1
      },
      scene
    );

    return ground;
  };

  // Cylinder gound
  this.cylinderGround = function(scene, groundMat) {
    var faceUV = new Array(3);
    for (var i = 0; i < 3; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1);

    var cylinderOptions = {
      height: 10,
      diameter: self.processedOptions.groundWidth,
      tessellation: 48,
      faceUV: faceUV
    };

    var ground = BABYLON.MeshBuilder.CreateCylinder('cylinder', cylinderOptions, scene);
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.position.y = -5;

    // Physics
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.CylinderImpostor,
      {
        mass: 0,
        friction: self.processedOptions.groundFriction,
        restitution: self.processedOptions.groundRestitution,
        group: 1,
        mask: -1
      },
      scene
    );

    return ground;
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      var groundMat = new BABYLON.StandardMaterial('ground', scene);
      var groundTexture = new BABYLON.Texture(self.processedOptions.image, scene);
      groundMat.diffuseTexture = groundTexture;
      groundMat.diffuseTexture.uScale = self.processedOptions.uScale;
      groundMat.diffuseTexture.vScale = self.processedOptions.vScale;
      groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      if (self.processedOptions.groundType == 'box') {
        self.boxGround(scene, groundMat);
      } else if (self.processedOptions.groundType == 'cylinder') {
        self.cylinderGround(scene, groundMat);
      }

      if (self.processedOptions.wall && self.processedOptions.groundType == 'box') {
        var wallMat = babylon.getMaterial(scene, self.processedOptions.wallColor);

        let wall1 = {
          height: self.processedOptions.wallHeight + 10,
          width: self.processedOptions.groundLength + self.processedOptions.wallThickness * 2,
          depth: self.processedOptions.wallThickness
        }

        var wallTop = BABYLON.MeshBuilder.CreateBox('wallTop', wall1, scene);
        wallTop.position.y = wall1.height / 2 - 10;
        wallTop.position.z = (self.processedOptions.groundWidth + self.processedOptions.wallThickness) / 2;
        wallTop.material = wallMat;

        var wallBottom = BABYLON.MeshBuilder.CreateBox('wallBottom', wall1, scene);
        wallBottom.position.y = wall1.height / 2 - 10;
        wallBottom.position.z = -(self.processedOptions.groundWidth + self.processedOptions.wallThickness) / 2;
        wallBottom.material = wallMat;

        let wall2 = {
          height: self.processedOptions.wallHeight + 10,
          width: self.processedOptions.wallThickness,
          depth: self.processedOptions.groundWidth
        }

        var wallLeft = BABYLON.MeshBuilder.CreateBox('wallLeft', wall2, scene);
        wallLeft.position.y = wall1.height / 2 - 10;
        wallLeft.position.x = -(self.processedOptions.groundLength + self.processedOptions.wallThickness) / 2;
        wallLeft.material = wallMat;

        var wallRight = BABYLON.MeshBuilder.CreateBox('wallRight', wall2, scene);
        wallRight.position.y = wall1.height / 2 - 10;
        wallRight.position.x = (self.processedOptions.groundLength + self.processedOptions.wallThickness) / 2;
        wallRight.material = wallMat;

        // Wall physics
        var wallOptions = {
          mass: 0,
          friction: self.processedOptions.wallFriction,
          restitution: self.processedOptions.wallRestitution,
          group: 1,
          mask: -1
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

      // General objects
      if (self.processedOptions.objects instanceof Array) {
        let indexObj = { index: 0 };
        for (let i=0; i<self.processedOptions.objects.length; i++) {
          if (self.processedOptions.objects[i].type == 'compound') {
            self.addCompound(scene, self.processedOptions.objects[i], indexObj);
          } else {
            let options = self.mergeObjectOptionsWithDefault(self.processedOptions.objects[i]);
            let mesh = self.addObject(scene, options, indexObj.index);
            self.addPhysics(scene, mesh, options);
            indexObj.index++;
            if (typeof options.callback == 'function') {
              options.callback(mesh);
            }
          }
        }
      }

      // Show the info panel if timer is requested
      if (self.processedOptions.timer != 'none') {
        self.renderTimeout = 0;
        self.startTime = null;
        self.timeLimitReached = false;
        simPanel.showWorldInfoPanel();
        self.drawTimer(true);
      }

      resolve();
    });
  };

  // Add a compound object
  this.addCompound = function(scene, object, indexObj) {
    if (! (object.objects instanceof Array)) {
      return;
    }
    if (object.objects.length == 0) {
      return;
    }

    let options = self.mergeObjectOptionsWithDefault(object.objects[0])
    let parentMesh = self.addObject(scene, options, indexObj.index);
    indexObj.index++;

    for (let i=1; i<object.objects.length; i++) {
      let childOptions = self.mergeObjectOptionsWithDefault(object.objects[i])
      let childMesh = self.addObject(scene, childOptions, indexObj.index);
      childOptions.physicsOptions = {
        mass: 0,
        friction: 0,
        restitution: 0,
        dampLinear: 0,
        dampAngular: 0
      }
      childMesh.parent = parentMesh;
      self.addPhysics(scene, childMesh, childOptions);
      indexObj.index++;
    }

    self.addPhysics(scene, parentMesh, options);

    return parentMesh;
  };

  // Merge with default object options
  this.mergeObjectOptionsWithDefault = function(object) {
    let options = Object.assign({}, self.objectDefault);
    Object.assign(options, object);

    return options;
  };

  // Add a single object
  this.addObject = function(scene, options, index) {
    if (options.position.length < 3) {
      options.position.push(0);
    }

    let rotationRad = []
    for (let i=0; i<options.rotation.length; i++) {
      if (options.rotationMode == 'degrees') {
        rotationRad[i] = options.rotation[i] / 180 * Math.PI;
      } else {
        rotationRad[i] = options.rotation[i];
      }
    }

    let meshOptions = {
      material: babylon.getMaterial(scene, options.color),
      size: [
        options.size[0],
        options.size[1],
        options.size[2]
      ],
      position: new BABYLON.Vector3(
        options.position[0],
        options.position[2],
        options.position[1]
      ),
      rotation: new BABYLON.Vector3(rotationRad[0], rotationRad[1], rotationRad[2]),
      physicsOptions: options.physicsOptions,
      imageType: options.imageType,
      index: index
    };

    let VALID_IMAGETYPES = ['top','front','repeat','all','cylinder','sphere'];

    let imageURL = options.imageURL;
    if (VALID_IMAGETYPES.indexOf(meshOptions.imageType) != -1 && imageURL != '') {
      var material = new BABYLON.StandardMaterial('imageObject', scene);
      var texture = new BABYLON.Texture(imageURL, scene);
      material.diffuseTexture = texture;
      material.diffuseTexture.uScale = options.uScale;
      material.diffuseTexture.vScale = options.vScale;
      material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      meshOptions.material = material;
    }

    if (options.type == 'box') {
      var objectMesh = self.addBox(scene, meshOptions);
    } else if (options.type == 'cylinder') {
      var objectMesh = self.addCylinder(scene, meshOptions);
    } else if (options.type == 'sphere') {
      var objectMesh = self.addSphere(scene, meshOptions);
    } else {
      console.log('Invalid object type');
      return null;
    }

    if (options.magnetic) {
      objectMesh.isMagnetic = true;
    }

    objectMesh.isPickable = options.isPickable;

    if (typeof options.laserDetection == 'undefined' || options.laserDetection == null) {
      if (options.physicsOptions === false) {
        objectMesh.laserDetection = 'invisible';
      } else {
        objectMesh.laserDetection = 'normal';
      }
    } else {
      objectMesh.laserDetection = options.laserDetection;
    }

    if (typeof options.ultrasonicDetection == 'undefined' || options.ultrasonicDetection == null) {
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

    let id = 'worldBaseObject';
    if (typeof options.index != 'undefined') {
      id += '_sphere' + options.index;
    }
    var mesh = BABYLON.MeshBuilder.CreateSphere(id, meshOptions, scene);
    mesh.material = options.material;

    mesh.position = options.position;
    mesh.rotation = options.rotation;

    return mesh;
  };

  // Add cylinder
  this.addCylinder = function(scene, options) {
    var meshOptions = {
      height: options.size[0],
      diameter: options.size[1],
    };

    if (options.imageType == 'cylinder') {
      var faceUV = new Array(3);
      faceUV[0] = new BABYLON.Vector4(0,   0,   1/4, 1);
      faceUV[1] = new BABYLON.Vector4(3/4, 0,   1/4, 1);
      faceUV[2] = new BABYLON.Vector4(3/4, 0,   1,   1);
      meshOptions.faceUV = faceUV;
    }

    if (options.faceUV) {
      meshOptions.faceUV = options.faceUV;
    }

    let id = 'worldBaseObject';
    if (typeof options.index != 'undefined') {
      id += '_cylinder' + options.index;
    }
    var mesh = BABYLON.MeshBuilder.CreateCylinder(id, meshOptions, scene);
    mesh.material = options.material;

    mesh.position = options.position;
    mesh.rotation = options.rotation;

    return mesh;
  };

  // Add box
  this.addBox = function(scene, options) {
    var meshOptions = {
      width: options.size[0],
      depth: options.size[1],
      height: options.size[2],
      wrap: true,
    };

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }

    if (options.imageType == 'top') {
      faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
    } else if (options.imageType == 'front') {
      faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1);
    } else if (options.imageType == 'repeat') {
      for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
      }
    } else if (options.imageType == 'all') {
      faceUV[0] = new BABYLON.Vector4(0,   0,   1/3, 1/2);
      faceUV[1] = new BABYLON.Vector4(1/3, 0,   2/3, 1/2);
      faceUV[2] = new BABYLON.Vector4(2/3, 0,   1,   1/2);
      faceUV[3] = new BABYLON.Vector4(0,   1/2, 1/3, 1);
      faceUV[4] = new BABYLON.Vector4(1/3, 1/2, 2/3, 1);
      faceUV[5] = new BABYLON.Vector4(2/3, 1/2, 1,   1);
    }
    meshOptions.faceUV = faceUV;

    if (options.faceUV) {
      meshOptions.faceUV = options.faceUV;
    }

    let id = 'worldBaseObject';
    if (typeof options.index != 'undefined') {
      id += '_box' + options.index;
    }
    var mesh = BABYLON.MeshBuilder.CreateBox(id, meshOptions, scene);
    mesh.material = options.material;

    mesh.position = options.position;
    mesh.rotation = options.rotation;

    return mesh;
  };

  this.addPhysics = function(scene, mesh, options) {
    if (typeof options.physicsOptions == 'string') {
      if (options.physicsOptions == 'fixed') {
        options.physicsOptions = {
          mass: 0,
          friction: 0.1,
          restitution: 0.1,
          dampLinear: 0,
          dampAngular: 0,
          group: 1,
          mask: -1
        }
      } else if (options.physicsOptions == 'moveable') {
        options.physicsOptions = {
          mass: 10,
          friction: 0.1,
          restitution: 0.1,
          dampLinear: 0,
          dampAngular: 0,
          group: 1,
          mask: -1
        }
      } else {
        console.log('Invalid physicsOption for object. Using default.');
        options.physicsOptions = {
          mass: 0,
          friction: 0.1,
          restitution: 0.1,
          dampLinear: 0,
          dampAngular: 0,
          group: 1,
          mask: -1
        }
      }
    }

    if (options.physicsOptions !== false) {
      let physicsOptions = Object.assign({}, self.physicsDefault);
      Object.assign(physicsOptions, options.physicsOptions);

      let imposterType = null;
      if (options.type == 'box') {
        imposterType = BABYLON.PhysicsImpostor.BoxImpostor;
      } else if (options.type == 'cylinder') {
        imposterType = BABYLON.PhysicsImpostor.CylinderImpostor;
      } else if (options.type == 'sphere') {
        imposterType = BABYLON.PhysicsImpostor.SphereImpostor;
      } else {
        console.log('Invalid object type when creating physics imposter');
        return;
      }

      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        mesh,
        imposterType,
        physicsOptions,
        scene
      );

      if (physicsOptions.dampLinear != 0 && physicsOptions.dampAngular != 0) {
        mesh.physicsImpostor.physicsBody.setDamping(
          physicsOptions.dampLinear,
          physicsOptions.dampAngular
        );  
      }
    }
  };

  // startSim
  self.startSim = function() {
    if (self.processedOptions.timer != 'none' && self.startTime == null) {
      self.startTime = Date.now();
    }
  };

  // set the render functions for drawing timer
  self.render = function(delta){
    // Only run every 100ms
    self.renderTimeout += delta;
    if (self.renderTimeout < 100) {
      return;
    }
    self.renderTimeout = 0;

    if (typeof self.processedOptions != 'undefined' && self.processedOptions.timer != 'none') {
      self.drawTimer(false);
    }
  }

  // draw the timer panel
  self.drawTimer = function(rebuild) {
    if (rebuild || typeof self.$time == 'undefined') {
      simPanel.clearWorldInfoPanel();
      let $info = $(
        '<div class="mono row">' +
          '<div class="center time"></div>' +
        '</div>'
      );
      simPanel.drawWorldInfo($info);

      self.$time = $info.find('.time');
    }

    let elapsedTime = 0;
    if (self.startTime != null) {
      elapsedTime = Math.floor((Date.now() - self.startTime) / 1000);
    }

    function setTimeLimitReached() {
      if (self.timeLimitReached == false) {
        self.timeLimitReached = true;
        self.$time.addClass('warn');
        if (self.processedOptions.timerEnd == 'stopRobot') {
          simPanel.stopSim();

          var counts = 15;
          function repeatedReset() {
            if (c > 0) {
              setTimeout(repeatedReset, 100);
              robot.reset();
            }
            c--;
          }
          repeatedReset();
        }
      }
    }

    if (self.processedOptions.timer == 'up') {
      var time = elapsedTime;
      var sign = '';
      if (time >= self.processedOptions.timerDuration) {
        if (self.processedOptions.timerEnd != 'continue') {
          time = self.processedOptions.timerDuration;
        }
        setTimeLimitReached();
      }

    } else if (self.processedOptions.timer == 'down') {
      var time = self.processedOptions.timerDuration - elapsedTime;
      var sign = '';
      if (time <= 0) {
        if (self.processedOptions.timerEnd == 'continue') {
          if (time < 0) {
            sign = '-';
          }
          time = -time;
        } else {
          time = 0;
        }
        setTimeLimitReached();
      }
    }

    if (typeof time != 'undefined') {
      let timeStr = sign + Math.floor(time/60) + ':' + ('0' + time % 60).slice(-2);

      function updateIfChanged(text, $dom) {
        if (text != $dom.text()) {
          $dom.text(text);
        }
      }
      updateIfChanged(timeStr, self.$time);
    }
  };

  // process setting string
  self.processSettingsString = function(settingsString) {
    let NUMBERS = '-+0123456789';

    let fns = {};
    fns.randrange = function(string) {
      if (typeof string != 'string') {
        return string;
      }
      string = string.trim();

      let params = processTerms(string.slice(1, -1));
      if (params.length != 2) {
        return null;
      }
      if (typeof params[0] != 'number' || typeof params[1] != 'number') {
        return null;
      }

      return params[0] + self.mulberry32() * (params[1] - params[0]);
    };
    fns.randchoice = function(string) {
      if (typeof string != 'string') {
        return string;
      }
      string = string.trim();

      let params = processTerms(string.slice(1, -1));
      if (params.length == 0) {
        return null;
      }

      let choice = Math.floor(self.mulberry32() * params.length);
      return params[choice];
    };

    function processFunction(string) {
      let i;
      for (i=0; i<string.length; i++) {
        if (string[i] == '(') {
          break;
        }
      }
      let fn = string.slice(0, i);
      let remainder = string.slice(i);

      if (fn in fns) {
        return fns[fn](remainder)
      } else {
        return string;
      }
    }

    function processNumber(string) {
      if (isNaN(string)) {
        return string;
      }
      return parseFloat(string);
    }

    function processArray(string) {
      return processTerms(string.slice(1, -1));
    }

    function processString(string) {
      return string.trim().slice(1, -1);
    }

    function processTerm(string) {
      if (typeof string != 'string') {
        return string;
      }
      string = string.trim();

      if (string[0] == '\'') {
        return processString(string);
      } else if (string[0] == '[') {
        return processArray(string);
      } else if (NUMBERS.indexOf(string[0]) != -1) {
        return processNumber(string);
      } else {
        let result = processFunction(string);
        if (result === null) {
          return string;
        } else {
          return result;
        }
      }
    }

    function processTerms(string) {
      if (typeof string != 'string') {
        return string;
      }
      string = string.trim();

      let terms = [];

      let i;

      if (string[0] == '\'') {
        let closed = false;
        for (i=1; i<string.length; i++) {
          if (string[i] == '\'') {
            closed = true;
          } else if (string[i] == ',' && closed) {
            break;
          }
        }
      } else if (string[0] == '[') {
        let level = 0;
        for (i=0; i<string.length; i++) {
          if (string[i] == '[') {
            level++;
          } else if (string[i] == ']') {
            level--;
          } else if (string[i] == ',' && level == 0) {
            break;
          }
        }
      } else if (NUMBERS.indexOf(string[0]) != -1) {
        for (i=0; i<string.length; i++) {
          if (string[i] == ',') {
            break;
          }
        }
      } else {
        let level = 0;
        for (i=0; i<string.length; i++) {
          if (string[i] == '(') {
            level++;
          } else if (string[i] == ')') {
            level--;
          } else if (string[i] == ',' && level == 0) {
            break;
          }
        }
      }
      let firstTerm = string.slice(0, i);
      let remainder = string.slice(i+1);

      terms.push(processTerm(firstTerm));

      if (remainder.length > 0) {
        let r = processTerms(remainder);
        terms = terms.concat(r);
      }

      return terms;
    }

    return processTerm(settingsString);
  };

  // Set the random number seed
  this.setSeed = function(seed) {
    if (typeof seed == 'undefined' || seed == null) {
      self.seed = Date.now();
    } else {
      self.seed = parseFloat(seed);
    }
  };

  // Generate random number
  this.mulberry32 = function() {
    var t = self.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    let result = ((t ^ t >>> 14) >>> 0) / 4294967296;
    self.seed = result * 4294967296;
    return result;
  };

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


}