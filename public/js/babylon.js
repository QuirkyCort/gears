var babylon = new function() {
  var self = this;

  this.world = worlds[0];

  // Run on page load
  this.init = function() {
    self.canvas = document.getElementById('renderCanvas');
    self.engine = new BABYLON.Engine(self.canvas, true);

    self.createScene(); // Call the createScene function

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
    let world = self.world;
    if (self.scene) {
      self.scene.dispose()
    }
    var scene = new BABYLON.Scene(self.engine);
    var gravityVector = new BABYLON.Vector3(0,-98.1, 0);
    // var physicsPlugin = new BABYLON.CannonJSPlugin();
    // var physicsPlugin = new BABYLON.OimoJSPlugin();
    var physicsPlugin = new BABYLON.AmmoJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    // var camera = new BABYLON.UniversalCamera('UniversalCamera', new BABYLON.Vector3(0, 3, -10), scene);
    var camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 5, 200, new BABYLON.Vector3(0, 0, 0), scene);
    camera.wheelPrecision = 5;
    camera.panningSensibility = 100;
    camera.angularSensibilityX = 2000;
    camera.angularSensibilityY = 2000;
    camera.attachControl(self.canvas, true);

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

    // Add meshes in the scene
    // self.engine.displayLoadingUI(); // Turns transparent, but doesn't disappear in some circumstances
    Promise.all([world.load(scene), robot.load(scene, world.robotStart)]).then(function() {
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
      var mat = new BABYLON.StandardMaterial("RTT mat", scene);
      mat.diffuseTexture = robot.components[0].renderTarget;
      mat.emissiveColor = new BABYLON.Color3(1,1,1);
      mat.disableLighting = true;

      var ground = BABYLON.MeshBuilder.CreateGround("RTT", {width: 6, height: 6}, scene);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 20;
      ground.material = mat;

      // Some components in the robot may need to see the fully loaded meshes
      robot.loadMeshes(scene.meshes.filter(mesh => mesh.id != 'RTT'));

      // self.engine.hideLoadingUI();
    });

    // Done
    self.scene = scene;
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
