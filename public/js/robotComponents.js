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
        mass: 0
      },
      scene
    );
    body.parent = parent;

    body.position = self.position;
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)

    var eyeMat = babylon.getMaterial(scene, 'E60000');
    var eye = new BABYLON.MeshBuilder.CreateSphere('eye', {diameterX: 1, diameterY: 1, diameterZ: 0.6, segments: 3}, scene);
    eye.material = eyeMat;
    eye.position.z = 1.5;
    eye.parent = body;

    // Create camera and RTT
    self.rttCam = new BABYLON.FreeCamera('Camera', self.position, scene, false);
    self.rttCam.fov = self.options.sensorFov;
    self.rttCam.minZ = self.options.sensorMinRange;
    self.rttCam.maxZ = self.options.sensorMaxRange;
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
    self.renderTarget.clearColor = BABYLON.Color3.Black();
    scene.customRenderTargets.push(self.renderTarget);
    self.renderTarget.activeCamera = self.rttCam;
    // self.renderTarget.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;

    self.pixels = new Uint8Array(self.options.sensorResolution ** 2 * 4);
    self.waitingSync = false;

    self.renderTarget.onBeforeRender = function() {
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
      sensorResolution: 8,
      sensorMinRange: 0.1,
      sensorMaxRange: 5,
      sensorFov: 1.3
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
    if (! self.waitingSync && babylon.engine._webGLVersion >= 2 && babylon.DISABLE_ASYNC == false) {
      self.readPixelsAsync();
    }
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

  this.readPixelsAsync = function() {
    let texture = self.renderTarget._texture;
    let width = self.options.sensorResolution;
    let height = self.options.sensorResolution;

    const engine = babylon.engine;

    let gl = engine._gl;
    let dummy = babylon.engine._gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, dummy);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture._webGLTexture, 0);

    let readType = (texture.type !== undefined) ? engine._getWebGLTextureType(texture.type) : gl.UNSIGNED_BYTE;

    switch (readType) {
      case gl.UNSIGNED_BYTE:
        readType = gl.UNSIGNED_BYTE;
        break;
      default:
        readType = gl.FLOAT;
        break;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, self.pixels.byteLength, gl.STREAM_READ);
    gl.readPixels(0, 0, width, height, gl.RGBA, readType, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
      return null;
    }

    gl.flush();

    self.waitingSync = true;

    return self._clientWaitAsync(sync, 0, 5).then(
      () => {
        gl.deleteSync(sync);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, self.pixels);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        gl.deleteBuffer(buf);
        gl.bindFramebuffer(gl.FRAMEBUFFER, engine._currentFramebuffer);
        self.waitingSync = false;
      },
      () => {
        self.waitingSync = false;
      }
    );
  };

  this._clientWaitAsync = function(sync, flags = 0, interval_ms = 10) {
    let gl = babylon.engine._gl;
    return new Promise((resolve, reject) => {
      let check = () => {
        const res = gl.clientWaitSync(sync, flags, 0);
        if (res == gl.WAIT_FAILED) {
          // reject();
          resolve();
          return;
        }
        if (res == gl.TIMEOUT_EXPIRED) {
          setTimeout(check, interval_ms);
          return;
        }
        resolve();
      };

      check();
    });
  }

  this.getRGB = function() {
    var r = 0;
    var g = 0;
    var b = 0;

    // self.renderTarget.resetRefreshCounter();
    if (babylon.engine._webGLVersion < 2 || babylon.DISABLE_ASYNC) {
      self.renderTarget.readPixels(0, 0, self.pixels);
    }
    for (let i=0; i<self.pixels.length; i+=4) {
      if (self.mask[i/4]) {
        r += self.pixels[i];
        g += self.pixels[i+1];
        b += self.pixels[i+2];
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

    var bodyMat = babylon.getMaterial(scene, 'A3CF0D');
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
        mass: 0
      },
      scene
    );
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)

    var bodyMat = new BABYLON.StandardMaterial('ultrasonicSensorBody', scene);
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

    var eyeMat = babylon.getMaterial(scene, 'E600E6');

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
    var shortestDistance = self.options.rayLength;

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
        mass: 0
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
        mass: 0
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

    var attractorMat = babylon.getMaterial(scene, '808080');

    var attractor = BABYLON.MeshBuilder.CreateCylinder('magnetActuatorAttractor', { height: 1, diameter: 2, tessellation: 12}, scene);;
    self.attractor = attractor;
    attractor.material = attractorMat;
    attractor.parent = body;
    attractor.position.y = -0.75;
    scene.shadowGenerator.addShadowCaster(attractor);

    var rearBodyMat = new BABYLON.StandardMaterial('magnetActuatorRearBody', scene);
    var rearBodyTexture = new BABYLON.Texture('textures/robot/magnet.png', scene);
    rearBodyMat.diffuseTexture = rearBodyTexture;

    var faceUV = new Array(6);
    faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[3] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[4] = new BABYLON.Vector4(0, 0, 0, 0);
    faceUV[5] = new BABYLON.Vector4(0, 0, 0, 0);

    var bodyOptions = {
      height: 2,
      width: 2,
      depth: 2,
      faceUV: faceUV,
      wrap: true
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
        mass: 0
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

    var armBaseMat = babylon.getMaterial(scene, 'A39C0D')

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

    var pivotMat = babylon.getMaterial(scene, '808080');

    var pivot = BABYLON.MeshBuilder.CreateBox('pivot', {height: 0.5, width: 2.4, depth: 0.5}, scene);;
    self.pivot = pivot;
    pivot.material = pivotMat;
    pivot.position.y = 0.5;
    scene.shadowGenerator.addShadowCaster(pivot);

    var armMat = babylon.getMaterial(scene, 'A3CF0D');

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
        mass: 0
      },
      scene
    );
    self.arm.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.arm,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0
      },
      scene
    );
    self.pivot.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.pivot,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: self.options.mass,
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
      mass: 100,
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
    if (isNaN(rotation)) {
      rotation = 0;
    }
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

