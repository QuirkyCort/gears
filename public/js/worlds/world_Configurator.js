var world_Configurator = new function() {
  var self = this;

  this.name = 'configurator';
  this.shortDescription = 'Configurator Map';
  this.longDescription =
    '<p>Used by robot configurator.</p>';
  // this.thumbnail = null;

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0,0,0),
    rotation: new BABYLON.Vector3(0,0,0)
  };

  this.optionsConfigurations = [];

  this.defaultOptions = {};

  // Set options, including default
  this.setOptions = function(options) {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      let size = 100;
      var groundMat = new BABYLON.StandardMaterial('ground', scene);
      var groundTexture = new BABYLON.Texture('textures/maps/configurator.png', scene);
      groundMat.diffuseTexture = groundTexture;
      groundMat.diffuseTexture.uScale = size / 20;
      groundMat.diffuseTexture.vScale = size / 20;
      groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      var faceUV = new BABYLON.Vector4(0, 0, 1, 1);

      var planeOptions = {
          size: size,
          frontUVs: faceUV
      };

      self.ground = BABYLON.MeshBuilder.CreatePlane('plane', planeOptions, scene);
      self.ground.material = groundMat;
      self.ground.rotation.x = Math.PI / 2;

      resolve();
    });
  };

  // hide ground if camera is below it
  this.render = function() {
    if (babylon.cameraArc.position.y < 0) {
      self.ground.isPickable = false;
    } else {
      self.ground.isPickable = true;
    }
  }
}

// Init class
world_Configurator.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Configurator);