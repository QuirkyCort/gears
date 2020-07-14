// Color sensor. Uses a camera to capture image and extract average RGB values
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
    // bodyMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);

    var bodyTexture = new BABYLON.Texture('textures/robot/color.png', scene);
    bodyMat.diffuseTexture = bodyTexture;

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 2/3, 1, 1);
    faceUV[3] = new BABYLON.Vector4(1/2, 0, 1, 2/3);
    faceUV[2] = new BABYLON.Vector4(0, 0, 1/2, 2/3);
    faceUV[5] = new BABYLON.Vector4(0, 2/3, 1, 1);

    let bodyOptions = {
      height: 2,
      width: 2,
      depth: 3,
      faceUV: faceUV
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
      false, // doNotChangeAspectRatio
      BABYLON.Constants.TEXTURETYPE_UNSIGNED_INT,
      false,
      BABYLON.Texture.NEAREST_NEAREST
    );
    scene.customRenderTargets.push(self.renderTarget);
    self.renderTarget.activeCamera = self.rttCam;
    self.renderTarget.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;

    self.renderTarget.onBeforeRender = function() {
      scene.clearColor = BABYLON.Color3.Black();
      self.renderTarget.renderList.forEach((mesh) => {
        if (mesh.getClassName() === 'InstancedMesh') {
            return;
        }
        if (mesh.material && !mesh.isFrozen && ('isReady' in mesh) && mesh.isReady(true)) {
            const _orig_subMeshEffects = [];
            mesh.subMeshes.forEach((submesh) => {
                _orig_subMeshEffects.push([submesh.effect, submesh.materialDefines]);
            });
            mesh.isFrozen = true;
            mesh.material.freeze();
            mesh._saved_orig_material = mesh.material;
            mesh._orig_subMeshEffects = _orig_subMeshEffects;
        }
        if (!mesh._orig_subMeshEffects) {
            return;
        }

        mesh.material = mesh.rttMaterial;
        if (mesh._rtt_subMeshEffects) {
            for (let s = 0; s < mesh.subMeshes.length; ++s) {
                mesh.subMeshes[s].setEffect(...mesh._rtt_subMeshEffects[s]);
            }
        }
      });
    };
    self.renderTarget.onAfterRender = function() {
      scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.3);
      self.renderTarget.renderList.forEach((mesh) => {
        if (mesh.getClassName() === 'InstancedMesh') {
            return;
        }
        if (!mesh._orig_subMeshEffects) {
            return;
        }
        if (!mesh._rtt_subMeshEffects) {
            mesh._rtt_subMeshEffects = [];
            mesh.subMeshes.forEach((submesh) => {
                mesh._rtt_subMeshEffects.push([submesh.effect, submesh.materialDefines]);
            });
        }

        mesh.material = mesh._saved_orig_material;
        for (let s = 0; s < mesh.subMeshes.length; ++s) {
            mesh.subMeshes[s].setEffect(...mesh._orig_subMeshEffects[s]);
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

    self.renderTarget.resetRefreshCounter();
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

// Just a dumb box with physics
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
    // bodyMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.5);

    var bodyTexture = new BABYLON.Texture('textures/robot/ultrasonic.png', scene);
    bodyMat.diffuseTexture = bodyTexture;

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    let bodyOptions = {
      height: 2,
      width: 5,
      depth: 2,
      faceUV: faceUV
    };

    var rearBody = BABYLON.MeshBuilder.CreateBox('ultrasonicSensorBody', bodyOptions, scene);
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
        let hitVector = hit.getNormal(true);
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
  this.angularVelocity = 0;
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
    // bodyMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.2);

    var bodyTexture = new BABYLON.Texture('textures/robot/gyro.png', scene);
    bodyMat.diffuseTexture = bodyTexture;

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
        height: 1,
        width: 2,
        depth: 2,
        faceUV: faceUV
    };

    var body = BABYLON.MeshBuilder.CreateBox('gyroSensorBody', boxOptions, scene);
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
      self.angularVelocity = 0.8 * self.angularVelocity + 0.2 * ((rotation - self.actualRotation) / delta * 1000);
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
    return self.rotation;
  };

  this.getRate = function() {
    return self.angularVelocity;
  };

  this.init();
}