// Laser distance sensor
function LaserRangeSensor(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'LaserRangeSensor';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.init = function() {
    self.setOptions(options);

    var bodyMat = new BABYLON.StandardMaterial('laserRangeSensorBody', scene);
    var bodyTexture = new BABYLON.Texture('textures/robot/laserRange.png', scene);
    bodyMat.diffuseTexture = bodyTexture;

    var faceUV = new Array(6);
    faceUV[0] = new BABYLON.Vector4(0, 0.375, 1, 1);
    faceUV[1] = new BABYLON.Vector4(0, 0.375, 1, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0.375, 1, 1);
    faceUV[3] = new BABYLON.Vector4(0, 0.375, 1, 1);
    faceUV[4] = new BABYLON.Vector4(0, 0, 0, 0);
    faceUV[5] = new BABYLON.Vector4(0, 0, 1, 0.375);

    let bodyOptions = {
      height: 2.5,
      width: 1.5,
      depth: 1.5,
      faceUV: faceUV,
      wrap: true
    };

    var body = BABYLON.MeshBuilder.CreateBox('laserRangeSensorBody', bodyOptions, scene);
    self.body = body;
    body.material = bodyMat;
    body.parent = parent;
    body.position = self.position;
    body.physicsImpostor = new BABYLON.PhysicsImpostor(
      body,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0
      },
      scene
    );
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
    scene.shadowGenerator.addShadowCaster(body);

    // Prep rays
    self.rays = [];
    self.rayVectors = [];
    var straightVector = new BABYLON.Vector3(0,-1,0);
    let origin = new BABYLON.Vector3(0,0,0);

    self.options.rayRotations.forEach(function(rayRotation){
      var matrixX = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, rayRotation[0]);
      var matrixY = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, rayRotation[1]);
      var vec = BABYLON.Vector3.TransformCoordinates(straightVector, matrixX);
      vec = BABYLON.Vector3.TransformCoordinates(vec, matrixY);

      self.rayVectors.push(vec);
      var ray = new BABYLON.Ray(origin, new BABYLON.Vector3(0,-1,0), self.options.rayLength);
      self.rays.push(ray);

      // BABYLON.RayHelper.CreateAndShow(ray, scene, new BABYLON.Color3(1, 1, 1));
    });
  };

  this.setOptions = function(options) {
    self.options = {
      rayOrigin:  new BABYLON.Vector3(0,-1.26,0),
      rayRotations: [ [0, 0] ],
      rayLength: 400
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
    var shortestDistance = self.options.rayLength;

    var rayOffset = new BABYLON.Vector3(0,0,0);
    self.options.rayOrigin.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, rayOffset);
    self.rays[0].origin.copyFrom(self.body.absolutePosition);
    self.rays[0].origin.addInPlace(rayOffset);

    self.rayVectors.forEach(function(rayVector, i){
      rayVector.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, self.rays[i].direction);

      var hit = scene.pickWithRay(self.rays[i]);
      if (hit.hit && hit.distance < shortestDistance) {
        shortestDistance = hit.distance;
      }
    });

    return shortestDistance;
  };

  this.init();
}

