function ColorSensor(scene, parent, pos, rot) {
  var self = this;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.init = function() {
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
      4, // texture size
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
  };

  this.render = function(delta) {
    self.rttCam.rotationQuaternion = self.body.absoluteRotationQuaternion;
  };

  this.getRGB = function() {
    self.pixels = self.renderTarget.readPixels();
    self.results = [];
    for (let i=0; i<self.pixels.length; i+=4) {
      self.results.push(self.pixels[i]);
    }
  };

  this.init();
}
