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
      resolve();
    });
  };
}

// Init class
world_Configurator.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Configurator);