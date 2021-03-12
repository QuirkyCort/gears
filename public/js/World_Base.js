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
  this.arenaStart = null;

  this.defaultOptions = {
    imageURL: '',
    length: 100,
    width: 100,
    uScale: 1,
    vScale: 1,
    imageScale: '1',
    wall: true,
    wallHeight: 7.7,
    wallThickness: 4.5,
    wallColor: '1A1A1A',
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    objects: [],
    startPos: 'center',
    startPosXY: '',
    startRot: '',
    arenaStartPosXY: null,
    arenaStartRot: null
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
        let scale = 1;
        if (self.options.imageScale.trim()) {
          scale = parseFloat(self.options.imageScale);
        }

        self.options.groundLength = this.width / 10.0 * scale * self.options.uScale;
        self.options.groundWidth = this.height / 10.0 * scale * self.options.vScale;

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
        }

        if (typeof self.options.startPosXY != 'undefined' && self.options.startPosXY.trim() != '') {
          let xy = self.options.startPosXY.split(',');
          let alt = 0;
          if (xy.length > 2) {
            alt = parseFloat(xy[2]);
          }
          self.robotStart.position = new BABYLON.Vector3(parseFloat(xy[0]), alt, parseFloat(xy[1]));
        }
        if (typeof self.options.startRot != 'undefined' && self.options.startRot.trim() != '') {
          self.robotStart.rotation.y = parseFloat(self.options.startRot) / 180 * Math.PI;
        }

        resolve();
      }
      if (typeof self.options.image != 'undefined' && self.options.image != '') {
        img.src = self.options.image;
      }
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
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

      if (self.options.wall) {
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
      }

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

      if (self.options.wall) {
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
}