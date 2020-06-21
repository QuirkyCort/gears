var babylon = new function() {
  var self = this;

  this.world = worlds[0];

  // Run on page load
  this.init = function() {
    self.canvas = document.getElementById('renderCanvas');
    self.engine = new BABYLON.Engine(self.canvas, true);

    self.scene = self.createScene(); // Call the createScene function
    self.loadMeshes(self.scene);

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
    cameraArc.wheelPrecision = 5;
    cameraArc.panningSensibility = 100;
    cameraArc.angularSensibilityX = 2000;
    cameraArc.angularSensibilityY = 2000;
    cameraArc.attachControl(self.canvas, true);
    self.cameraArc = cameraArc;
    self.setCameraMode('arc');

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
      self.cameraArc.lockedTarget = null;
      self.cameraArc.alpha = -Math.PI / 2;
      self.cameraArc.beta = Math.PI / 5;
      self.cameraArc._panningMouseButton = 1;
    }
  }

  // Remove all meshes
  this.removeMeshes = function(scene) {
    scene.actionManager.actions = [];
    scene.actionManager.dispose();

    for (let i=scene.meshes.length-1; i>=0; i--) {
      scene.meshes[i].dispose(false, true);
    }
  };

  // Load meshes
  this.loadMeshes = function(scene) {
    // self.engine.displayLoadingUI(); // Turns transparent, but doesn't disappear in some circumstances
    Promise.all([self.world.load(scene), robot.load(scene, self.world.robotStart)]).then(function() {
      self.setCameraMode();
      // Debug physics
      // pv = new BABYLON.PhysicsViewer(scene);
      // scene.meshes.forEach(function(mesh){
      //   if (mesh.physicsImpostor) {
      //     pv.showImpostor(mesh.physicsImpostor);
      //   }
      // });

      scene.actionManager = new BABYLON.ActionManager(scene);
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction({
            trigger: BABYLON.ActionManager.OnEveryFrameTrigger
          },
          self.render
        )
      );

      // RTT test
      // var mat = new BABYLON.StandardMaterial("RTT mat", scene);
      // mat.diffuseTexture = robot.components[0].renderTarget;
      // mat.emissiveColor = new BABYLON.Color3(1,1,1);
      // mat.disableLighting = true;

      // var ground = BABYLON.MeshBuilder.CreateGround("RTT", {width: 10, height: 10}, scene);
      // ground.rotation.x = -Math.PI / 2;
      // ground.position.y = 20;
      // ground.material = mat;

      // Some components in the robot may need to see the fully loaded meshes
      robot.loadMeshes(scene.meshes.filter(mesh => mesh.id != 'RTT'));

      // self.engine.hideLoadingUI();
    });
  };

  // Render loop
  this.render = function() {
    var delta = self.scene.getEngine().getDeltaTime();

    // console.log(1000/delta);

    robot.render(delta);
  };
}

// Init class
babylon.init();
