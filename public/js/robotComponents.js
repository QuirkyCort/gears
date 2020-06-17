//
// Color sensor. Uses a camera to capture image and extract average RGB values
//
function ColorSensor(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'ColorSensor';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.mask = [];
  this.maskSize = 0;

  this.init = function() {
    self.setOptions(options);

    var bodyMat = new BABYLON.StandardMaterial('colorSensorBody', scene);
    bodyMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    let bodyOptions = {
      height: 3,
      width: 3,
      depth: 5
    };
    var body = BABYLON.MeshBuilder.CreateBox('colorSensorBody', bodyOptions, scene);
    self.body = body;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);

    body.position.z -= 2.50001;
    body.physicsImpostor = new BABYLON.PhysicsImpostor(
      body,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 1,
        restitution: 0.4,
        friction: 0.1
      },
      scene
    );
    body.parent = parent;

    body.position = self.position;
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)

    var eyeMat = new BABYLON.StandardMaterial('colorSensorEye', scene);
    eyeMat.diffuseColor = new BABYLON.Color3(0.9, 0.0, 0.0);
    var eye = new BABYLON.MeshBuilder.CreateSphere("eye", {diameterX: 1, diameterY: 1, diameterZ: 0.6, segments: 3}, scene);
    eye.material = eyeMat;
    eye.position.z = 2.5;
    eye.parent = body;


    // Create camera and RTT
    self.rttCam = new BABYLON.FreeCamera('Camera', self.position, scene, false);
    self.rttCam.fov = 1.0;
    self.rttCam.minZ = 0.1;
    self.rttCam.maxZ = 10;
    self.rttCam.updateUpVectorFromRotation = true;
    self.rttCam.position = eye.absolutePosition;

    self.renderTarget = new BABYLON.RenderTargetTexture(
      'colorSensor',
      self.options.sensorResolution, // texture size
      scene,
      false, // generateMipMaps
      false // doNotChangeAspectRatio
    );
    scene.customRenderTargets.push(self.renderTarget);
    self.renderTarget.activeCamera = self.rttCam;

    var fullEmissive = new BABYLON.Color3(1,1,1);
    var noEmissive = new BABYLON.Color3(0,0,0);

    self.renderTarget.onBeforeRender = function() {
      self.renderTarget.renderList.forEach(function(mesh) {
        if (mesh.material) {
          mesh.material.disableLighting = true;
          if (mesh.diffuseTexture) {
            mesh.material.emissiveColor = fullEmissive;
          } else {
            mesh.material.emissiveColor = mesh.material.diffuseColor;
          }
        }
      });
    };
    self.renderTarget.onAfterRender = function() {
      self.renderTarget.renderList.forEach(function(mesh) {
        if (mesh.material) {
          mesh.material.disableLighting = false;
          mesh.material.emissiveColor = noEmissive;
        }
      });
    };

    self.buildMask();
  };

  this.loadMeshes = function(meshes) {
    meshes.forEach(function(mesh){
      self.renderTarget.renderList.push(mesh);
    });
  };

  this.setOptions = function(options) {
    self.options = {
      sensorResolution: 8
    };

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }
  };

  this.render = function(delta) {
    self.rttCam.rotationQuaternion = self.body.absoluteRotationQuaternion;
  };

  this.buildMask = function() {
    let r2 = (self.options.sensorResolution / 2) ** 2;
    let center = (self.options.sensorResolution - 1) / 2;
    self.mask = [];
    self.maskSize = 0;
    for (let x=0; x<self.options.sensorResolution; x++) {
      let x2 = (x-center)**2;
      for (let y=0; y<self.options.sensorResolution; y++){
        if ((x2 + (y-center)**2) < r2) {
          self.mask.push(true);
          self.maskSize++;
        } else {
          self.mask.push(false);
        }
      }
    }
  };

  this.getRGB = function() {
    var r = 0;
    var g = 0;
    var b = 0;

    let pixels = self.renderTarget.readPixels();
    self.pixels = pixels;
    for (let i=0; i<pixels.length; i+=4) {

      if (self.mask[i/4]) {
        r += pixels[i];
        g += pixels[i+1];
        b += pixels[i+2];
      }
    }
    self.r = r;
    self.g = g;
    self.b = b;
    return [r / self.maskSize, g / self.maskSize, b / self.maskSize];
  };

  this.init();
}

//
// Just a dumb box with physics
//
function BoxBlock(scene, parent, pos, rot, options) {
  var self = this;

  this.type = 'Box';
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.init = function() {
    self.setOptions(options);

    var bodyMat = new BABYLON.StandardMaterial('boxBody', scene);
    bodyMat.diffuseColor = new BABYLON.Color3(0.64, 0.81, 0.05);
    let bodyOptions = {
      height: self.options.height,
      width: self.options.width,
      depth: self.options.depth
    };
    var body = BABYLON.MeshBuilder.CreateBox('boxBody', bodyOptions, scene);
    self.body = body;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);

    body.physicsImpostor = new BABYLON.PhysicsImpostor(
      body,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 1,
        restitution: 0.4,
        friction: 0.1
      },
      scene
    );
    body.parent = parent;

    body.position = self.position;
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
  };

  this.setOptions = function(options) {
    self.options = {
      height: 1,
      width: 1,
      depth: 1
    };

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }
  };

  this.init();
}
