Colors = {
  COLOR_NOCOLOR: 0, // HSV values from https://lego.fandom.com/wiki/Colour_Palette
  COLOR_BLACK: 1,   // 0, 0, 0
  COLOR_BLUE: 2,    // 207, 64, 78
  COLOR_GREEN: 3,   // 120, 100, 60
  COLOR_YELLOW: 4,  // 60, 100, 100
  COLOR_RED: 5,     // 0, 100, 100
  COLOR_WHITE: 6,   // 0, 0, 100
  COLOR_BROWN: 7,   // 24, 79, 25

  COLORS: [
    'NoColor',
    'Black',
    'Blue',
    'Green',
    'Yellow',
    'Red',
    'White',
    'Brown',
  ],

  toHSV: function(rgb) {
    var hsv = [0, 0, 0];
    var normRgb = [0, 0, 0]

    for (let i=0; i<3; i++) {
      normRgb[i] = rgb[i] / 255;
    }

    var cMax = Math.max(...normRgb);
    var cMin = Math.min(...normRgb);
    var diff = cMax - cMin;

    if (cMax == cMin) {
      hsv[0] = 0;
    } else if (cMax == normRgb[0]) {
      hsv[0] = 60 * (normRgb[1] - normRgb[2]) / diff;
    } else if (cMax == normRgb[1]) {
      hsv[0] = 60 * (2 + (normRgb[2] - normRgb[0]) / diff);
    } else {
      hsv[0] = 60 * (4 + (normRgb[0] - normRgb[1]) / diff);
    }
    if (hsv[0] < 0) {
      hsv[0] += 360;
    }

    if (cMax == 0) {
      hsv[1] = 0;
    } else {
      hsv[1] = diff / cMax * 100;
    }

    hsv[2] = cMax * 100;

    return hsv;
  },

  toLAB: function(rgb) {
    var xyz = [0, 0, 0];
    var lab = [0, 0, 0];
    var normRgb = [0, 0, 0]

    for (let i=0; i<3; i++) {
      let c = rgb[i] / 255;
      if (c > 0.04045) {
        normRgb[i] = Math.pow((c + 0.055) / 1.055, 2.4);
      } else {
        normRgb[i] = c / 12.92;
      }
    }

    xyz[0] = (normRgb[0] * 0.4124 + normRgb[1] * 0.3576 + normRgb[2] * 0.1805) / 0.95047;
    xyz[1] = (normRgb[0] * 0.2126 + normRgb[1] * 0.7152 + normRgb[2] * 0.0722) / 1.00000;
    xyz[2] = (normRgb[0] * 0.0193 + normRgb[1] * 0.1192 + normRgb[2] * 0.9505) / 1.08883;

    for (let i=0; i<3; i++) {
      if (xyz[i] > 0.008856) {
        xyz[i] = Math.pow(xyz[i], 1/3);
      } else {
        xyz[i] = (7.787 * xyz[i]) + 16/116;
      }
    }

    lab[0] = (116 * xyz[1]) - 16;
    lab[1] = 500 * (xyz[0] - xyz[1]);
    lab[2] = 200 * (xyz[1] - xyz[2]);

    return lab;
  },

  toHLS: function(rgb) {
    var hls = [0, 0, 0];
    var normRgb = [0, 0, 0]

    for (let i=0; i<3; i++) {
      normRgb[i] = rgb[i] / 255;
    }

    var cMax = Math.max(...normRgb);
    var cMin = Math.min(...normRgb);
    var diff = cMax - cMin;

    if (cMax == cMin) {
      hls[0] = 0;
    } else if (cMax == normRgb[0]) {
      hls[0] = 60 * (normRgb[1] - normRgb[2]) / diff;
    } else if (cMax == normRgb[1]) {
      hls[0] = 60 * (2 + (normRgb[2] - normRgb[0]) / diff);
    } else {
      hls[0] = 60 * (4 + (normRgb[0] - normRgb[1]) / diff);
    }
    if (hls[0] < 0) {
      hls[0] += 360;
    }

    if (cMax == 0 || cMin == 255) {
      hls[2] = 0;
    } else {
      hls[2] = diff / (1 - Math.abs(cMax + cMin - 1)) * 100;
    }

    hls[1] = (cMax + cMin) / 2 * 100;

    return hls;
  },

  toColor: function(hsv) {
    if (hsv[2] < 30)
      return Colors.COLOR_BLACK;
    else if (hsv[1] < 20)
      return Colors.COLOR_WHITE;
    else if (hsv[0] < 45 && hsv[2] < 50)
      return Colors.COLOR_BROWN;
    else if (hsv[0] < 30)
      return Colors.COLOR_RED;
    else if (hsv[0] < 90)
      return Colors.COLOR_YELLOW;
    else if (hsv[0] < 163)
      return Colors.COLOR_GREEN;
    else if (hsv[0] < 283)
      return Colors.COLOR_BLUE;
    else
      return Colors.COLOR_RED;
  },

  toColorName: function(color) {
    return Colors.COLORS[color];
  }
}

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
    body.component = self;
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
    self.eye = new BABYLON.MeshBuilder.CreateSphere('colorSensorEye', {diameterX: 1, diameterY: 1, diameterZ: 0.6, segments: 3}, scene);
    self.eye.material = eyeMat;
    self.eye.position.z = 1.5;
    self.eye.parent = body;

    // Create camera and RTT
    self.rttCam = new BABYLON.FreeCamera('Camera', self.position, scene, false);
    self.rttCam.fov = self.options.sensorFov;
    self.rttCam.minZ = self.options.sensorMinRange;
    self.rttCam.maxZ = self.options.sensorMaxRange;
    self.rttCam.updateUpVectorFromRotation = true;

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
      if (mesh.name == 'colorSensorEye') {
        return;
      }
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
    self.rttCam.position = self.eye.getAbsolutePosition();
    self.rttCam.rotationQuaternion = self.body.absoluteRotationQuaternion;
    if (babylon.engine._webGLVersion >= 2 && babylon.DISABLE_ASYNC == false) {
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

    return self._clientWaitAsync(sync, 0, 0).then(
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

    var bodyMat = babylon.getMaterial(scene, self.options.color);

    let VALID_IMAGETYPES = ['top','front','repeat','all','cylinder','sphere'];
    if (VALID_IMAGETYPES.indexOf(self.options.imageType) != -1 && self.options.imageURL != '') {
      bodyMat = new BABYLON.StandardMaterial('imageObject' + self.options.imageURL, scene);
      var texture = new BABYLON.Texture(self.options.imageURL, scene);
      bodyMat.diffuseTexture = texture;
      bodyMat.diffuseTexture.uScale = self.options.uScale;
      bodyMat.diffuseTexture.vScale = self.options.vScale;
      bodyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    }

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }

    if (self.options.imageType == 'top') {
      faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
    } else if (self.options.imageType == 'front') {
      faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1);
    } else if (self.options.imageType == 'repeat') {
      for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
      }
    } else if (self.options.imageType == 'all') {
      faceUV[0] = new BABYLON.Vector4(0,   0,   1/3, 1/2);
      faceUV[1] = new BABYLON.Vector4(1/3, 0,   2/3, 1/2);
      faceUV[2] = new BABYLON.Vector4(2/3, 0,   1,   1/2);
      faceUV[3] = new BABYLON.Vector4(0,   1/2, 1/3, 1);
      faceUV[4] = new BABYLON.Vector4(1/3, 1/2, 2/3, 1);
      faceUV[5] = new BABYLON.Vector4(2/3, 1/2, 1,   1);
    }

    let bodyOptions = {
      height: self.options.height,
      width: self.options.width,
      depth: self.options.depth,
      faceUV: faceUV,
      wrap: true,
    };
    var body = BABYLON.MeshBuilder.CreateBox('boxBody', bodyOptions, scene);
    self.body = body;
    body.component = self;
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
      depth: 1,
      color: 'A3CF0D',
      imageType: 'repeat',
      imageURL: '',
      uScale: 1,
      vScale: 1
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

