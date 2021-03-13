var world_Missions = new function() {
  World_Base.call(this);
  this.parent = {};
  for (p in this) {
    this.parent[p] = this[p];
  }

  var self = this;

  this.name = 'missions';
  this.shortDescription = 'Missions (FLL, WRO, etc)';
  this.longDescription =
    '<p>This world contains various missions.</p>' +
    '<p>Currently, we only have missions based on FLL and WRO, but we welcome contributions of any types of missions.</p>' +
    '<p>Contributed missions should be constructable using just a custom json to be suitable for inclusion here.</p>';
  this.thumbnail = 'images/worlds/fll.jpg';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0), // Overridden by position setting,
    rotation: new BABYLON.Vector3(0, 0, 0)
  };
  this.arenaStart = null;

  this.optionsConfigurations = [
    {
      option: 'image',
      title: 'Select Mission',
      type: 'select',
      options: [
        ['FLL 2020', 'textures/maps/FLL2020.jpg'],
        ['FLL 2019', 'textures/maps/FLL2019.jpg'],
        ['FLL 2018', 'textures/maps/FLL2018.jpg'],
        ['WRO 2020', 'textures/maps/WRO-2020-Regular-Junior.jpg'],
        ['WRO 2019', 'textures/maps/WRO-2019-Regular-Junior.jpg'],
        ['WRO 2018', 'textures/maps/WRO-2018-Regular-Junior.png'],
      ]
    },
    {
      option: 'wall',
      title: 'Wall',
      type: 'checkbox',
      label: 'Wall Present'
    },
    {
      option: 'missions',
      title: 'Missions',
      type: 'checkbox',
      label: 'Mission Objects Present',
      help: '(Currently supports only the FLL 2020 mission)'
    },
    {
      option: 'wallHeight',
      title: 'Wall Height (cm)',
      type: 'slider',
      min: '0',
      max: '30',
      step: '0.1'
    },
    {
      option: 'wallThickness',
      title: 'Wall Thickness (cm)',
      type: 'slider',
      min: '0',
      max: '30',
      step: '0.1'
    },
    {
      option: 'startPos',
      title: 'Starting Position',
      type: 'select',
      options: [
        ['Mission Default', 'missionDefault'],
        ['Center', 'center'],
        ['Bottom Left', 'bottomLeft'],
        ['Bottom Center', 'bottomCenter'],
        ['Bottom Right', 'bottomRight'],
        ['Player 0', 'P0'],
        ['Player 1', 'P1'],
        ['Player 2', 'P2'],
        ['Player 3', 'P3'],
      ]
    },
    {
      option: 'startPosXY',
      title: 'Starting Position (x, y)',
      type: 'text',
      help: 'Enter using this format "x, y" (in cm, without quotes) and it will override the above. Center of image is "0, 0".'
    },
    {
      option: 'startRot',
      title: 'Starting Rotation (degrees)',
      type: 'text',
      help: 'Set the starting rotation in degrees. Positive rotation is clockwise.'
    }
  ];

  // Default starting position for this mission in x, y, z, rotY (radians)
  this.missionStartPos = {
    'textures/maps/FLL2020.jpg': [-70, 0, -40, 0],
  },

  this.missionObjects = {
    'textures/maps/FLL2020.jpg': [
      // Step Counter (M02)
      {
        "position": [40,-53,3.5],
        "size": [30,7,7],
      },
      // Slide (M03)
      {
        "position": [0,-2,5],
        "size": [4,10,10],
        "rotation": [0,50,0],
      },
      // Bench (M04)
      {
        "position": [-67,15,3.5],
        "size": [20,7,7],
        "rotation": [0,-165,0],
      },
      // Basketball (M05)
      {
        "position": [-52,49,10],
        "size": [7,7,20],
        "rotation": [0,-133,0],
      },
      // Pull ups (M06)
      {
        "position": [12,-7,1],
        "size": [5,10,2],
      },
      {
        "position": [15,-10,10],
        "size": [3,3,20],
      },
      {
        "position": [27,-10,18.5],
        "size": [24,3,3],
      },
      {
        "position": [39,-10,10],
        "size": [3,3,20],
      },
      {
        "position": [42,-7,1],
        "size": [5,10,2],
      },
      // Boccia (M08)
      {
        "position": [-32,57,4],
        "size": [20,3,8],
      },
      {
        "position": [-32,60,9.5],
        "size": [10,10,3],
      },
      // Tire Flip (M09)
      {
        "position": [55,-13,1.5],
        "size": [7,7,3],
      },
      {
        "position": [55,0,2.5],
        "size": [10,10,5],
      },
      {
        "position": [42,39,5],
        "size": [5,15,10],
      },
      // Cell Phone (M10)
      {
        "position": [55,48,1],
        "size": [10,5,2],
        "rotation": [0,45,0]
      },
      // Treadmill (M11)
      {
        "position": [105,-41,2.5],
        "size": [10,10,5],
      },
      // Row Machine (M12)
      {
        "position": [108,-8,5],
        "size": [5,5,10],
      },
      {
        "position": [101,-11,1],
        "size": [5,5,2],
      },
      // Weight Machine (M13)
      {
        "position": [103,44,5],
        "size": [20,5,10],
      },
    ]
  }

  this.defaultOptions = Object.assign(this.defaultOptions, {
    image: 'textures/maps/FLL2020.jpg',
    missions: true,
    wallHeight: 7.7,
    wallThickness: 4.5,
    startPos: 'imageDefault',
  });

  // Set options, including default
  this.setOptions = function(options) {
    self.mergeOptionsWithDefault(options);

    if (self.options.startPos == 'imageDefault') {
      let missionStartPos = self.missionStartPos[self.options.image];
      if (typeof missionStartPos != 'undefined') {
        self.robotStart.position = new BABYLON.Vector3(missionStartPos[0], missionStartPos[1], missionStartPos[2]);
        self.robotStart.rotation.y = missionStartPos[3];
      } else {
        self.robotStart.position = new BABYLON.Vector3(0, 0, -6);
      }
    }

    if (self.options.missions && typeof self.missionObjects[self.options.image] != 'undefined') {
      self.options.objects = self.missionObjects[self.options.image];
    }

    return this.parent.setOptions(options);
  };

  // Run on page load
  this.init = function() {
    Object.assign(self.options, self.defaultOptions);
  };
}

// Init class
world_Missions.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Missions);