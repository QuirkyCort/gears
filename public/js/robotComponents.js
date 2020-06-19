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
      height: 2,
      width: 2,
      depth: 3
    };
    var body = BABYLON.MeshBuilder.CreateBox('colorSensorBody', bodyOptions, scene);
    self.body = body;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);

    body.position.z -= 1.50001;
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
    eye.position.z = 1.5;
    eye.parent = body;


    // Create camera and RTT
    self.rttCam = new BABYLON.FreeCamera('Camera', self.position, scene, false);
    self.rttCam.fov = 1.0;
    self.rttCam.minZ = 0.1;
    self.rttCam.maxZ = 5;
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

// Ultrasonic distance sensor
function UltrasonicSensor(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'UltrasonicSensor';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.init = function() {
    self.setOptions(options);

    var body = BABYLON.MeshBuilder.CreateBox('ultrasonicSensorBody', {height: 2, width: 5, depth: 2.5}, scene);
    self.body = body;
    body.visibility = false;
    body.isPickable = false;
    body.parent = parent;
    body.position = self.position;
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
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)

    var bodyMat = new BABYLON.StandardMaterial('ultrasonicSensorBody', scene);
    bodyMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.5);

    var rearBody = BABYLON.MeshBuilder.CreateBox('ultrasonicSensorBody', {height: 2, width: 5, depth: 2 }, scene);
    rearBody.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(rearBody);
    rearBody.position.z -= 0.25;
    rearBody.parent = body;

    var eyeMat = new BABYLON.StandardMaterial('colorSensorEye', scene);
    eyeMat.diffuseColor = new BABYLON.Color3(0.9, 0.0, 0.9);

    var eyeL = BABYLON.MeshBuilder.CreateCylinder('eyeL', { height: 0.5, diameter: 2, tessellation: 12}, scene);
    eyeL.material = eyeMat;
    eyeL.rotation.x = -Math.PI / 2;
    eyeL.position.x = -1.5;
    eyeL.position.z = 1;
    scene.shadowGenerator.addShadowCaster(eyeL);
    eyeL.parent = body;

    var eyeR = BABYLON.MeshBuilder.CreateCylinder('eyeR', { height: 0.5, diameter: 2, tessellation: 12}, scene);
    eyeR.material = eyeMat;
    eyeR.rotation.x = -Math.PI / 2;
    eyeR.position.x = 1.5;
    eyeR.position.z = 1;
    scene.shadowGenerator.addShadowCaster(eyeR);
    eyeR.parent = body;

    // Prep rays
    self.rays = [];
    self.rayVectors = [];
    var straightVector = new BABYLON.Vector3(0,0,1);
    let origin = new BABYLON.Vector3(0,0,0);

    self.options.rayRotations.forEach(function(rayRotation){
      var matrixX = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, rayRotation[0]);
      var matrixY = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, rayRotation[1]);
      var vec = BABYLON.Vector3.TransformCoordinates(straightVector, matrixX);
      vec = BABYLON.Vector3.TransformCoordinates(vec, matrixY);

      self.rayVectors.push(vec);
      var ray = new BABYLON.Ray(origin, new BABYLON.Vector3(0,0,1), self.options.rayLength);
      self.rays.push(ray);

      // BABYLON.RayHelper.CreateAndShow(ray, scene, new BABYLON.Color3(1, 1, 1));
    });
  };

  this.setOptions = function(options) {
    self.options = {
      rayOrigin:  new BABYLON.Vector3(0,0,1.25),
      rayRotations: [
        [-0.035, -0.305], [-0.035, -0.183], [-0.035, -0.061], [-0.035, 0.061], [-0.035, 0.183], [-0.035, 0.305],
        [0, -0.367], [0, -0.244], [0, -0.122], [0, 0], [0, 0.122], [0, 0.244], [0, 0.367],
        [0.035, -0.305], [0.035, -0.183], [0.035, -0.061], [0.035, 0.061], [0.035, 0.183], [0.035, 0.305]
      ],
      rayLength: 255,
      rayIncidentLimit: 0.698132
    };

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }
  };

  this.getDistance = function() {
    var shortestDistance = 255;

    var rayOffset = new BABYLON.Vector3(0,0,0);
    self.options.rayOrigin.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, rayOffset);
    self.rays[0].origin.copyFrom(self.body.absolutePosition);
    self.rays[0].origin.addInPlace(rayOffset);

    self.rayVectors.forEach(function(rayVector, i){
      rayVector.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, self.rays[i].direction);

      var hit = scene.pickWithRay(self.rays[i]);
      if (hit.hit && hit.distance < shortestDistance) {
        let hitVector = hit.getNormal();
        if (hitVector) {
          var incidentAngle = Math.abs(BABYLON.Vector3.Dot(hitVector, self.rays[i].direction));
          if (incidentAngle > self.options.rayIncidentLimit && incidentAngle < (Math.PI - self.options.rayIncidentLimit)) {
            shortestDistance = hit.distance;
          }
        }
      }
    });

    return shortestDistance;
  };

  this.init();
}

// Gyro sensor
function GyroSensor(scene, parent, pos, port, options) {
  var self = this;

  this.type = 'GyroSensor';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(0, 0, 0);
  this.actualRotation = 0;
  this.rotationRounds = 0;
  this.rotationAdjustment = 0;
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(0, 0, 0);
  this.s = new BABYLON.Vector3(0,0,1);
  this.origin = new BABYLON.Vector3(0,0,0);
  this.e = new BABYLON.Vector3(0,0,0);

  this.init = function() {
    self.setOptions(options);

    var bodyMat = new BABYLON.StandardMaterial('gyroSensorBody', scene);
    bodyMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.2);

    var body = BABYLON.MeshBuilder.CreateBox('gyroSensorBody', {height: 1, width: 2, depth: 2}, scene);
    self.body = body;
    body.material = bodyMat;
    body.parent = parent;
    body.position = self.position;
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
  };

  this.setOptions = function(options) {
    self.options = {
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
    self.updateRotation(delta);
  };

  this.updateRotation = function(delta) {
    self.s.rotateByQuaternionAroundPointToRef(self.body.absoluteRotationQuaternion, self.origin, self.e);

    let rot = BABYLON.Vector3.GetAngleBetweenVectors(self.s, self.e, BABYLON.Vector3.Up()) / Math.PI * 180;

    if (! isNaN(rot)) {
      if (rot - self.prevRotation > 180) {
        self.rotationRounds -= 1;
      } else if (rot - self.prevRotation < -180) {
        self.rotationRounds += 1;
      }
      self.prevRotation = rot;

      let rotation = self.rotationRounds * 360 + rot;
      self.angularVelocity = (rotation - self.actualRotation) / delta * 1000;
      self.actualRotation = rotation;
      self.rotation = rotation - self.rotationAdjustment;
    }
  };

  this.reset = function() {
    self.rotationAdjustment += self.rotation;
    self.rotation = 0;
    self.prevRotation = 0;
  };

  this.getAngle = function() {
    return self.actualRotation;
  };

  this.getRate = function() {
    return self.angularVelocity;
  };

  this.init();
}