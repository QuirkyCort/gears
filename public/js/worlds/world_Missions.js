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
    '<p>Contributed missions should be constructed using json only (ie. no javascript) to be suitable for inclusion here.</p>';
  this.thumbnail = 'images/worlds/missions.jpg';

  this.optionsConfigurations = [
    {
      option: 'jsonFile',
      title: 'Select Mission',
      type: 'select',
      options: [
        ['2022 FLL (Superpowered)', 'worlds/missions/FLL/FLL2022.json?v=8d10813a'],
        ['2022 WRO (Elementary)', 'worlds/missions/WRO/WRO-2022-Regular-Elementary-1.json?v=a2936cb0'],
        ['2022 WRO (Elementary) Randomization 2', 'worlds/missions/WRO/WRO-2022-Regular-Elementary-2.json?v=cc4e3604'],
        ['2022 WRO (Junior)', 'worlds/missions/WRO/WRO-2022-Regular-Junior.json?v=d3b135ba'],
        ['2022 WRO (Senior)', 'worlds/missions/WRO/WRO-2022-Regular-Senior.json?v=b6e40d9d'],
        ['2021 FLL (Cargo Connect)', 'worlds/missions/FLL/FLL2021.json?v=b31b8262'],
        ['2021 WRO (Elementary)', 'worlds/missions/WRO/WRO-2021-Regular-Elementary.json?v=45448002'],
        ['2021 WRO (Junior)', 'worlds/missions/WRO/WRO-2021-Regular-Junior.json?v=151e42f8'],
        ['2021 WRO (Senior)', 'worlds/missions/WRO/WRO-2021-Regular-Senior.json?v=b2fed43c'],
        ['2020 FLL (RePLAY v2)', 'worlds/missions/FLL/FLL2020v2.json?v=83106bf2'],
        ['2020 FLL (RePLAY)', 'worlds/missions/FLL/FLL2020.json?v=eeac2988'],
        ['2020 WRO (Elementary)', 'worlds/missions/WRO/WRO-2020-Regular-Elementary.json?v=136a82cb'],
        ['2020 WRO (Junior)', 'worlds/missions/WRO/WRO-2020-Regular-Junior.json?v=6f98672b'],
        ['2019 FLL (City Shaper)', 'worlds/missions/FLL/FLL2019.json?v=36e51441'],
        ['2019 WRO (Elementary)', 'worlds/missions/WRO/WRO-2019-Regular-Elementary.json?v=a22f9c7b'],
        ['2019 WRO (Junior)', 'worlds/missions/WRO/WRO-2019-Regular-Junior.json?v=deccceee'],
        ['2018 FLL (Into Orbit)', 'worlds/missions/FLL/FLL2018.json?v=55341767'],
        ['2018 WRO (Elementary)', 'worlds/missions/WRO/WRO-2018-Regular-Elementary.json?v=111cdfb9'],
        ['2018 WRO (Junior)', 'worlds/missions/WRO/WRO-2018-Regular-Junior.json?v=54491949'],
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
      help: 'Mission objects are only available for some missions.'
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
    jsonFile: this.optionsConfigurations[0].options[0][1],
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
        if (options.startPos != 'missionDefault') {
          self.options.startPosXYZ = null;
          self.options.startRot = null;
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