var babylon = new function() {
  var self = this;

  this.world = worlds[0];

  // Run on page load
  this.init = function() {
    self.canvas = document.getElementById('renderCanvas');
    self.engine = new BABYLON.Engine(self.canvas, true);

    self.scene = self.createScene(); // Call the createScene function
    // self.scene.debugLayer.show();

    self.world.setOptions().then(function(){
      self.loadMeshes(self.scene);
    });

    // Register a render loop to repeatedly render the scene
    self.engine.runRenderLoop(function () {
      self.scene.render();
    });

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
    cameraArc.panningAxis = new BABYLON.Vector3(1, 1, 0);
    cameraArc.wheelPrecision = 3;
    cameraArc.panningSensibility = 100;
    cameraArc.angularSensibilityX = 2000;
    cameraArc.angularSensibilityY = 2000;
    cameraArc.attachControl(self.canvas, true);
    self.cameraArc = cameraArc;
    self.setCameraMode('follow');

    // Add lights to the scene
    var lightHemi = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
    lightHemi.groundColor = new BABYLON.Color3(0.1, 0.2, 0.1);
    lightHemi.intensity = 0.5;

    var lightDir = new BABYLON.DirectionalLight('DirectionalLight', new BABYLON.Vector3(-1, -1, -1), scene);
    // lightDir.diffuse = new BABYLON.Color3(0.1, 1.2, 0.1);
    lightDir.position.y = 100;
    lightDir.position.x = 200;
    lightDir.intensity = 0.8;

    // Shadows
    scene.shadowGenerator = new BABYLON.ShadowGenerator(512, lightDir);
    // scene.shadowGenerator.bias = 0.00005;
    // scene.shadowGenerator.depthScale = 50;
    // scene._shadowsEnabled = false;

    return scene;
  };

  // Set camera mode
  this.setCameraMode = function(mode) {
    if (typeof mode != 'undefined') {
      self.cameraMode = mode;
    }

    if (self.cameraMode == 'follow') {
      self.cameraArc.lockedTarget = robot.body;
      self.cameraArc._panningMouseButton = 1;

    } else if (self.cameraMode == 'orthoTop') {
      self.cameraArc.lockedTarget = null;
      self.cameraArc.alpha = -Math.PI / 2;
      self.cameraArc.beta = 0;
      self.cameraArc._panningMouseButton = 0; // change functionality from left to right mouse button

    } else if (self.cameraMode == 'arc') {
      // self.cameraArc.lockedTarget = new BABYLON.Vector3(0, 0, 0);
      // self.cameraArc.alpha = -Math.PI / 2;
      // self.cameraArc.beta = Math.PI / 5;
      self.cameraArc.lockedTarget = null;
      self.cameraArc._panningMouseButton = 1;
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

    self.engine.stopRenderLoop(self.engine._activeRenderLoops[0]);
    self.scene.dispose();

    self.scene = self.createScene();
    // self.scene.debugLayer.show();

    // Restore camera
    self.setCameraMode(mode);
    self.cameraArc.position = pos;
    self.cameraArc.absoluteRotation = rot;
    self.cameraArc.upVector = up;
    self.cameraArc.target = target;

    self.loadMeshes(self.scene);
    self.engine.runRenderLoop(function () {
      self.scene.render();
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
    let loader = [];
    loader.push(self.world.load(self.scene));
    robots.forEach(function(robot){
      if (robot.player == 'single') {
        loader.push(robot.load(self.scene, self.world.robotStart));
      } else {
        if (robot.disabled == true) {
          return;
        }
        loader.push(robot.load(self.scene, self.world.robotStarts[robot.player]));
      }
    });

    Promise.all(loader).then(function() {
      self.setCameraMode(); // Set after loading mesh as camera may be locked to mesh

      // RTT test
      // var mat = new BABYLON.StandardMaterial("RTT mat", self.scene);
      // mat.diffuseTexture = robot.getComponentByPort('in5').renderTarget;
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
        robot.loadMeshes(self.scene.meshes.filter(mesh => mesh.id != 'RTT'));
      })

      // We should also pre-build the RTT materials for performance
      let FULL_EMMISSIVE = new BABYLON.Color3(1,1,1);

      self.scene.meshes.forEach(function(mesh) {
        mesh.origMaterial = mesh.material;
        if (mesh.material == null) {
          mesh.rttMaterial == null;
        } else {
          mesh.rttMaterial = mesh.material.clone();
          mesh.rttMaterial.disableLighting = true;
          if (mesh.diffuseTexture) {
            mesh.rttMaterial.emissiveColor = FULL_EMMISSIVE;
          } else {
            mesh.rttMaterial.emissiveColor = mesh.rttMaterial.diffuseColor;
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

  // Render loop
  this.render = function() {
    var delta = self.scene.getEngine().getDeltaTime();

    robots.forEach(function(robot){
      if (robot.disabled == true) {
        return;
      }
      robot.render(delta);
    });

    if (self.world.render) {
      self.world.render(delta);
    }
  };
}

// Init class
babylon.init();