// Just a dumb cylinder with physics
function CylinderBlock(scene, parent, pos, rot, options) {
  var self = this;

  this.type = 'Cylinder';
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);

  this.init = function() {
    self.setOptions(options);

    var bodyMat = babylon.getMaterial(scene, self.options.color);

    let VALID_IMAGETYPES = ['top','front','repeat','all','cylinder','sphere'];
    if (VALID_IMAGETYPES.indexOf(self.options.imageType) != -1 && self.options.imageURL != '') {
      bodyMat = new BABYLON.StandardMaterial('imageObject' + self.options.imageURL, scene);
      var texture = new BABYLON.Texture(self.options.imageURL, scene);
      bodyMat.diffuseTexture = texture;
      bodyMat.diffuseTexture.uScale = self.options.uScale;
      bodyMat.diffuseTexture.vScale = self.options.vScale;
      bodyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    }

    let bodyOptions = {
      height: self.options.height,
      diameter: self.options.diameter
    };

    if (self.options.imageType == 'cylinder') {
      var faceUV = new Array(3);
      faceUV[0] = new BABYLON.Vector4(0,   0,   1/4, 1);
      faceUV[1] = new BABYLON.Vector4(3/4, 0,   1/4, 1);
      faceUV[2] = new BABYLON.Vector4(3/4, 0,   1,   1);
      bodyOptions.faceUV = faceUV;
    }

    var body = BABYLON.MeshBuilder.CreateCylinder('cylinderBody', bodyOptions, scene);
    self.body = body;
    body.component = self;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);

    body.physicsImpostor = new BABYLON.PhysicsImpostor(
      body,
      BABYLON.PhysicsImpostor.CylinderImpostor,
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
      diameter: 1,
      color: 'A3CF0D',
      imageType: 'cylinder',
      imageURL: '',
      uScale: 1,
      vScale: 1
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

// Just a dumb sphere with physics
function SphereBlock(scene, parent, pos, rot, options) {
  var self = this;

  this.type = 'Sphere';
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);

  this.init = function() {
    self.setOptions(options);

    var bodyMat = babylon.getMaterial(scene, self.options.color);

    let VALID_IMAGETYPES = ['top','front','repeat','all','cylinder','sphere'];
    if (VALID_IMAGETYPES.indexOf(self.options.imageType) != -1 && self.options.imageURL != '') {
      bodyMat = new BABYLON.StandardMaterial('imageObject' + self.options.imageURL, scene);
      var texture = new BABYLON.Texture(self.options.imageURL, scene);
      bodyMat.diffuseTexture = texture;
      bodyMat.diffuseTexture.uScale = self.options.uScale;
      bodyMat.diffuseTexture.vScale = self.options.vScale;
      bodyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    }

    let bodyOptions = {
      diameter: self.options.diameter
    };
    var body = BABYLON.MeshBuilder.CreateSphere('sphereBody', bodyOptions, scene);
    self.body = body;
    body.component = self;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);

    body.physicsImpostor = new BABYLON.PhysicsImpostor(
      body,
      BABYLON.PhysicsImpostor.SphereImpostor,
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
      diameter: 1,
      color: 'A3CF0D',
      imageType: 'sphere',
      imageURL: '',
      uScale: 1,
      vScale: 1
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
    body.component = self;
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
      height: 2 - 0.01,
      width: 5 - 0.01,
      depth: 2 - 0.01,
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
        [0, -0.367], [0, -0.244], [0, -0.122], [-0.035,0], [0, 0], [0.035,0], [0, 0.122], [0, 0.244], [0, 0.367],
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

  this.filterRay = function(mesh) {
    if (mesh.isPickable == false) {
      return false;
    }
    if (mesh.ultrasonicDetection == 'invisible') {
      return false;
    }
    return true;
  };

  this.getDistance = function() {
    var shortestDistance = self.options.rayLength;

    var rayOffset = new BABYLON.Vector3(0,0,0);
    self.options.rayOrigin.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, rayOffset);
    self.rays[0].origin.copyFrom(self.body.absolutePosition);
    self.rays[0].origin.addInPlace(rayOffset);

    self.rayVectors.forEach(function(rayVector, i){
      rayVector.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, self.rays[i].direction);

      var hit = scene.pickWithRay(self.rays[i], self.filterRay);
      if (hit.hit == false || hit.pickedMesh.ultrasonicDetection == 'absorb') {
        return;
      }
      if (hit.distance < shortestDistance) {
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
  this.yawRotation = {
    angularVelocity: 0,
    actualRotation: 0,
    rotationRounds: 0,
    rotationAdjustment: 0
  };
  this.pitchRotation = {
    angularVelocity: 0,
    actualRotation: 0,
    rotationRounds: 0,
    rotationAdjustment: 0
  };
  this.rollRotation = {
    angularVelocity: 0,
    actualRotation: 0,
    rotationRounds: 0,
    rotationAdjustment: 0
  };
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(0, 0, 0);
  this.UP = new BABYLON.Vector3(0,1,0);
  this.RIGHT = new BABYLON.Vector3(1,0,0);
  this.FORWARD = new BABYLON.Vector3(0,0,1);
  this.s1 = new BABYLON.Vector3(0,0,1);
  this.s2 = new BABYLON.Vector3(1,0,0);
  this.origin = new BABYLON.Vector3(0,0,0);

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
    body.component = self;
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
    let e = new BABYLON.Vector3(0,0,0);

    function calculateActualAndVelocity(rot, rotationObj) {
      if (! isNaN(rot)) {
        if (rot - rotationObj.prevRotation > 180) {
          rotationObj.rotationRounds -= 1;
        } else if (rot - rotationObj.prevRotation < -180) {
          rotationObj.rotationRounds += 1;
        }
        rotationObj.prevRotation = rot;

        let rotation = rotationObj.rotationRounds * 360 + rot;
        if (delta > 0) {
          rotationObj.angularVelocity = 0.8 * rotationObj.angularVelocity + 0.2 * ((rotation - rotationObj.actualRotation) / delta * 1000);
        }
        rotationObj.actualRotation = rotation;
      }
    }

    // Yaw
    self.s1.rotateByQuaternionAroundPointToRef(self.body.absoluteRotationQuaternion, self.origin, e);
    let ey = e.y;
    e.y = 0;
    let rot = BABYLON.Vector3.GetAngleBetweenVectors(self.s1, e, self.UP) / Math.PI * 180;
    calculateActualAndVelocity(rot, self.yawRotation);

    // Pitch
    e.y = ey;
    e.x = 0;
    e.z = Math.sqrt(1 - e.y**2);
    rot = BABYLON.Vector3.GetAngleBetweenVectors(self.s1, e, self.RIGHT) / Math.PI * -180;
    calculateActualAndVelocity(rot, self.pitchRotation);

    // Roll
    self.s2.rotateByQuaternionAroundPointToRef(self.body.absoluteRotationQuaternion, self.origin, e);
    e.x = Math.sqrt(1 - e.y**2);
    e.z = 0;
    rot = BABYLON.Vector3.GetAngleBetweenVectors(self.s2, e, self.FORWARD) / Math.PI * -180;
    calculateActualAndVelocity(rot, self.rollRotation);
  };

  this.reset = function() {
    self.yawRotation.rotationAdjustment = self.yawRotation.actualRotation;
    self.pitchRotation.rotationAdjustment = self.pitchRotation.actualRotation;
    self.rollRotation.rotationAdjustment = self.rollRotation.actualRotation;
  };

  this.getYawAngle = function() {
    return self.yawRotation.actualRotation - self.yawRotation.rotationAdjustment;
  };

  this.getYawRate = function() {
    return self.yawRotation.angularVelocity;
  };

  this.getPitchAngle = function() {
    return self.pitchRotation.actualRotation - self.pitchRotation.rotationAdjustment;
  };

  this.getPitchRate = function() {
    return self.pitchRotation.angularVelocity;
  };

  this.getRollAngle = function() {
    return self.rollRotation.actualRotation - self.rollRotation.rotationAdjustment;
  };

  this.getRollRate = function() {
    return self.rollRotation.angularVelocity;
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
    body.component = self;
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
    body.component = self;
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
      maxPower: 4000,
      dGain : 0.08
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

    function getPhysicsParent(body) {
      let parent = body;
      while (true) {
        if (parent.parent == null) {
          return parent;
        } else {
          parent = parent.parent;
        }
      }
    }

    let meshPhysicsParent = getPhysicsParent(mesh);

    let power = 1 / distance^2 * self.power;
    if (self.power < 0){
      vec.normalize();
      meshPhysicsParent.physicsImpostor.applyForce(vec.scale(power), mesh.absolutePosition);
    }
    else{
      let meshVel = meshPhysicsParent.physicsImpostor.getLinearVelocity();

      let physicsParent = getPhysicsParent(self.body);
      let center = physicsParent.absolutePosition;
      let centerVel = physicsParent.physicsImpostor.getLinearVelocity();
      let omega = physicsParent.physicsImpostor.getAngularVelocity();
      let bodyVel = centerVel.add(BABYLON.Vector3.Cross(omega,mesh.absolutePosition.subtract(center)));

      let error = meshVel.subtract(bodyVel);

      let normalVec = vec.normalize();
      error.subtractInPlace(normalVec.scale(BABYLON.Vector3.Dot(error, normalVec)));

      let pd = error.scale(self.options.dGain);
      let pdAdded = mesh.absolutePosition.add(pd);
      let pdVec = self.attractor.absolutePosition.subtract(pdAdded);
      pdVec.normalize();

      meshPhysicsParent.physicsImpostor.applyForce(pdVec.scale(power), mesh.absolutePosition);
    }
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
    body.component = self;
    body.visibility = false;
    body.parent = parent;
    body.position = self.bodyPosition;
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL);
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL);
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL);

    var armBaseMat = babylon.getMaterial(scene, self.options.baseColor);

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

    var pivotMat = babylon.getMaterial(scene, self.options.pivotColor);

    var pivot = BABYLON.MeshBuilder.CreateBox('pivot', {height: 0.5, wdth: 2.4, depth: 0.5}, scene);;
    self.pivot = pivot;
    pivot.component = self;
    pivot.material = pivotMat;
    pivot.position.y = 0.5;
    scene.shadowGenerator.addShadowCaster(pivot);

    var armMat = babylon.getMaterial(scene, self.options.armColor);

    let VALID_IMAGETYPES = ['top','front','repeat','all','cylinder','sphere'];
    if (VALID_IMAGETYPES.indexOf(self.options.imageType) != -1 && self.options.imageURL != '') {
      armMat = new BABYLON.StandardMaterial('imageObject' + self.options.imageURL, scene);
      var texture = new BABYLON.Texture(self.options.imageURL, scene);
      armMat.diffuseTexture = texture;
      armMat.diffuseTexture.uScale = self.options.uScale;
      armMat.diffuseTexture.vScale = self.options.vScale;
      armMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    }

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }

    if (self.options.imageType == 'top') {
      faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
    } else if (self.options.imageType == 'front') {
      faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1);
    } else if (self.options.imageType == 'repeat') {
      for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
      }
    } else if (self.options.imageType == 'all') {
      faceUV[0] = new BABYLON.Vector4(0,   0,   1/3, 1/2);
      faceUV[1] = new BABYLON.Vector4(1/3, 0,   2/3, 1/2);
      faceUV[2] = new BABYLON.Vector4(2/3, 0,   1,   1/2);
      faceUV[3] = new BABYLON.Vector4(0,   1/2, 1/3, 1);
      faceUV[4] = new BABYLON.Vector4(1/3, 1/2, 2/3, 1);
      faceUV[5] = new BABYLON.Vector4(2/3, 1/2, 1,   1);
    }

    let armOptions = {
      height: 1,
      width: 1,
      depth: self.options.armLength,
      faceUV: faceUV,
      wrap: true
    };

    var arm = BABYLON.MeshBuilder.CreateBox('arm', armOptions, scene);;
    self.arm = arm;
    self.end = arm;
    arm.material = armMat;
    scene.shadowGenerator.addShadowCaster(arm);
    arm.position.z += (self.options.armLength / 2) - 1;

    pivot.parent = parent;
    pivot.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL);
    pivot.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL);
    pivot.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL);
    pivot.position = self.bodyPosition.clone();
    pivot.translate(BABYLON.Axis.Y, 0.5, BABYLON.Space.LOCAL);
    pivot.rotate(BABYLON.Axis.X, -(self.options.startAngle * Math.PI / 180), BABYLON.Space.LOCAL);
    parent.removeChild(pivot);
    arm.parent = pivot;

    self.positionAdjustment = self.options.startAngle;
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
        restitution: self.options.restitution,
        friction: self.options.friction
      },
      scene
    );
  };

  this.loadJoints = function() {
    let mainPivot = BABYLON.Vector3.Zero();
    mainPivot.y += 0.5;
    mainPivot.rotateByQuaternionToRef(self.body.rotationQuaternion, mainPivot);
    let connectedPivot = BABYLON.Vector3.Zero();
    let axisVec = new BABYLON.Vector3(1, 0, 0);
    axisVec.rotateByQuaternionAroundPointToRef(self.body.rotationQuaternion, BABYLON.Vector3.Zero(), axisVec);

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
      startAngle: 0,
      mass: 100,
      baseColor: 'A39C0D',
      pivotColor: '808080',
      armColor: 'A3CF0D',
      imageType: 'repeat',
      imageURL: '',
      uScale: 1,
      vScale: 1,
      restitution: 0.4,
      friction: 0.1,
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
    body.component = self;
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

  this.filterRay = function(mesh) {
    if (mesh.isPickable == false) {
      return false;
    }
    if (mesh.laserDetection == 'invisible') {
      return false;
    }
    return true;
  };

  this.getDistance = function() {
    var shortestDistance = self.options.rayLength;

    var rayOffset = new BABYLON.Vector3(0,0,0);
    self.options.rayOrigin.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, rayOffset);
    self.rays[0].origin.copyFrom(self.body.absolutePosition);
    self.rays[0].origin.addInPlace(rayOffset);

    self.rayVectors.forEach(function(rayVector, i){
      rayVector.rotateByQuaternionToRef(self.body.absoluteRotationQuaternion, self.rays[i].direction);

      var hit = scene.pickWithRay(self.rays[i], self.filterRay);
      if (hit.hit == false || hit.pickedMesh.laserDetection == 'absorb') {
        return;
      }
      if (hit.distance < shortestDistance) {
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

    var swivelBodyMat = babylon.getMaterial(scene, self.options.baseColor);

    var body = BABYLON.MeshBuilder.CreateBox('swivelBody', {height: 1, width: self.options.width, depth: self.options.width}, scene);
    self.body = body;
    body.component = self;
    self.body.material = swivelBodyMat;
    body.parent = parent;
    body.position = self.bodyPosition;
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
    scene.shadowGenerator.addShadowCaster(body);

    var platformMat = babylon.getMaterial(scene, self.options.platformColor);

    var platform = BABYLON.MeshBuilder.CreateCylinder('platform', {height: 0.5, diameter: self.options.width / 3 * 2.5, tessellation:12}, scene);;
    self.platform = platform;
    platform.component = self;
    self.end = platform;
    platform.material = platformMat;

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
        mass: 0,
      },
      scene
    );
    self.platform.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.platform,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: self.options.mass,
        restitution: self.options.restitution,
        friction: self.options.friction
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
      baseColor: 'A39C0D',
      platformColor: '808080',
      width: 3,
      restitution: 0.4,
      friction: 0.1,
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
    body.component = self;
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

// Pen
function Pen(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'Pen';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(0, 0, 0);

  this.isDown = false;
  this.traceColor = '000';
  this.traceWidth = 0.5;
  this.traceMat = null;
  this.traceMeshes = [];
  this.currentMesh = null;
  this.prevPos = null;
  this.currentPathDirty = false;
  this.currentRibbonPath = [[], []];

  this.init = function() {
    self.setOptions(options);

    var bodyMat = babylon.getMaterial(scene, 'E1A32B');
    let bodyOptions = {
      height: 3,
      width: 1.5,
      depth: 1.5
    };
    var body = BABYLON.MeshBuilder.CreateBox('penBody', bodyOptions, scene);
    self.body = body;
    body.component = self;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);

    body.position.y += 2.5;
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

    var tipMat = babylon.getMaterial(scene, '000000');
    let tipOptions = {
      height: 1,
      diameterTop: 1.5,
      diameterBottom: 0.01,
      tessellation: 4
    };
    self.tip = new BABYLON.MeshBuilder.CreateCylinder('penTip', tipOptions, scene);
    self.tip.material = tipMat;
    self.tip.position.y = -2;
    self.tip.parent = body;
  };

  this.setOptions = function(options) {
    self.options = {
      doubleSided: false
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
    self.updateTracePath();
    if (self.currentPathDirty) {
      self.rebuildMesh()
    }
  }

  // Lower the pen (begin drawing a trace)
  this.down = function() {
    self.currentRibbonPath = [[], []];
    self.currentMesh = null;
    self.prevPos = null;
    self.isDown = true;
  };

  // Raise the pen (stop drawing a trace)
  this.up = function() {
    self.isDown = false
    if (self.currentMesh != null) {
      self.traceMeshes.push(self.currentMesh)
      self.currentMesh = null;
    }
    self.currentPathDirty = false
  };

  this.setTraceColor = function(r, g, b) {
    // if the pen is down, setting the trace color causes a new trace to start.
    // This is so the new ribbon can have a different material.
    if (self.isDown) {
      self.up();
      self.down();
    }
    r = ('0' + Math.round(r*255).toString(16)).slice(-2);
    g = ('0' + Math.round(g*255).toString(16)).slice(-2);
    b = ('0' + Math.round(b*255).toString(16)).slice(-2);
    self.traceColor = r + g + b;
    self.traceMat = babylon.getMaterial(scene, self.traceColor);
  };

  this.setWidth = function(width) {
    self.traceWidth = width / 2;
  }

  this.updateTracePath = function() {
    if (!self.isDown) {
      return;
    }
    let pos = self.tip.getAbsolutePosition();
    pos.y -= 0.48;

    if (self.prevPos === null) {
      self.prevPos = pos.clone();
      self.currentPathDirty = true;
    } else {
      const penPathEpsilon = 0.2;
      let dirV = pos.subtract(self.prevPos);
      if (dirV.lengthSquared() > penPathEpsilon) {
        self.prevPos = pos.clone();
        let left = new BABYLON.Vector3(0, self.traceWidth, 0);
        let right = new BABYLON.Vector3(0, -self.traceWidth, 0);
        // cross product is proprtional to lengths of both vectors, but we
        // do not want the trace width to vary with the robot speed
        dirV = dirV.normalize()
        left = dirV.cross(left);
        right = dirV.cross(right);
        left.addInPlace(pos);
        right.addInPlace(pos);
        self.currentRibbonPath[0].push(left);
        self.currentRibbonPath[1].push(right);
        self.currentPathDirty = true;
      }
    }
  };

  this.rebuildMesh = function() {
    if (self.currentRibbonPath[0].length < 2) {
      return;
    }
    if (self.currentMesh != null ) {
      scene.removeMesh(self.currentMesh);
      self.currentMesh.dispose();
    }
    if (self.traceMat == null) {
      self.traceMat = babylon.getMaterial(scene, self.traceColor);
    }
    let options = {
      pathArray: self.currentRibbonPath,
    };
    if (self.options.doubleSided) {
      options.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
    }
    self.currentMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", options, scene);
    self.currentMesh.material = self.traceMat;
  };

  this.init();
}

// Touch sensor
function TouchSensor(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'TouchSensor';
  this.port = port;
  this.options = null;

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.pressed = false;

  this.init = function() {
    self.setOptions(options);

    var bodyMat = babylon.getMaterial(scene, 'FFFFFF');
    let bodyOptions = {
      height: 2,
      width: self.options.width,
      depth: self.options.depth
    };
    var body = BABYLON.MeshBuilder.CreateBox('touchSensorBody', bodyOptions, scene);
    self.body = body;
    body.component = self;
    body.material = bodyMat;
    scene.shadowGenerator.addShadowCaster(body);

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
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL);
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL);
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL);

    var fakeSensorMat = babylon.getMaterial(scene, 'E60000');
    let sensorOptions = {
      height: 0.8,
      width: self.options.width - 0.2,
      depth: self.options.depth - 0.2
    };
    self.fakeSensor = BABYLON.MeshBuilder.CreateBox('touchSensorBodyFake', sensorOptions, scene);
    self.fakeSensor.material = fakeSensorMat;
    self.fakeSensor.position.y = -1.4;
    self.fakeSensor.parent = body;

    // Real sensor is invisible, but with a physics body
    self.realSensor = BABYLON.MeshBuilder.CreateBox('touchSensorBodyReal', sensorOptions, scene);
    self.realSensor.material = fakeSensorMat;
    self.realSensor.isVisible = false;
    self.realSensor.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.realSensor,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0
      },
      scene
    );
    self.realSensor.physicsImpostor.physicsBody.setCollisionFlags(4);

    self.realSensor.physicsImpostor.registerBeforePhysicsStep(function(){
      self.realSensor.position = self.fakeSensor.getAbsolutePosition();
      self.realSensor.rotationQuaternion = self.fakeSensor.absoluteRotationQuaternion;
      self.realSensor.physicsImpostor.forceUpdate();
      self.realSensor.physicsImpostor.physicsBody.setCollisionFlags(4);
      self.pressed = false;
    });
  };

  this.loadMeshes = function(meshes) {
    meshes.forEach(function(mesh){
      if (mesh.parent != null || mesh == parent || mesh == self.realSensor) return;
      if (mesh.physicsImpostor) {
        self.realSensor.physicsImpostor.registerOnPhysicsCollide(mesh.physicsImpostor, function(own, other){
          self.pressed = true;
        });
      }
    });
  }

  this.setOptions = function(options) {
    self.options = {
      width: 2,
      depth: 2
    };

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }
  };

  this.isPressed = function() {
    return self.pressed;
  };

  this.init();
}

