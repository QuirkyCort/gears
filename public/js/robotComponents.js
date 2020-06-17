function ColorSensor(scene, parent, pos, rot, port, options) {
  var self = this;

  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.mask = [];
  this.maskSize = 0;

  this.init = function() {
    self.setOptions(options);

    var bodyMat = new BABYLON.StandardMaterial('colorSensor', scene);
    bodyMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    let bodyOptions = {
      height: 3,
      width: 3,
      depth: 5
    };
    var body = BABYLON.MeshBuilder.CreateBox('colorSensor', bodyOptions, scene);
    self.body = body;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);
    body.position.z -= 2.50001;
    body.bakeCurrentTransformIntoVertices();
    body.position = self.position;
    body.rotation = self.rotation;
    body.parent = parent;

    // Create camera and RTT
    self.rttCam = new BABYLON.FreeCamera('Camera', self.position, scene, false);
    self.rttCam.fov = 1.0;
    self.rttCam.updateUpVectorFromRotation = true;
    self.rttCam.position = body.absolutePosition;

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
    for (let i=0; i<pixels.length; i+=4) {
      if (self.mask[i]) {
        r += pixels[i];
        g += pixels[i+1];
        b += pixels[i+2];
      }
    }
    return [r / self.maskSize, g / self.maskSize, b / self.maskSize];
  };

  this.init();
}