// Motorized swivel platform
function SwivelActuator(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'SwivelActuator';
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

    var swivelBodyMat = babylon.getMaterial(scene, 'A39C0D');

    var body = BABYLON.MeshBuilder.CreateBox('swivelBody', {height: 1, width: 3, depth: 3}, scene);
    self.body = body;
    self.body.material = swivelBodyMat;
    body.parent = parent;
    body.position = self.bodyPosition;
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)

    var platformMat = babylon.getMaterial(scene, '808080');

    var platform = BABYLON.MeshBuilder.CreateCylinder('platform', {height: 0.5, diameter: 2.5, tessellation:12}, scene);;
    self.platform = platform;
    self.end = platform;
    platform.material = platformMat;
    scene.shadowGenerator.addShadowCaster(platform);

    platform.parent = parent;
    platform.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    platform.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    platform.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
    platform.position = self.bodyPosition.clone();
    platform.translate(BABYLON.Axis.Y, 0.75, BABYLON.Space.LOCAL);
    parent.removeChild(platform);
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
    self.platform.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.platform,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: self.options.mass,
        restitution: 0.4,
        friction: 0.1
      },
      scene
    );
  };

  this.loadJoints = function() {
    let mainPivot = BABYLON.Vector3.Zero();
    let connectedPivot = BABYLON.Vector3.Zero();
    connectedPivot.y = -0.75;
    let axisVec = new BABYLON.Vector3(0, 1, 0);
    let rotationQuaternion = BABYLON.Quaternion.FromEulerVector(self.rotation);
    axisVec.rotateByQuaternionAroundPointToRef(rotationQuaternion, BABYLON.Vector3.Zero(), axisVec);

    let targetBody = self.body;
    while (targetBody.parent) {
      mainPivot.addInPlace(targetBody.position);
      targetBody = targetBody.parent;
    }

    self.joint = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
      mainPivot: mainPivot,
      connectedPivot: connectedPivot,
      mainAxis: axisVec,
      connectedAxis: new BABYLON.Vector3(0, 1, 0),
    });

    targetBody.physicsImpostor.addJoint(self.platform.physicsImpostor, self.joint);
  };

  this.setOptions = function(options) {
    self.options = {
      mass: 100,
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
    self.joint.setMotor(speed);
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
    let normalVector = new BABYLON.Vector3(0, 1, 0);
    let zero = BABYLON.Vector3.Zero();

    baseVector.rotateByQuaternionAroundPointToRef(self.body.absoluteRotationQuaternion, zero, baseVector);
    normalVector.rotateByQuaternionAroundPointToRef(self.body.absoluteRotationQuaternion, zero, normalVector);
    armVector.rotateByQuaternionAroundPointToRef(self.platform.absoluteRotationQuaternion, zero, armVector);

    let rotation = -BABYLON.Vector3.GetAngleBetweenVectors(baseVector, armVector, normalVector) / Math.PI * 180;
    if (isNaN(rotation)) {
      rotation = 0;
    }
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

// Paintball launcher
function PaintballLauncherActuator(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'PaintballLauncherActuator';
  this.port = port;
  this.options = null;

  this.components = [];

  this.bodyPosition = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.ammo = -1;

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

    self.ammo = self.options.ammo;

    var launcherBodyMat = babylon.getMaterial(scene, 'CC8000');
    var launcherTubeMat = babylon.getMaterial(scene, '333333');

    var body = BABYLON.MeshBuilder.CreateBox('launcherBody', {height: 2.5, width: 2, depth: 9}, scene);
    self.body = body;
    self.body.visibility = 0;
    body.parent = parent;
    body.position = self.bodyPosition;
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
    scene.shadowGenerator.addShadowCaster(body);

    var base = BABYLON.MeshBuilder.CreateBox('launcherBase', {height: 0.5, width: 2, depth: 9}, scene);
    base.parent = body;
    base.position.y = -1;
    base.material = launcherBodyMat;

    var back = BABYLON.MeshBuilder.CreateBox('launcherBack', {height: 2.5, width: 2, depth: 1}, scene);
    back.parent = body;
    back.position.z = -4;
    back.material = launcherBodyMat;

    let a = BABYLON.MeshBuilder.CreateCylinder('launcherBarrelA', {height: 7.8, diameter: 2, tessellation:12}, scene);
    let b = BABYLON.MeshBuilder.CreateCylinder('launcherBarrelb', {height: 7.8, diameter: 1.4, tessellation:12}, scene);
    a.visibility = 0;
    b.visibility = 0;
    b.position.y = 1;
    let aCSG = BABYLON.CSG.FromMesh(a);
    let bCSG = BABYLON.CSG.FromMesh(b);
    var subCSG = aCSG.subtract(bCSG);
    var barrel = subCSG.toMesh('launcherBarrel', launcherTubeMat, scene);
    barrel.parent = body;
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.4;
    barrel.position.y = 0.25;

    var barrelTip = BABYLON.MeshBuilder.CreateBox('launcherBarrelTip', {height: 0.8, width: 0.2, depth: 0.4}, scene);;
    barrelTip.parent = barrel;
    barrelTip.position.y = 3.4;
    barrelTip.position.z = -1.1;
    barrelTip.material = launcherTubeMat;

    // Paintball colors
    self.paintballColors = []
    self.paintballColors.push(babylon.getMaterial(scene, '0ff'));
    self.paintballColors.push(babylon.getMaterial(scene, '0f0'));
    self.paintballColors.push(babylon.getMaterial(scene, 'ff0'));
    self.paintballColors.push(babylon.getMaterial(scene, 'f00'));
    self.paintballColors.push(babylon.getMaterial(scene, 'f0f'));
    self.paintballColors.push(babylon.getMaterial(scene, '00f'));

    // Paint splatter material
    self.splatterColors = [];
    for (let i=0; i<6; i++) {
      self.splatterColors.push(new BABYLON.StandardMaterial('paintSplatter', scene));
      self.splatterColors[i].diffuseTexture = new BABYLON.Texture('textures/robot/splatter' + i + '.png', scene);
      self.splatterColors[i].diffuseTexture.hasAlpha = true;
      self.splatterColors[i].zOffset = -1;
    }
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
      drawBackLimit: -1000,
      powerScale: 2,
      maxSpeed: 600,
      color: 0,
      ttl: 10000,
      ammo: -1,
      splatterTTL: -1
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
    self.speed = 0.8 * self.speed + 0.2 * ((self.position - self.prevPosition) / delta * 1000);
    self.prevPosition = self.position;

    if (self.mode == self.modes.RUN) {
      self.setMotorSpeed(delta);
    } else if (self.mode == self.modes.RUN_TIL_TIME) {
      self.setMotorSpeed(delta);
      if (Date.now() > self.time_target) {
        self.stop();
      }
    } else if (self.mode == self.modes.RUN_TO_POS) {
      self.setMotorSpeed(delta);
      if (
        (self.positionDirectionReversed == false && self.position >= self.position_target) ||
        (self.positionDirectionReversed && self.position <= self.position_target)
      ) {
        self.stop();
      }
    } else if (self.mode == self.modes.STOP) {
      // Do nothing
    }
  };

  self.paintballCollide = function(ownImpostor, otherImpostor) {
    let delta = scene.getEngine().getDeltaTime();

    let start = ownImpostor.object.absolutePosition;
    let direction = ownImpostor.getLinearVelocity();
    direction.scaleInPlace(delta / 1000);
    start.subtractInPlace(direction);
    let length = direction.length() * 2;
    direction.normalize();

    var ray = new BABYLON.Ray(start, direction, length);
    var hit = ray.intersectsMesh(otherImpostor.object, false);

    if (hit.hit == false) {
      direction = otherImpostor.object.absolutePosition.subtract(ownImpostor.object.absolutePosition);
      ray = new BABYLON.Ray(start, direction, direction.length());
      var hit = ray.intersectsMesh(otherImpostor.object, false);
      if (hit.hit == false) {
        console.log('Cannot find intersect');
      }
    }

    decal = BABYLON.MeshBuilder.CreateDecal(
      'splatter',
      otherImpostor.object,
      {
        position: hit.pickedPoint,
        normal: hit.getNormal(true),
        size: new BABYLON.Vector3(7, 7, 7)
      },
      scene
    );
    decal.material = self.splatterColors[self.options.color];

    decal.parent = otherImpostor.object;
    var m = new BABYLON.Matrix();
    otherImpostor.object.getWorldMatrix().invertToRef(m);
    let position = BABYLON.Vector3.TransformCoordinates(hit.pickedPoint, m);
    decal.position = position;

    decal.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(
      decal.rotation.x,
      decal.rotation.y,
      decal.rotation.z
    );
    let rotationQuaternion = BABYLON.Quaternion.Inverse(otherImpostor.object.absoluteRotationQuaternion);
    decal.rotationQuaternion = rotationQuaternion.multiply(decal.rotationQuaternion);

    if (self.options.splatterTTL > 0) {
      setTimeout(
        (function (d) {
          return function(){
            d.dispose();
          };
        }) (decal),
        self.options.splatterTTL
      );
    }

    if (typeof otherImpostor.object.paintballCollide == 'function') {
      otherImpostor.object.paintballCollide(otherImpostor, ownImpostor, hit);
    }

    ownImpostor.toBeDisposed = true;
  }

  this.createPaintball = function(power) {
    let paintball = new BABYLON.MeshBuilder.CreateSphere('paintball', {diameter: 1, segments: 3}, scene);
    paintball.material = self.paintballColors[self.options.color];
    paintball.color = self.options.color;
    paintball.parent = self.body;
    paintball.position.y = 0.25;
    paintball.position.z = 5.2;
    self.body.removeChild(paintball);

    paintball.physicsImpostor = new BABYLON.PhysicsImpostor(
      paintball,
      BABYLON.PhysicsImpostor.SphereImpostor,
      {
        mass: 10
      },
      scene
    );

    scene.meshes.forEach(function(mesh){
      if (mesh.id == 'paintball' || mesh.parent != null) return;
      if (mesh.physicsImpostor) {
        paintball.physicsImpostor.registerOnPhysicsCollide(mesh.physicsImpostor, self.paintballCollide);
      }
    })
    paintball.physicsImpostor.toBeDisposed = false;
    paintball.physicsImpostor.registerBeforePhysicsStep(function(impostor){
      if (impostor.toBeDisposed) {
        impostor.object.dispose();
        impostor.dispose();
      }
    })

    let impulseVector = new BABYLON.Vector3(0, 0, self.options.powerScale);
    impulseVector.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, impulseVector);
    impulseVector.scaleInPlace(power);
    paintball.physicsImpostor.applyImpulse(impulseVector, paintball.getAbsolutePosition());

    return paintball;
  };

  this.firePaintball = function() {
    let power = self.position * -1;
    self.position = 0;
    self.state = self.states.HOLDING;

    if (self.ammo == 0) {
      return;
    } else if (self.ammo > 0) {
      self.ammo--;
    }

    let paintball = self.createPaintball(power);
    setTimeout(function(){
      if (paintball.physicsImpostor) {
        paintball.physicsImpostor.toBeDisposed = true;
      }
    }, self.options.ttl)
    // self.paintballs.push(paintball);
  };

  this.setMotorSpeed = function(delta) {
    let speed = self.speed_sp;

    if (speed > self.options.maxSpeed) {
      speed = self.options.maxSpeed;
    } else if (speed < -self.options.maxSpeed) {
      speed = -self.options.maxSpeed;
    }

    if (self.positionDirectionReversed) {
      speed = -speed;
    }

    if (speed > 0 && self.position < 0) {
      self.firePaintball();
    }

    let position = self.position;
    position += speed * delta / 1000;

    if (position > 0) {
      position = 0;
      self.state = self.states.STATE_STALLED;
    } else if (position < self.options.drawBackLimit) {
      position = self.options.drawBackLimit;
      self.state = self.states.STATE_STALLED;
    }

    self.position = position;
  };

  this.init();
}