// GPS sensor
function GPSSensor(scene, parent, pos, port, options) {
  var self = this;

  this.type = 'GPSSensor';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(0, 0, 0);

  this.init = function() {
    self.setOptions(options);

    var bodyMat = new BABYLON.StandardMaterial('gpsSensorBody', scene);
    // bodyMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.2);

    var bodyTexture = new BABYLON.Texture('textures/robot/gps.png', scene);
    bodyMat.diffuseTexture = bodyTexture;

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
        height: 1,
        width: 2,
        depth: 2,
        faceUV: faceUV
    };

    var body = BABYLON.MeshBuilder.CreateBox('gpsSensorBody', boxOptions, scene);
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

  this.getPosition = function() {
    return [
      self.body.absolutePosition.x,
      self.body.absolutePosition.y,
      self.body.absolutePosition.z
    ];
  };

  this.init();
}

// Magnet
function MagnetActuator(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'MagnetActuator';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.power = 0;

  // Used in Python
  this.modes = {
    STOP: 1,
    RUN: 2,
    RUN_TO_POS: 3,
    RUN_TIL_TIME: 4
  };
  this.mode = this.modes.STOP;

  this.state = '';
  this.states = {
    RUNNING: 'running',
    RAMPING: 'ramping',
    HOLDING: 'holding',
    OVERLOADED: 'overloaded',
    STATE_STALLED: 'stalled',
    NONE: ''
  };

  this.speed_sp = 0;

  this.runTimed = function() {
    self.mode = self.modes.RUN_TIL_TIME;
    self.state = self.states.RUNNING;
  };

  this.runToPosition = function() {
    self.mode = self.modes.RUN_TO_POS;
    self.state = self.states.RUNNING;
  };

  this.runForever = function() {
    self.mode = self.modes.RUN;
    self.state = self.states.RUNNING;
  };

  this.stop = function() {
    self.mode = self.modes.STOP;
    self.setPower(0);
    self.state = self.states.HOLDING;
  };

  this.reset = function() {
    self.setPower(0);
    self.mode = self.modes.STOP;
    self.state = self.states.HOLDING;
  };

  // Used in JS
  this.init = function() {
    self.setOptions(options);

    var body = BABYLON.MeshBuilder.CreateBox('magnetActuatorBody', {height: 2.5, width: 2, depth: 2}, scene);
    self.body = body;
    body.visibility = false;
    body.parent = parent;
    body.position = self.position;
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)

    var attractorMat = new BABYLON.StandardMaterial('magnetActuatorAttractor', scene);
    attractorMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    var attractor = BABYLON.MeshBuilder.CreateCylinder('magnetActuatorAttractor', { height: 1, diameter: 2, tessellation: 12}, scene);;
    self.attractor = attractor;
    attractor.material = attractorMat;
    attractor.parent = body;
    attractor.position.y = -0.75;
    scene.shadowGenerator.addShadowCaster(attractor);

    var rearBodyMat = new BABYLON.StandardMaterial('magnetActuatorRearBody', scene);
    // rearBodyMat.diffuseColor = new BABYLON.Color3(0.5, 0.2, 0.2);
    var rearBodyTexture = new BABYLON.Texture('textures/robot/magnet.png', scene);
    rearBodyMat.diffuseTexture = rearBodyTexture;

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[1] = new BABYLON.Vector4(0, 0, 1/3, 1);
    faceUV[2] = new BABYLON.Vector4(1/3, 0, 2/3, 1);
    faceUV[3] = new BABYLON.Vector4(1/3, 0, 2/3, 1);
    faceUV[0] = new BABYLON.Vector4(2/3, 0, 1, 1);
    var bodyOptions = {
      height: 2,
      width: 2,
      depth: 2,
      faceUV: faceUV
    }

    var rearBody = BABYLON.MeshBuilder.CreateBox('magnetActuatorRearBody',  bodyOptions, scene);
    rearBody.material = rearBodyMat;
    scene.shadowGenerator.addShadowCaster(rearBody);
    rearBody.position.y = 0.25;
    rearBody.parent = body;
  };

  this.loadImpostor = function() {
    self.body.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.body,
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
      maxRange: 8,
      maxPower: 4000
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
    if (self.mode == self.modes.RUN) {
      self.setPower(self.speed_sp / 1050);
    } else if (self.mode == self.modes.RUN_TIL_TIME) {
      self.setPower(self.speed_sp / 1050);
      if (Date.now() > self.time_target) {
        self.stop();
      }
    } else if (self.mode == self.modes.RUN_TO_POS) {
      self.setPower(self.speed_sp / 1050);
    }
    scene.meshes.forEach(self.applyMagneticForce);
  };

  this.applyMagneticForce = function(mesh) {
    if (! mesh.isMagnetic) {
      return;
    }
    if (self.power == 0) {
      return;
    }

    let vec = self.attractor.absolutePosition.subtract(mesh.absolutePosition);
    let distance = vec.length();

    if (distance > self.options.maxRange) {
      return;
    }

    let power = 1 / distance^2 * self.power;
    vec.normalize();
    mesh.physicsImpostor.applyForce(vec.scale(power), mesh.absolutePosition);
  };

  this.setPower = function(fraction) {
    if (fraction > 1) {
      fraction = 1;
    }
    self.power = fraction * self.options.maxPower;
  };

  this.init();
}

