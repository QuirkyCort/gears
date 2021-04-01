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
    '<p>Currently, we only have missions based on First Lego League (FLL) and World Robot Olympiad (WRO), but we welcome contributions of any types of missions.</p>' +
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
      option: 'jsonFile',
      title: 'Select Mission',
      type: 'select',
      options: [
        ['2021 WRO (Elementary)', 'worlds/missions/WRO/WRO-2021-Regular-Elementary.json'],
        ['2021 WRO (Junior)', 'worlds/missions/WRO/WRO-2021-Regular-Junior.json'],
        ['2021 WRO (Senior)', 'worlds/missions/WRO/WRO-2021-Regular-Senior.json'],
        ['2020 FLL (RePLAY)', 'worlds/missions/FLL/FLL2020.json'],
        ['2020 WRO (Junior)', 'worlds/missions/WRO/WRO-2020-Regular-Junior.json'],
        ['2019 FLL (City Shaper)', 'worlds/missions/FLL/FLL2019.json'],
        ['2019 WRO (Junior)', 'worlds/missions/WRO/WRO-2019-Regular-Junior.json'],
        ['2018 FLL (Into Orbit)', 'worlds/missions/FLL/FLL2018.json'],
        ['2018 WRO (Junior)', 'worlds/missions/WRO/WRO-2018-Regular-Junior.json'],
      ]
    },
    {
      option: 'wall',
      title: 'Wall',
      type: 'checkbox',
      label: 'Wall Present'
    },
    {
      option: 'showTimer',
      title: 'Timer',
      type: 'checkbox',
      label: 'Show Timer'
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
      option: 'startPosXYZStr',
      title: 'Starting Position (x, y)',
      type: 'text',
      help: 'Enter using this format "x, y" (in cm, without quotes) and it will override the above. Center of image is "0, 0".'
    },
    {
      option: 'startRotStr',
      title: 'Starting Rotation (degrees)',
      type: 'text',
      help: 'Set the starting rotation in degrees. Positive rotation is clockwise.'
    }
  ];

  this.defaultOptions = Object.assign(this.defaultOptions, {
    jsonFile: 'worlds/missions/WRO/WRO-2021-Regular-Elementary.json',
    showTimer: true,
    missions: true,
    wallHeight: 7.7,
    wallThickness: 4.5,
    startPos: 'missionDefault',
  });

  // Set options, including default
  this.setOptions = function(options) {
    return fetch(options.jsonFile)
      .then(response => response.json())
      .then(function(data){
        self.options = {...self.defaultOptions};
        Object.assign(self.options, data.options);
        Object.assign(self.options, options);

        if (options.showTimer != true) {
          self.options.timer = 'none';
        }
        if (options.missions != true) {
          self.options.objects = {};
        }

        return self.parent.setOptions();
      });
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