// Pen component, used for drawing a pen trace.  The pen is currently
// represented as a small green cube, which you can see if you zoom into
// the robot (the default position is on the bottom of the robot body).
// The pen defaults to being centered on the wheel axis.  This gives
// the most smooth trace during turns.  You can put the pen somewhere else
// by changing the robot options.  The rot option doesn't do anything yet.
function Pen(scene, parent, robot, pos, rot, options) {
  var self = this;
  this.scene = scene;
  this.robot = robot; // cache the robot so we can find the wheel axis center
  
  this.type = 'Pen';
  // TODO default options
  this.options = null;

  this.positionSetupNeeded = false;
  if (pos == undefined || pos == null) {
    this.positionSetupNeeded = true;
    // if the position is not given, we default to the center of the wheel
    // axis.  However, the wheel meshes are built *after* the components,
    // so we can't do it until later.  Therefore we use 0,0,0 as the temporary
    // position and correct it in Pen.finishInit() 
    this.position = new BABYLON.Vector3(0, -2, 0)
  } else {
    this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  }
  if (rot == undefined) {
    this.rotation = null
  }

  self.body = null
  var bodyMat = babylon.getMaterial(scene, '00FF00');
  // TODO - change options so it parallels the other robotComponent objs
  let bodyOptions = {
    height: 0.2,
    width: 0.2,
    depth: 0.2,
  };
  var body = BABYLON.MeshBuilder.CreateBox('penBox', bodyOptions, scene);
  self.body = body; // self.body is the mesh representing the pen
  body.material = bodyMat;

  body.position = self.position;
  body.parent = parent;

  body.physicsImpostor = new BABYLON.PhysicsImpostor(
    body,
    BABYLON.PhysicsImpostor.BoxImpostor,
    {
      mass: 0,
      restitution: 0.4,
      friction: 0.1 // ignored
    },
    scene
  );

  // pen trace rendering attributes
  this.is_down = false // we only draw pen traces for when the pen is down
  this.trace_color = new BABYLON.Color3(0.5, 0.5, 1.0);
  this.trace_material = null;
  // NOTE: pen_meshes does not include current_pen_mesh!
  this.meshes = []; // array of Ribbon mesh objects, one per down()/up()
  this.current_path = []; // the path we are currently drawing
  this.current_mesh = null;
  // animate can be set to 'none' to disable the pen
  this.default_options = {'animate' : 'animate',
                          'orientation' : 'h',
                          'width': 1.0,
                          'debug' : false
                         }
  // TODO creation options?
  this.options = {...this.default_options}
  // once the simulation is finished, we may need to render some paths once
  // this is set to true once simulation starts, then back to false after
  // the final render
  this.final_render_needed = false
  
  this.init = function() {
    this.reset();
  }

  this.finishInit = function() {
    if (self.positionSetupNeeded) {
      // default pen postion is exactly between the L and R
      // wheel positions.  Wheel meshes don't have a parent; their positions are
      // absolute.
      wheelLPos = self.robot.leftWheel.mesh.position
      wheelRPos = self.robot.rightWheel.mesh.position
      wheelLRel = wheelLPos.subtract(self.robot.body.position)
      wheelRRel = wheelRPos.subtract(self.robot.body.position)
      wheelAxisCenter = wheelLRel.add(wheelRRel).scale(1/2.0)
      // TODO - the -2 is the bottom edge of the standard robot body, fix
      newPosV = new BABYLON.Vector3(wheelAxisCenter.x, -2, wheelAxisCenter.z);
      self.body.setPositionWithLocalVector(newPosV);
      self.positionSetupNeeded = false;
    }
  }
  
  // We do all the work of updating the trace path and, when necessary,
  // drawing the pen trace in render().
  this.render = function(delta) {
    // assume that skulpt.running may change asynchronously
    robotRunning = skulpt.running
    if (robotRunning) {
      self.final_render_needed = true;
    } else {
      if (!self.final_render_needed) {
        return;
      }
    }
    // first, update the current trace path if needed
    self.update_trace_path();
    if (self.options['animate'] == 'animate') {
      // if animating the pen, rebuild each time through render loop
      if (self.current_path_dirty) {
        self.rebuild_mesh()
      }
    }
    if (!robotRunning && self.final_render_needed) {
      self.final_render()
    }
  }

  // Lower the pen (begin drawing a trace)
  this.down = function() {
    this.current_path = []; // the path we are currently drawing
    this.current_mesh = null;
    this.is_down = true
    if (self.options['debug']) {
      console.log('pen down');
    }
  };

  // Raise the pen (stop drawing a trace)
  this.up = function() {
    if (self.is_down) {
      if (self.options['animate'] === 'onUp' ||
          self.options['animate'] === 'onFinish') {
        self.rebuild_mesh()
      }
      if (this.current_mesh != null) {
        this.meshes.push(this.current_mesh)
        // slow, use for debugging ribbon only
        // this.showNormals(this.current_mesh, 1)
        this.current_mesh = null
      }
      this.current_path = [];
      self.current_path_dirty = false
    }
    this.is_down = false
    if (self.options['debug']) {
      console.log('pen up');
    }
  };

  this.set_trace_color = function(r, g, b) {
    this.trace_material = null;
    self.trace_color = new BABYLON.Color3(r, g, b);
    if (self.options['debug']) {
      console.log('pen trace color now', r, g, b);
    }
  };

  this.set_options = function(options) {
    self.last_options = options;
    js_options = Sk.ffi.remapToJs(options)
    if (self.options['debug']) {
      console.log('pen options set', js_options);
    }
    for (const [key, value] of Object.entries(js_options)) {
      if (self.options['debug']) {
        console.log('setting pen option ', key, ' : ', value);
      }
      self.options[key] = value;
    }    
  }

  // update current pen trace path if the pen is down
  this.update_trace_path = function() {
    if (!self.is_down) {
      return;
    }
    // Body position gets updated in the render loop prior to this
    // ref axes y and z are swapped!
    // default pen postion is exactly between the L and R
    // wheel positions.  Wheel meshes don't have a parent; their positions are
    // absolute.
    wheelAxisCenter = self.robot.leftWheel.mesh.position.add(self.robot.rightWheel.mesh.position).scale(1/2.0)
    let cur_pos = [wheelAxisCenter.x, wheelAxisCenter.z]
    if (self.body != null) {
      bodyPos = self.body.absolutePosition
      cur_pos = [bodyPos.x, bodyPos.z]
    }
    if (self.current_path.length == 0) {
      self.current_path.push(cur_pos);
      self.current_path_dirty = true;
    } else {
      let old_pos = self.current_path.slice(-1)[0];
      // TODO - this epsilon is in any coordinate.  It would be better
      // to use compare the difference vector distance to the epsilon 
      penPathEpsilon = 0.05
      if (arrayAlmostEquals(cur_pos, old_pos, penPathEpsilon)) {
        // efficiency, skip points very close to previous
      } else {
        self.current_path.push(cur_pos)
        self.current_path_dirty = true;
      }
    }
  };

  this.rebuild_mesh = function() {
    let animateMode = this.options['animate']
    if (animateMode === 'none') {
      return;
    }
    if (animateMode != 'animate' && self.options['debug']) {
      // gets called lots of times in animate mode, so don't log those
      console.log('pen rebuild mesh');
    }
    // drawing current path only
    var idx;
    var path = this.current_path;
    if (this.current_path.length < 2) {
      return;
    }
    if (this.current_mesh != null ) {
      // remove the old ribbon mesh
      this.scene.removeMesh(this.current_mesh);
      this.current_mesh.dispose();
      this.current_mesh = null;
    }
    if (this.trace_material == null) {
      this.trace_material = new BABYLON.StandardMaterial("pen trace mat",
                                                         self.scene);
      this.trace_material.alpha = 1.0;
      this.trace_material.diffuseColor = this.trace_color;
      this.trace_material.backFaceCulling = false;
    }
    // In animate mode, every time we change the path, we recreate the mesh.
    // TODO: consider ways to improve efficiency, such as keeping a constant
    // length path for some number of iterations and skipping positions so
    // that the ribbon appears to grow.
    // See https://playground.babylonjs.com/#2IWT8Q#5 for an example
    rpaths = ribbonVPathsFromXYPath(path, this.options);
    try {
      ribbon = BABYLON.MeshBuilder.CreateRibbon("ribbon",
                                                {pathArray: rpaths,
                                                 sideOrientation: BABYLON.Mesh.DOUBLESIDE},
                                                this.scene);
      if (animateMode === 'onFinish') {
        ribbon.setEnabled(false)
      }
      ribbon.material = this.trace_material;
      this.current_mesh = ribbon;
    } catch(err) {
      // do nothing if unable to create ribbon
    }
  };

  // visualize normals as described in 
  // https://www.html5gamedevs.com/topic/17040-the-mystery-of-computenormals/
  // this will be slow, so only use for debugging!
  this.showNormals = function(mesh, size) {
    var normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
    var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  
    for (var i = 0; i < normals.length; i += 3) {
      var v1 = BABYLON.Vector3.FromArray(positions, i);
      var v2 = v1.clone().add(BABYLON.Vector3.FromArray(normals, i).scaleInPlace(size));
      BABYLON.Mesh.CreateLines(""+i, [v1, v2], scene);
    }
  }
  
  this.final_render = function() {
    if (self.options['debug']) {
      console.log('pen final render');
    }
    // force the pen to finish up so the last path gets rendered
    self.up();
    self.final_render_needed = false;
    for (idx = 0; idx < this.meshes.length; idx++) {
      mesh = this.meshes[idx];
      mesh.setEnabled(true); // make mesh visible
    }
  }

  // clear all pen meshes, clear the current pen trace, set the pen to up
  this.reset = function() {
    this.is_down = false
    this.final_render_needed = false
    // reset to default trace color
    this.trace_color = new BABYLON.Color3(0.5, 0.5, 1.0);
    this.trace_material = null
    this.options = {...this.default_options}
    if (this.current_mesh != null ) {
      self.scene.removeMesh(this.current_mesh)
      this.current_mesh.dispose()
      this.current_mesh = null;
    }
    for (idx = 0; idx < this.meshes.length; idx++) {
      mesh = this.meshes[idx]
      self.scene.removeMesh(mesh)
      mesh.dispose()
    }
    this.meshes = []
    this.current_path = []; // the path we are currently drawing
    this.current_path_dirty = false
  }

  this.init();
}

