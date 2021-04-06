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
    ultrasonicDetection: null
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

  // Set options, including default
  this.setOptions = function(options) {
    if (
      typeof self.options != 'undefined'
      && typeof self.options.imageURL != 'undefined'
      && self.options.imageURL.trim() != ''
    ) {
      self.options.image = self.options.imageURL;
    }

    if (
      typeof options != 'undefined'
      && typeof options.imageFile != 'undefined'
    ) {
      self.options.image = options.imageFile;
    }

    return new Promise(function(resolve, reject) {
      function setStartPosRot() {
        if (self.options.arenaStartPosXYZ instanceof Array) {
          for (let i=0; i < self.options.arenaStartPosXYZ.length; i++) {
            self.arenaStart[i].position = new BABYLON.Vector3(
              self.options.arenaStartPosXYZ[i][0],
              self.options.arenaStartPosXYZ[i][2],
              self.options.arenaStartPosXYZ[i][1]
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

        if (self.options.startPos == 'center') {
          self.robotStart.position = new BABYLON.Vector3(0, 0, 0);
        } else if (self.options.startPos == 'bottomLeft') {
          let x = -(self.options.groundLength / 2 - 12.5);
          let z = -(self.options.groundWidth / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
        } else if (self.options.startPos == 'bottomCenter') {
          let z = -(self.options.groundWidth / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(0, 0, z);
        } else if (self.options.startPos == 'bottomRight') {
          let x = (self.options.groundLength / 2 - 12.5);
          let z = -(self.options.groundWidth / 2 - 12.5) + 1;
          self.robotStart.position = new BABYLON.Vector3(x, 0, z);
        } else if (self.options.startPos == 'P0') {
          self.robotStart = self.arenaStart[0];
        } else if (self.options.startPos == 'P1') {
          self.robotStart = self.arenaStart[1];
        } else if (self.options.startPos == 'P2') {
          self.robotStart = self.arenaStart[2];
        } else if (self.options.startPos == 'P3') {
          self.robotStart = self.arenaStart[3];
        }

        if (self.options.startPosXYZStr.trim() != '') {
          let xy = self.options.startPosXYZStr.split(',');
          let alt = 0;
          if (xy.length > 2) {
            alt = parseFloat(xy[2]);
          }
          self.options.startPosXYZ = [parseFloat(xy[0]), parseFloat(xy[1]), alt];
        }

        if (self.options.startRotStr.trim() != '') {
          self.options.startRot = parseFloat(self.options.startRotStr);
        }

        if (self.options.startPosXYZ instanceof Array) {
          self.robotStart.position = new BABYLON.Vector3(self.options.startPosXYZ[0], self.options.startPosXYZ[2],self.options.startPosXYZ[1]);
        }

        if (typeof self.options.startRot == 'number') {
          self.robotStart.rotation.y = self.options.startRot / 180 * Math.PI;
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
        self.options.groundLength = this.width / 10.0 * self.options.imageScale * self.options.uScale;
        self.options.groundWidth = this.height / 10.0 * self.options.imageScale * self.options.vScale;

        let xPos = self.options.groundLength / 2 - 12;
        let yPos = self.options.groundWidth / 2 - 12;
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
      if (self.options.groundType == 'none') {
        var VALID_STARTPOS = ['center','P0','P1','P2','P3'];
        if (VALID_STARTPOS.indexOf(self.options.startPos) == -1) {
          self.options.startPos = 'center';
        }
        setStartPosRot();
        resolve();
      } else if (typeof self.options.image != 'undefined' && self.options.image != '') {
        img.src = self.options.image;
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
      width: self.options.groundWidth,
      height: 10,
      depth: self.options.groundLength,
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
      diameter: self.options.groundWidth,
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
        friction: self.options.groundFriction,
        restitution: self.options.groundRestitution
      },
      scene
    );

    return ground;
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      var groundMat = new BABYLON.StandardMaterial('ground', scene);
      var groundTexture = new BABYLON.Texture(self.options.image, scene);
      groundMat.diffuseTexture = groundTexture;
      groundMat.diffuseTexture.uScale = self.options.uScale;
      groundMat.diffuseTexture.vScale = self.options.vScale;
      groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      if (self.options.groundType == 'box') {
        self.boxGround(scene, groundMat);
      } else if (self.options.groundType == 'cylinder') {
        self.cylinderGround(scene, groundMat);
      }

      if (self.options.wall && self.options.groundType == 'box') {
        var wallMat = babylon.getMaterial(scene, self.options.wallColor);

        let wall1 = {
          height: self.options.wallHeight + 10,
          width: self.options.groundLength + self.options.wallThickness * 2,
          depth: self.options.wallThickness
        }

        var wallTop = BABYLON.MeshBuilder.CreateBox('wallTop', wall1, scene);
        wallTop.position.y = wall1.height / 2 - 10;
        wallTop.position.z = (self.options.groundWidth + self.options.wallThickness) / 2;
        wallTop.material = wallMat;

        var wallBottom = BABYLON.MeshBuilder.CreateBox('wallBottom', wall1, scene);
        wallBottom.position.y = wall1.height / 2 - 10;
        wallBottom.position.z = -(self.options.groundWidth + self.options.wallThickness) / 2;
        wallBottom.material = wallMat;

        let wall2 = {
          height: self.options.wallHeight + 10,
          width: self.options.wallThickness,
          depth: self.options.groundWidth
        }

        var wallLeft = BABYLON.MeshBuilder.CreateBox('wallLeft', wall2, scene);
        wallLeft.position.y = wall1.height / 2 - 10;
        wallLeft.position.x = -(self.options.groundLength + self.options.wallThickness) / 2;
        wallLeft.material = wallMat;

        var wallRight = BABYLON.MeshBuilder.CreateBox('wallRight', wall2, scene);
        wallRight.position.y = wall1.height / 2 - 10;
        wallRight.position.x = (self.options.groundLength + self.options.wallThickness) / 2;
        wallRight.material = wallMat;

        // Wall physics
        var wallOptions = {
          mass: 0,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
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
      if (self.options.objects instanceof Array) {
        let indexObj = { index: 0 };
        for (let i=0; i<self.options.objects.length; i++) {
          if (self.options.objects[i].type == 'compound') {
            self.addCompound(scene, self.options.objects[i], indexObj);
          } else {
            let options = self.mergeObjectOptionsWithDefault(self.options.objects[i])
            let mesh = self.addObject(scene, options, indexObj.index);
            self.addPhysics(scene, mesh, options);
            indexObj.index++;
          }
        }
      }

      // Show the info panel if timer is requested
      if (self.options.timer != 'none') {
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
        restitution: 0
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
      size: options.size,
      position: new BABYLON.Vector3(options.position[0], options.position[2], options.position[1]),
      rotation: new BABYLON.Vector3(rotationRad[0], rotationRad[1], rotationRad[2]),
      physicsOptions: options.physicsOptions,
      imageType: options.imageType,
      index: index
    };

    let VALID_IMAGETYPES = ['top','front','repeat','all','cylinder','sphere'];

    if (VALID_IMAGETYPES.indexOf(options.imageType) != -1 && options.imageURL != '') {
      var material = new BABYLON.StandardMaterial('imageObject', scene);
      var texture = new BABYLON.Texture(options.imageURL, scene);
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

    if (options.physicsOptions !== false) {
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
        options.physicsOptions,
        scene
      );

      if (options.magnetic) {
        mesh.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
      }

    }
  };

  // startSim
  self.startSim = function() {
    if (self.options.timer != 'none' && self.startTime == null) {
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

    if (self.options.timer != 'none') {
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
        if (self.options.timerEnd == 'stopRobot') {
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

    if (self.options.timer == 'up') {
      var time = elapsedTime;
      var sign = '';
      if (time >= self.options.timerDuration) {
        if (self.options.timerEnd != 'continue') {
          time = self.options.timerDuration;
        }
        setTimeLimitReached();
      }

    } else if (self.options.timer == 'down') {
      var time = self.options.timerDuration - elapsedTime;
      var sign = '';
      if (time <= 0) {
        if (self.options.timerEnd == 'continue') {
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

}