// Motorized linear
function LinearActuator(scene, parent, pos, rot, port, options) {
  var self = this;

  this.type = 'LinearActuator';
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
  this.positionDirectionReversed = false;

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
    function getPhysicsParent(mesh) {
      if (mesh.parent != null) {
        return getPhysicsParent(mesh.parent);
      } else {
        return mesh;
      }
    }
    parent = getPhysicsParent(parent);

    self.setOptions(options);

    var mainBodyMat = babylon.getMaterial(scene, self.options.baseColor);

    var body = BABYLON.MeshBuilder.CreateBox('sliderBody', {height: self.options.width, width: self.options.baseLength, depth: self.options.baseThickness}, scene);
    self.body = body;
    body.component = self;
    self.body.material = mainBodyMat;
    body.parent = parent;
    body.position = self.bodyPosition;
    body.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    body.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
    scene.shadowGenerator.addShadowCaster(body);

    var platformMat = babylon.getMaterial(scene, self.options.platformColor);

    var platform = BABYLON.MeshBuilder.CreateBox('platform', {height: self.options.width, width: self.options.platformLength, depth: self.options.platformThickness}, scene);;
    self.platform = platform;
    platform.component = self;
    self.end = platform;
    platform.material = platformMat;

    platform.parent = parent;
    platform.rotate(BABYLON.Axis.Y, self.rotation.y, BABYLON.Space.LOCAL)
    platform.rotate(BABYLON.Axis.X, self.rotation.x, BABYLON.Space.LOCAL)
    platform.rotate(BABYLON.Axis.Z, self.rotation.z, BABYLON.Space.LOCAL)
    platform.position = self.bodyPosition.clone();
    platform.translate(BABYLON.Axis.Z, (self.options.baseThickness + self.options.platformThickness) / 2, BABYLON.Space.LOCAL);
    platform.translate(BABYLON.Axis.X, self.options.startPos, BABYLON.Space.LOCAL);
    parent.removeChild(platform);

    self.positionAdjustment = self.options.startPos * self.options.degreesPerCm;
  };

  this.loadImpostor = function() {
    self.body.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.body,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
      },
      scene
    );
    self.platform.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.platform,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: self.options.mass,
        restitution: self.options.restitution,
        friction: self.options.friction
      },
      scene
    );
  };

  this.loadJoints = function() {
    let axis1 = new Ammo.btTransform();
    let axis2 = new Ammo.btTransform();

    axis1.setIdentity();
    axis2.setIdentity();

    let offset = new BABYLON.Vector3(0, 0, (self.options.baseThickness + self.options.platformThickness) / 2 + 0.01);
    offset.rotateByQuaternionToRef(self.body.rotationQuaternion, offset);

    axis1.setOrigin(new Ammo.btVector3(
      self.body.position.x + offset.x,
      self.body.position.y + offset.y,
      self.body.position.z + offset.z
    )); 

    let babylonQuaternion = BABYLON.Quaternion.FromEulerAngles(self.rotation.x, self.rotation.y, self.rotation.z);
    let ammoQuaternion = new Ammo.btQuaternion();
    ammoQuaternion.setValue(babylonQuaternion.x, babylonQuaternion.y, babylonQuaternion.z, babylonQuaternion.w);
    axis1.setRotation(ammoQuaternion);

    self.joint = new Ammo.btSliderConstraint(self.body.parent.physicsImpostor.physicsBody, self.platform.physicsImpostor.physicsBody, axis1, axis2, true);

    self.joint.setLowerAngLimit(0);
    self.joint.setUpperAngLimit(0);
    self.joint.setLowerLinLimit(0);
    self.joint.setUpperLinLimit(0);

    let physicsWorld = babylon.scene.getPhysicsEngine().getPhysicsPlugin().world;
    physicsWorld.addConstraint(self.joint);

    self.setPosition();
  };

  this.setOptions = function(options) {
    self.options = {
      mass: 100,
      restitution: 0.1,
      friction: 1,
      degreesPerCm: 360,
      width: 2,
      baseLength: 5,
      baseThickness: 1,
      baseColor: 'A39C0D',
      platformLength: 2,
      platformThickness: 1,
      platformColor: '808080',
      max: 10,
      min: -10,
      startPos: 0,
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
    if (self.mode == self.modes.RUN) {
      self.processSpeed(delta);
      self.setPosition();
    } else if (self.mode == self.modes.RUN_TIL_TIME) {
      self.processSpeed(delta);
      self.setPosition();
      if (Date.now() > self.time_target) {
        self.stop();
      }
    } else if (self.mode == self.modes.RUN_TO_POS) {
      self.processSpeed(delta);
      self.setPosition();
      if (
        (self.positionDirectionReversed == false && self.position >= self.position_target) ||
        (self.positionDirectionReversed && self.position <= self.position_target)
      ) {
        self.position = self.position_target;
        self.setPosition();
        self.stop();
      }
    } else if (self.mode == self.modes.STOP) {
      // Don't need to do anything, it always holds
    }

    self.components.forEach(function(component) {
      if (typeof component.render == 'function') {
        component.render(delta);
      }
    });
  };

  this.setPosition = function() {
    let linearPos = (self.position + self.positionAdjustment) / self.options.degreesPerCm;

    self.joint.setLowerLinLimit(linearPos);
    self.joint.setUpperLinLimit(linearPos);
  };

  this.processSpeed = function(delta) {
    let positionDelta = self.speed_sp * delta / 1000;
    if (self.positionDirectionReversed) {
      positionDelta = -positionDelta;
    }
    self.position += positionDelta;

    if ((self.position + self.positionAdjustment) > (self.options.max * self.options.degreesPerCm)) {
      self.position = (self.options.max * self.options.degreesPerCm) - self.positionAdjustment;
    } else if ((self.position + self.positionAdjustment) < (self.options.min * self.options.degreesPerCm)) {
      self.position = (self.options.min * self.options.degreesPerCm) - self.positionAdjustment;
    }
  };

  this.init();
}