function arrayAlmostEquals(a, b, epsilon) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => Math.abs(val-b[index]) <= epsilon);
}    

function ribbonVPathsFromXYPath(xyPath, pen_options){
  // note Z and Y need to be flipped in creating the vectors.  Not sure why.
  // we're going to make the ribbon width vertical
  ribbon_width = pen_options.width;
  r_v_path = [];  
  r_v_path2 = [];  
  for (idx = 0; idx < xyPath.length; idx++) {
    x = xyPath[idx][0]
    y = xyPath[idx][1]
    z = 0
    if (pen_options.orientation[0] == 'h') {
      if (idx == 0) {
        v1 = new BABYLON.Vector3(x, 0.1, y);
        v2 = v1;
      } else {
        // offset each of v1 v2 perpendicular to travel direction
        dx = x - lastx
        dy = y - lasty
        crossv = new BABYLON.Vector2(dy, -dx)
        crossv = crossv.normalize().scale(ribbon_width/2.0)
        // console.log('ns-x,y:', x, y, 'dx,dy :', dx, dy)
        // console.log('ns-crossv :', crossv)
        v1 = new BABYLON.Vector3(x+crossv.x, 0.1, y+crossv.y);
        v2 = new BABYLON.Vector3(x-crossv.x, 0.1, y-crossv.y);
      }
      lastx = x
      lasty = y
    } else {
      v1 = new BABYLON.Vector3(x, z, y);
      v2 = new BABYLON.Vector3(x, z+ribbon_width, y);
    }
    r_v_path.push(v1);
    r_v_path2.push(v2);
  }
  return [r_v_path, r_v_path2]
}  
