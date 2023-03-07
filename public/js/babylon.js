var babylon = new function() {
  var self = this;

  this.DISABLE_ASYNC = true;
  this.ENABLE_ANTIALIASING = false;
  // this.ENABLE_ANTIALIASING = true;

  this.world = worlds[0];

  // Run on page load
  this.init = function() {
    self.canvas = document.getElementById('renderCanvas');
    self.engine = new BABYLON.Engine(self.canvas, self.ENABLE_ANTIALIASING);

    self.scene = self.createScene(); // Call the createScene function

    self.world.setOptions().then(function(){
      self.loadMeshes(self.scene);
    });

    // Register a render loop to repeatedly render the scene
    // self.engine.runRenderLoop(function () {
    //   self.scene.render();
    // });

    // Watch for browser/canvas resize events
    window.addEventListener('resize', function () {
      self.engine.resize();
    });

  };

  // Create the scene
  this.createScene = function () {
    if (self.scene) {
      self.scene.dispose()
    }
    var scene = new BABYLON.Scene(self.engine);
    var gravityVector = new BABYLON.Vector3(0,-98.1, 0);
    // var physicsPlugin = new BABYLON.CannonJSPlugin();
    // var physicsPlugin = new BABYLON.OimoJSPlugin();
    var physicsPlugin = new BABYLON.AmmoJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    var cameraArc = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 5, 200, new BABYLON.Vector3(0, 0, 0), scene);
    cameraArc.attachControl(self.canvas, true);
    self.cameraArc = cameraArc;
    self.resetCamera();
    self.setCameraMode('follow');

    // Controls for Orthographic camera
    scene.onPointerObservable.add(self.zoomOrtho, BABYLON.PointerEventTypes.POINTERWHEEL);

    // Add GUI layer
    if (typeof BABYLON.GUI != 'undefined') {
      self.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    }

    // Add lights to the scene
    var lightHemi = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
    lightHemi.groundColor = new BABYLON.Color3(0.1, 0.2, 0.1);
    lightHemi.intensity = 0.5;

    var lightDir = new BABYLON.DirectionalLight('DirectionalLight', new BABYLON.Vector3(-1, -1, -1), scene);
    // lightDir.diffuse = new BABYLON.Color3(0.1, 1.2, 0.1);
    lightDir.position.y = 100;
    lightDir.position.x = 400;
    lightDir.position.z = 400;
    lightDir.intensity = 0.8;
    lightDir.autoCalcShadowZBounds = true;

    // Shadows
    scene.shadowGenerator = new BABYLON.ShadowGenerator(512, lightDir);
    scene.shadowGenerator.forceBackFacesOnly = true;
    // scene.shadowGenerator.bias = 0.00005;
    // scene.shadowGenerator.depthScale = 5000;
    // scene._shadowsEnabled = false;

    // Optimizer
    var options = new BABYLON.SceneOptimizerOptions(80, 2000); // 60fps, check every 2000ms
    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 2));
    self.optimizer = new BABYLON.SceneOptimizer(scene, options);
    self.optimizer.onNewOptimizationAppliedObservable.add(function (optim) {
      console.log(optim.getDescription());
    });

    // Debugging
    // scene.debugLayer.show();

    return scene;
  };

  // Set othographic camera zoom
  this.zoomOrtho = function(p) {
    if (self.cameraMode != 'orthoTop') {
      return;
    }

    let wheelDelta = 0;
    if (typeof p != 'undefined') {
      var event = p.event;
      if (event.wheelDelta) {
          wheelDelta = event.wheelDelta;
      } else {
          wheelDelta = -(event.deltaY || event.detail) * 60;
      }
    }

    self.cameraArc.orthoRadius -= wheelDelta / 12;

    let zoomScale = self.cameraArc.orthoRadius / 2.5;
    let aspectRatio = self.canvas.width / self.canvas.height;
    self.cameraArc.orthoTop = 1 * zoomScale;
    self.cameraArc.orthoBottom = -1 * zoomScale;
    self.cameraArc.orthoLeft = -aspectRatio * zoomScale;
    self.cameraArc.orthoRight = aspectRatio * zoomScale;
  };

  // Set camera to default
  this.resetCamera = function() {
    self.cameraArc.alpha = -Math.PI / 2;
    self.cameraArc.beta = Math.PI / 5;
    self.cameraArc.radius = 200;
    self.cameraArc.origAlpha = -Math.PI / 2;
    self.cameraArc.origBeta = Math.PI / 5;
    self.cameraArc.panningAxis = new BABYLON.Vector3(1, 1, 0);
    self.cameraArc.wheelPrecision = 3;
    self.cameraArc.lowerRadiusLimit = 10;
    self.cameraArc.panningSensibility = 100;
    self.cameraArc.angularSensibility = 2000;
    self.cameraArc.angularSensibilityX = self.cameraArc.angularSensibility;
    self.cameraArc.angularSensibilityY = self.cameraArc.angularSensibility;
  };

  // Set camera mode
  this.setCameraMode = function(mode) {
    if (typeof mode != 'undefined') {
      self.cameraMode = mode;
    }

    if (self.cameraMode == 'follow') {
      if (self.cameraArc.origAlpha !== null) {
        self.cameraArc.alpha = self.cameraArc.origAlpha;
      }
      if (self.cameraArc.origBeta !== null) {
        self.cameraArc.beta = self.cameraArc.origBeta;
      }
      self.cameraArc.origAlpha = null;
      self.cameraArc.origBeta = null;
      self.cameraArc.lockedTarget = robot.body;
      self.cameraArc._panningMouseButton = 1;
      babylon.cameraArc.mode = BABYLON.Camera.PERSPECTIVE_CAMERA
      self.cameraArc.inputs.attached.keyboard.attachControl();
      self.cameraArc.angularSensibilityX = self.cameraArc.angularSensibility;
      self.cameraArc.angularSensibilityY = self.cameraArc.angularSensibility;
    } else if (self.cameraMode == 'orthoTop') {
      self.cameraArc.origAlpha = self.cameraArc.alpha;
      self.cameraArc.origBeta = self.cameraArc.beta;
      let target = self.cameraArc.getTarget().clone();
      self.cameraArc.lockedTarget = null;
      self.cameraArc.setTarget(target);
      self.cameraArc.alpha = -Math.PI / 2;
      self.cameraArc.beta = 0;
      self.cameraArc._panningMouseButton = 0; // change functionality from left to right mouse button
      self.cameraArc.orthoRadius = self.cameraArc.radius;
      self.cameraArc.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
      self.zoomOrtho();
      self.cameraArc.inputs.attached.keyboard.detachControl();
      self.cameraArc.angularSensibilityX = 10000000;
      self.cameraArc.angularSensibilityY = 10000000;
    } else if (self.cameraMode == 'arc') {
      if (self.cameraArc.origAlpha !== null) {
        self.cameraArc.alpha = self.cameraArc.origAlpha;
      }
      if (self.cameraArc.origBeta !== null) {
        self.cameraArc.beta = self.cameraArc.origBeta;
      }
      self.cameraArc.origAlpha = null;
      self.cameraArc.origBeta = null;
      let target = self.cameraArc.getTarget().clone();
      self.cameraArc.lockedTarget = null;
      self.cameraArc.setTarget(target);
      self.cameraArc._panningMouseButton = 1;
      babylon.cameraArc.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
      self.cameraArc.inputs.attached.keyboard.attachControl();
      self.cameraArc.angularSensibilityX = self.cameraArc.angularSensibility;
      self.cameraArc.angularSensibilityY = self.cameraArc.angularSensibility;
    }
  }

  // Reset scene
  this.resetScene = function() {
    // Save camera position and rotations
    let pos = self.cameraArc.position;
    let target = self.cameraArc.target;
    let rot = self.cameraArc.absoluteRotation;
    let up = self.cameraArc.upVector;
    let mode = self.cameraMode;

    self.engine.stopRenderLoop();
    self.scene.dispose();

    self.scene = self.createScene();

    if (
      typeof main == 'undefined'
      || main.$navs.siblings('.active').attr('id') == 'navSim'
      || main.$navs.siblings('.active').attr('id') == 'navArena'
    ) {
      self.engine.runRenderLoop(function () {
        self.scene.render();
      });
    }

    return self.loadMeshes(self.scene).then(function(){
      // Restore camera
      self.setCameraMode(mode);
      self.cameraArc.position = pos;
      self.cameraArc.absoluteRotation = rot;
      self.cameraArc.upVector = up;
      self.cameraArc.target = target;
      self.cameraArc.origAlpha = null;
      self.cameraArc.origBeta = null;
    });
  };

  // Remove all RTT cameras
  this.removeRTTCameras = function() {
    for (let i=self.scene.cameras.length-1; i>0; i--) {
      self.scene.cameras[i].dispose();
    }
  };

  // Remove all meshes
  this.removeMeshes = function() {
    self.scene.actionManager.actions = [];
    self.scene.actionManager.dispose();

    for (let i=self.scene.meshes.length-1; i>=0; i--) {
      self.scene.meshes[i].dispose(false, true);
    }
  };

  // Load meshes
  this.loadMeshes = function() {
    // self.engine.displayLoadingUI(); // Turns transparent, but doesn't disappear in some circumstances

    // Load ruler markers
    let markerOptions = {
      height: 4,
      diameterTop: 2,
      diameterBottom: 0.01,
      tessellation: 3
    };

    let greenMat = self.getMaterial(self.scene, '00ff00');
    self.marker1 = new BABYLON.MeshBuilder.CreateCylinder('marker1', markerOptions, self.scene);
    self.marker1.material = greenMat;
    self.marker1.isPickable = false;
    self.marker1.isVisible = false;

    let redMat = self.getMaterial(self.scene, 'ff0000');
    self.marker2 = new BABYLON.MeshBuilder.CreateCylinder('marker2', markerOptions, self.scene);
    self.marker2.material = redMat;
    self.marker2.isPickable = false;
    self.marker2.isVisible = false;

    // Load world and robot
    let loader = [];
    loader.push(self.world.load(self.scene));
    robots.forEach(function(robot){
      if (robot.player == 'single') {
        loader.push(robot.load(self.scene, self.world.robotStart));
      } else {
        if (robot.disabled == true) {
          return;
        }
        loader.push(robot.load(self.scene, self.world.arenaStart[robot.player]));
      }
    });

    return Promise.all(loader).then(function() {
      self.setCameraMode(); // Set after loading mesh as camera may be locked to mesh

      // RTT test
      // var mat = new BABYLON.StandardMaterial("RTT mat", self.scene);
      // mat.diffuseTexture = robot.getComponentByPort('in1').renderTarget;
      // mat.emissiveColor = new BABYLON.Color3(1,1,1);
      // mat.disableLighting = true;

      // var ground = BABYLON.MeshBuilder.CreateGround("RTT", {width: 10, height: 10}, self.scene);
      // ground.rotation.x = -Math.PI / 2;
      // ground.position.y = 20;
      // ground.material = mat;

      // Some components in the robot may need to see the fully loaded meshes
      robots.forEach(function(robot){
        if (robot.disabled == true) {
          return;
        }
        robot.loadMeshes(self.scene.meshes.filter(mesh => mesh.id != 'RTT' && mesh.id != 'marker1' && mesh.id != 'marker2'));
      })

      // We should also pre-build the RTT materials for performance
      let FULL_EMMISSIVE = new BABYLON.Color3(1,1,1);

      self.scene.meshes.forEach(function(mesh) {
        mesh.origMaterial = mesh.material;
        if (mesh.material == null) {
          if (mesh.visibility) {
            console.log('WARNING: ' + mesh.id + ' does not have a material');
          }
          mesh.rttMaterial == null;
        } else {
          let rttID = 'RTT_' + mesh.material.id;
          let mat = self.scene.getMaterialByID(rttID);
          if (mat == null) {
            mesh.rttMaterial = mesh.material.clone();
            mesh.rttMaterial.id = rttID;
            mesh.rttMaterial.disableLighting = true;
            if (mesh.rttMaterial.diffuseTexture) {
              mesh.rttMaterial.emissiveColor = FULL_EMMISSIVE;
            } else if (mesh.rttMaterial.albedoColor) {
              mesh.rttMaterial.emissiveColor = mesh.rttMaterial.albedoColor;
            } else {
              mesh.rttMaterial.emissiveColor = mesh.rttMaterial.diffuseColor;
            }
            mesh.rttMaterial.freeze();
          } else {
            mesh.rttMaterial = mat;
          }
        }
      });

      // Reset the world if needed
      if (self.world.reset) {
        self.world.reset();
      }

      self.scene.actionManager = new BABYLON.ActionManager(self.scene);
      self.scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction({
            trigger: BABYLON.ActionManager.OnEveryFrameTrigger
          },
          self.render
        )
      );

      // self.engine.hideLoadingUI();
    });
  };

  // Get color3 from hex
  this.hexToColor3 = function(rgba) {
    rgba = rgba.replace(/^#/g, '');
    let color = '#';

    if (rgba.length == 3 || rgba.length == 4) {
      color += rgba[0] + rgba[0];
      color += rgba[1] + rgba[1];
      color += rgba[2] + rgba[2];
    } else if (rgba.length == 6 || rgba.length == 8) {
      color += rgba[0] + rgba[1];
      color += rgba[2] + rgba[3];
      color += rgba[4] + rgba[5];
    }

    return new BABYLON.Color3.FromHexString(color);
  };

  // Get material from rgba string, creating new if not existing
  this.getMaterial = function(scene, rgba) {
    rgba = rgba.replace(/^#/g, '');
    let color = new Array(4);

    let existing = scene.getMaterialByID(rgba);
    if (existing) {
      return existing;
    }

    let mat = new BABYLON.StandardMaterial(rgba, scene);

    mat.diffuseColor = self.hexToColor3(rgba);

    if (rgba.length == 4) {
      color[3] = parseInt(rgba[3]+rgba[3], 16) / 255;
    } else if (rgba.length == 8) {
      color[3] = parseInt(rgba[6]+rgba[7], 16) / 255;
    } else {
      color[3] = 1;
    }

    mat.alpha = color[3];
    mat.freeze();

    return mat;
  };

  // Change material for a mesh, including handling for rtt material
  this.setMaterial = function(mesh, material) {
    mesh.material = material;
    mesh.isFrozen = false;

    let rttID = 'RTT_' + mesh.material.id;
    let mat = self.scene.getMaterialByID(rttID);
    if (mat == null) {
      mesh.rttMaterial = mesh.material.clone();
      mesh.rttMaterial.id = rttID;
      mesh.rttMaterial.disableLighting = true;
      if (mesh.rttMaterial.diffuseTexture) {
        mesh.rttMaterial.emissiveColor = FULL_EMMISSIVE;
      } else if (mesh.rttMaterial.albedoColor) {
        mesh.rttMaterial.emissiveColor = mesh.rttMaterial.albedoColor;
      } else {
        mesh.rttMaterial.emissiveColor = mesh.rttMaterial.diffuseColor;
      }
      mesh.rttMaterial.freeze();
    } else {
      mesh.rttMaterial = mat;
    }

    delete mesh._rtt_subMeshEffects;
  };

  // List of render functions to call
  this.renders = [];

  // Render loop
  this.render = function() {
    var delta = self.scene.getEngine().getDeltaTime();

    if (typeof simPanel != 'undefined' && simPanel.showFPS) {
      simPanel.$fps.text(self.engine.getFps().toFixed() + " fps");
    }
    if (typeof arenaPanel != 'undefined' && arenaPanel.showFPS) {
      arenaPanel.$fps.text(self.engine.getFps().toFixed() + " fps");
    }

    robots.forEach(function(robot){
      if (robot.disabled == true) {
        return;
      }
      robot.render(delta);
    });

    if (self.world.render) {
      self.world.render(delta);
    }

    self.renders.forEach(function(render){
      render(delta);
    });
  };
}

// Init class
// babylon.init();

window.addEventListener("DOMContentLoaded", function() {
  var config = {
    locateFile: () => 'ammo/ammo-20210414.wasm.wasm'
  }
  Ammo(config).then(babylon.init);
});

// window.addEventListener("DOMContentLoaded", function() {
//   Ammo().then(babylon.init);
// });