// Passive wheel
function WheelPassive(scene, parent, pos, rot, options) {
  var self = this;

  this.parent = parent;

  this.type = 'WheelPassive';
  this.options = null;

  this.components = [];

  this.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);

  this.init = function() {
    self.setOptions(options);

    var wheelMat = scene.getMaterialByID('wheelPassive');
    if (wheelMat == null) {
      var wheelMat = new BABYLON.StandardMaterial('wheelPassive', scene);
      var wheelTexture = new BABYLON.Texture('textures/robot/wheelPassive.png', scene);
      wheelMat.diffuseTexture = wheelTexture;
      wheelMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      wheelMat.freeze();
    }

    var faceUV = new Array(3);
    faceUV[0] = new BABYLON.Vector4(0, 0, 200/828, 1);
    faceUV[1] = new BABYLON.Vector4(200/828, 3/4, 1, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0, 200/828, 1);
    let wheelOptions = {
      height: self.options.width,
      diameter: self.options.diameter,
      tessellation: 24,
      faceUV: faceUV
    };

    self.mesh = BABYLON.MeshBuilder.CreateCylinder('wheelPassive', wheelOptions, scene);
    self.body = self.mesh;
    self.end = self.mesh;
    self.body.component = self;
    self.mesh.material = wheelMat;
    
    self.mesh.parent = parent;
    self.mesh.position = self.position;
    self.mesh.rotation.z = -Math.PI / 2;
    self.mesh.rotate(BABYLON.Axis.Y, rot[1], BABYLON.Space.LOCAL);
    self.mesh.rotate(BABYLON.Axis.X, rot[0], BABYLON.Space.LOCAL);
    self.mesh.rotate(BABYLON.Axis.Z, rot[2], BABYLON.Space.LOCAL);
    parent.removeChild(self.mesh);

    scene.shadowGenerator.addShadowCaster(self.mesh);
  };

  this.loadImpostor = function(){
    self.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.mesh,
      BABYLON.PhysicsImpostor.CylinderImpostor,
      {
        mass: options.mass,
        restitution: options.restitution,
        friction: options.friction
      },
      scene
    );
  };

  this.loadJoints = function(){
    var wheel2world = self.mesh.absoluteRotationQuaternion;
    
    let zero = BABYLON.Vector3.Zero();
    var world2body = parent.absoluteRotationQuaternion;
    world2body = BABYLON.Quaternion.Inverse(world2body);

    var mainPivot = self.mesh.position.subtract(parent.position);
    mainPivot.rotateByQuaternionAroundPointToRef(world2body, zero, mainPivot);

    var mainAxis = new BABYLON.Vector3(0, 1, 0);
    mainAxis.rotateByQuaternionAroundPointToRef(wheel2world, zero, mainAxis);
    mainAxis.rotateByQuaternionAroundPointToRef(world2body, zero, mainAxis);

    self.wheelVector = new BABYLON.Vector3(1,0,0);
    self.bodyVector = new BABYLON.Vector3(0,0,0);
    self.wheelVector.rotateByQuaternionAroundPointToRef(wheel2world, zero, self.bodyVector);
    self.bodyVector.rotateByQuaternionAroundPointToRef(world2body, zero, self.bodyVector);
    self.normalVector = new BABYLON.Vector3(0,1,0)

    self.joint = new BABYLON.HingeJoint({
      mainPivot: mainPivot,
      connectedPivot: new BABYLON.Vector3(0, 0, 0),
      mainAxis: mainAxis,
      connectedAxis: new BABYLON.Vector3(0, 1, 0),
    });
    parent.physicsImpostor.addJoint(self.mesh.physicsImpostor, self.joint);
  };

  this.setOptions = function(options) {
    self.options = {
      diameter: 5.6,
      width: 0.8,
      mass: 200,
      friction: 10,
      restitution: 0.8,
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

  this.init();
}
