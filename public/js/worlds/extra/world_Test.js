var world_Test = new function() {
  World_Base.call(this);
  this.parent = {};
  for (p in this) {
    this.parent[p] = this[p];
  }

  var self = this;

  this.name = 'test';
  this.shortDescription = 'Test World';
  this.longDescription =
    '<p>A test world mainly for testing physics.</p>' +
    '<p>The small blue squares are magnetic, and can be picked up using the robot magnet.</p>';

  this.optionsConfigurations = [
    {
      option: 'startPos',
      title: 'Starting Position',
      type: 'select',
      options: [
        ['18 degrees ramp', 'ramp18'],
        ['36 degrees ramp', 'ramp36'],
        ['45 degrees ramp', 'ramp45'],
        ['18 degrees low friction ramp', 'ramp18LowFriction'],
        ['Static humps', 'staticHumps'],
        ['Kinematic humps', 'kinematicHumps'],
        ['Box (weight 800)', 'box800'],
        ['Box (weight 1600)', 'box1600'],
        ['Tower', 'tower'],
        ['Wall', 'wall'],
        ['Magnetic Items', 'magnet']
      ]
    },
    {
      option: 'startPosXYZStr',
      title: 'Starting Position (x, y, z)',
      type: 'text',
      help: 'Enter using this format "x, y, z" (in cm, without quotes) and it will override the above. Center of image is "0, 0, 0".'
    }
  ];

  this.defaultOptions = Object.assign(this.defaultOptions, {
    imageURL: 'textures/maps/grid.png',
    imageScale: '2.353',
    length: 400,
    width: 400,
    uScale: 20,
    vScale: 20,
    wallHeight: 10,
    wallThickness: 5,
    wallColor: 'B3B3B3',
    startPos: 'ramp18',
    objects: [

      // Ramps
      {
        "type": "box",
        "position":[0,20,-5],
        "size": [30, 20, 40],
        "rotation": [72,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[35,20,-5],
        "size": [30, 20, 40],
        "rotation": [54,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[70,20,-5],
        "size": [30, 20, 40],
        "rotation": [45,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[105,20,-5],
        "size": [30, 20, 40],
        "rotation": [72,0,0],
        "color": "#A3A333",
        "physicsOptions": {
          mass: 0,
          friction: 0.01,
          restitution: 0.1
        }
      },

      // Bumps
      {
        "type": "box",
        "position":[140,15,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,20,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,25,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,30,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,40,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,46,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,50,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,55,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,70,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,5.7,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,80,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,-5.7,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,90,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,11.5,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[140,100,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,-11.5,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },

      // Boxes for pushing
      {
        "type": "box",
        "position":[-70,20,4],
        "size": [8, 8, 8],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 800,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-105,20,4],
        "size": [8, 8, 8],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 1600,
          friction: 0.8,
          restitution: 0.1
        }
      },

      // Tower
      {
        "type": "box",
        "position":[-140,40,4],
        "size": [8, 8, 8],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-140,40,12],
        "size": [8, 8, 8],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-140,40,20],
        "size": [8, 8, 8],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-140,40,28],
        "size": [8, 8, 8],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-140,40,36],
        "size": [8, 8, 8],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },

      // Wall
      {
        "type": "box",
        "position":[-180,40,5],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-180,40,15],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-180,40,25],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-170,40,5],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-170,40,15],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-170,40,25],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-180,-40,5],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-180,-40,15],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-180,-40,25],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-170,-40,5],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-170,-40,15],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-170,-40,25],
        "size": [10, 10, 10],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 200,
          friction: 0.8,
          restitution: 0.1
        }
      },

      // Bumps
      {
        "type": "box",
        "position":[-35,15,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,20,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,25,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,30,0.5],
        "size": [30, 1, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,40,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,46,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,50,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,55,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,0,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,70,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,5.7,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,80,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,-5.7,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,90,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,11.5,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },
      {
        "type": "box",
        "position":[-35,100,0.5],
        "size": [30, 1.5, 1],
        "rotation": [0,-11.5,0],
        "color": "#A333A3",
        "physicsOptions": {
          mass: 100,
          friction: 0.8,
          restitution: 0.1
        }
      },

      // Magnetic blocks
      {
        "type": "box",
        "position": [0, -80, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [30, -119, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [27, -118, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [27, -128, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [32, -125, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },

      // Wall around magnetic blocks
      {
        "type": "box",
        "position":[0,-150,1.5],
        "size": [30, 1, 3],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[0,-180,1.5],
        "size": [30, 1, 3],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[-15,-165,1.5],
        "size": [1, 30, 3],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[15,-165,1.5],
        "size": [1, 30, 3],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position": [-3, -157, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [5, -160, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [0, -170, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [-9, -165, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [7, -171, 0],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },

      // Tower for magnetic blocks
      {
        "type": "box",
        "position":[-50,-150,6],
        "size": [30, 1, 12],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[-50,-180,6],
        "size": [30, 1, 12],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[-65,-165,6],
        "size": [1, 30, 12],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[-35,-165,6],
        "size": [1, 30, 12],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },
      {
        "type": "box",
        "position":[-50,-165,6],
        "size": [30, 30, 11],
        "rotation": [0,0,0],
        "color": "#A3A333",
        "physicsOptions": "fixed"
      },

      // magnetics on tower
      {
        "type": "box",
        "position": [-51, -155, 13],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [-48, -167, 13],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
      {
        "type": "box",
        "position": [-53, -165, 13],
        "size": [2, 2, 0.5],
        "rotation": [0,0,0],
        "color": "#0000CC",
        "physicsOptions": "moveable",
        "magnetic": true
      },
    ]
  });

  // Set options, including default
  this.setOptions = function(options) {
    self.mergeOptionsWithDefault(options);

    if (self.options.startPos == 'ramp18') {
      self.robotStart.position = new BABYLON.Vector3(0, 0, -6);
    } else if (self.options.startPos == 'ramp36') {
      self.robotStart.position = new BABYLON.Vector3(35, 0, -6);
    } else if (self.options.startPos == 'ramp45') {
      self.robotStart.position = new BABYLON.Vector3(70, 0, -6);
    } else if (self.options.startPos == 'ramp18LowFriction') {
      self.robotStart.position = new BABYLON.Vector3(105, 0, -6);
    } else if (self.options.startPos == 'staticHumps') {
      self.robotStart.position = new BABYLON.Vector3(140, 0, -6);
    } else if (self.options.startPos == 'kinematicHumps') {
      self.robotStart.position = new BABYLON.Vector3(-35, 0, -6);
    } else if (self.options.startPos == 'box800') {
      self.robotStart.position = new BABYLON.Vector3(-70, 0, -6);
    } else if (self.options.startPos == 'box1600') {
      self.robotStart.position = new BABYLON.Vector3(-105, 0, -6);
    } else if (self.options.startPos == 'tower') {
      self.robotStart.position = new BABYLON.Vector3(-140, 0, -6);
    } else if (self.options.startPos == 'wall') {
      self.robotStart.position = new BABYLON.Vector3(-175, 0, -6);
    } else if (self.options.startPos == 'magnet') {
      self.robotStart.position = new BABYLON.Vector3(0, 0, -110);
    }

    return this.parent.setOptions(options);
  };

  // Run on page load
  this.init = function() {
    Object.assign(self.options, self.defaultOptions);
  };

}

// Init class
world_Test.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Test);