// Motorized Arm
function ArmActuator(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'ArmActuator';
  this.port = port;
  this.options = null;

  this.components = [];

  this.bodyPosition = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  // Used in Python
  this.modes = {
    STOP: 1,
    RUN: 2,
    RUN_TO_POS: 3,
    RUN_TIL_TIME: 4
  };
  this.mode = this.modes.STOP;

  this.state = 'holding';
  this.states = {
    RUNNING: 'running',
    RAMPING: 'ramping',
    HOLDING: 'holding',
    OVERLOADED: 'overloaded',
    STATE_STALLED: 'stalled',
    NONE: ''
  };

  this.speed = 0;
  this.speed_sp = 30;
  this.position_sp = 0;
  this.position_target = 0;
  this.position = 0;
  this.prevPosition = 0;
  this.positionAdjustment = 0;
  this.prevRotation = 0;
  this.rotationRounds = 0;

  this.runTimed = function() {
    self.positionDirectionReversed = false;
    self.mode = self.modes.RUN_TIL_TIME;
    self.state = self.states.RUNNING;
  };

  this.runToPosition = function() {
    if (self.position_target < self.position) {
      self.positionDirectionReversed = true;
    } else {
      self.positionDirectionReversed = false;
    }
    self.mode = self.modes.RUN_TO_POS;
    self.state = self.states.RUNNING;
  };

  this.runForever = function() {
    self.positionDirectionReversed = false;
    self.mode = self.modes.RUN;
    self.state = self.states.RUNNING;
  };

  this.stop = function() {
    self.mode = self.modes.STOP;
    self.position_target = self.position;
    self.state = self.states.HOLDING;
  };

  this.reset = function() {
    self.positionAdjustment += self.position;
    self.position = 0;
    self.prevPosition = 0;
    self.position_target = 0;
    self.mode = self.modes.STOP;
    self.state = self.states.HOLDING;
  };

  // Used in JS
  this.init = function() {
    self.setOptions(options);

    var body = BABYLON.MeshBuilder.CreateBox('armBody', {height: 3, width: 2, depth: 3}, scene);
    self.body = body;
    body.visibility = false;
    body.parent = parent;
    body.position = self.bodyPosition;
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)

    var armBaseMat = new BABYLON.StandardMaterial('armBase', scene);
    armBaseMat.diffuseColor = new BABYLON.Color3(0.64, 0.61, 0.05);

    var armBase = BABYLON.MeshBuilder.CreateBox('armBase', {height: 3, width: 0.5, depth: 3}, scene);
    armBase.material = armBaseMat;
    armBase.parent = body;
    armBase.position.x = -0.75;
    scene.shadowGenerator.addShadowCaster(armBase);

    var armBase2 = BABYLON.MeshBuilder.CreateBox('armBase', {height: 3, width: 0.5, depth: 3}, scene);
    armBase2.material = armBaseMat;
    armBase2.parent = body;
    armBase2.position.x = 0.75;
    scene.shadowGenerator.addShadowCaster(armBase2);

    var pivotMat = new BABYLON.StandardMaterial('pivot', scene);
    pivotMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    var pivot = BABYLON.MeshBuilder.CreateBox('pivot', {height: 0.5, width: 2.4, depth: 0.5}, scene);;
    self.pivot = pivot;
    pivot.material = pivotMat;
    pivot.position.y = 0.5;
    scene.shadowGenerator.addShadowCaster(pivot);

    var armMat = new BABYLON.StandardMaterial('arm', scene);
    armMat.diffuseColor = new BABYLON.Color3(0.64, 0.81, 0.05);

    var arm = BABYLON.MeshBuilder.CreateBox('arm', {height: 1, width: 1, depth: self.options.armLength}, scene);;
    self.arm = arm;
    self.end = arm;
    arm.material = armMat;
    scene.shadowGenerator.addShadowCaster(arm);
    arm.position.z += (self.options.armLength / 2) - 1;

    pivot.parent = parent;
    pivot.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    pivot.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    pivot.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
    pivot.position = self.bodyPosition.clone();
    pivot.position.y += 0.5;
    parent.removeChild(pivot);
    arm.parent = pivot;
  };

  this.loadImpostor = function() {
    self.body.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.body,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 1,
        restitution: 0.4,
        friction: 0.1
      },
      scene
    );
    self.arm.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.arm,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 10,
        restitution: 0.4,
        friction: 0.1
      },
      scene
    );
    self.pivot.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.pivot,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 100,
        restitution: 0.4,
        friction: 0.1
      },
      scene
    );
  };

  this.loadJoints = function() {
    let mainPivot = BABYLON.Vector3.Zero();
    mainPivot.y += 0.5;
    let connectedPivot = BABYLON.Vector3.Zero();
    let axisVec = new BABYLON.Vector3(1, 0, 0);
    let rotationQuaternion = BABYLON.Quaternion.FromEulerVector(self.rotation);
    axisVec.rotateByQuaternionAroundPointToRef(rotationQuaternion, BABYLON.Vector3.Zero(), axisVec);

    self.joint = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
      mainPivot: mainPivot,
      connectedPivot: connectedPivot,
      mainAxis: axisVec,
      connectedAxis: new BABYLON.Vector3(1, 0, 0),
    });

    let targetBody = self.body;
    while (targetBody.parent) {
      mainPivot.addInPlace(targetBody.position);
      targetBody = targetBody.parent;
    }
    targetBody.physicsImpostor.addJoint(self.pivot.physicsImpostor, self.joint);
  };

  this.setOptions = function(options) {
    self.options = {
      armLength: 18,
      minAngle: -5,
      maxAngle: 180,
      components: []
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
    self.position = self.getPosition();
    self.speed = 0.8 * self.speed + 0.2 * ((self.position - self.prevPosition) / delta * 1000);
    self.prevPosition = self.position;

    if (self.mode == self.modes.RUN) {
      self.setMotorSpeed();
    } else if (self.mode == self.modes.RUN_TIL_TIME) {
      self.setMotorSpeed();
      if (Date.now() > self.time_target) {
        self.stop();
      }
    } else if (self.mode == self.modes.RUN_TO_POS) {
      self.setMotorSpeed();
      if (
        (self.positionDirectionReversed == false && self.position >= self.position_target) ||
        (self.positionDirectionReversed && self.position <= self.position_target)
      ) {
        self.stop();
      }
    } else if (self.mode == self.modes.STOP) {
      self.holdPosition();
    }

    self.components.forEach(function(component) {
      if (typeof component.render == 'function') {
        component.render(delta);
      }
    });
  };

  this.setMotorSpeed = function() {
    let speed = self.speed_sp / 180 * Math.PI;
    if (self.positionDirectionReversed) {
      speed = -speed;
    }
    if (
      (speed > 0 && (self.position + self.positionAdjustment) > self.options.maxAngle)
      || (speed < 0 && (self.position + self.positionAdjustment) < self.options.minAngle)
    ) {
      self.joint.setMotor(0);
    } else {
      self.joint.setMotor(speed);
    }
  };

  this.holdPosition = function(delta) {
    const P_GAIN = 0.1;
    const MAX_POSITION_CORRECTION_SPEED = 0.5;
    let error = self.position_target - self.position;
    let speed = error * P_GAIN;

    if (speed > MAX_POSITION_CORRECTION_SPEED) {
      speed = MAX_POSITION_CORRECTION_SPEED;
    } else if (speed < -MAX_POSITION_CORRECTION_SPEED) {
      speed = -MAX_POSITION_CORRECTION_SPEED;
    }
    self.joint.setMotor(speed);
  };

  this.getPosition = function() {
    let baseVector = new BABYLON.Vector3(0, 0, 1);
    let armVector = new BABYLON.Vector3(0, 0, 1);
    let normalVector = new BABYLON.Vector3(1, 0, 0);
    let zero = BABYLON.Vector3.Zero();

    baseVector.rotateByQuaternionAroundPointToRef(self.body.absoluteRotationQuaternion, zero, baseVector);
    normalVector.rotateByQuaternionAroundPointToRef(self.body.absoluteRotationQuaternion, zero, normalVector);
    armVector.rotateByQuaternionAroundPointToRef(self.pivot.absoluteRotationQuaternion, zero, armVector);

    let rotation = -BABYLON.Vector3.GetAngleBetweenVectors(baseVector, armVector, normalVector) / Math.PI * 180;
    if (rotation < -90 && self.prevRotation > 90) {
      self.rotationRounds += 1;
    } else if (rotation > 90 && self.prevRotation < -90) {
      self.rotationRounds -= 1;
    }
    self.prevRotation = rotation;

    return self.rotationRounds * 360 + rotation - self.positionAdjustment;
  };

  this.init();
}