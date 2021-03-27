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
        ['FLL 2020', 'textures/maps/FLL/FLL2020.jpg'],
        ['FLL 2019', 'textures/maps/FLL/FLL2019.jpg'],
        ['FLL 2018', 'textures/maps/FLL/FLL2018.jpg'],
        ['WRO 2021 (Senior)', 'textures/maps/WRO/WRO-2021-Regular-Senior.jpg'],
        ['WRO 2021 (Junior)', 'textures/maps/WRO/WRO-2021-Regular-Junior.jpg'],
        ['WRO 2021 (Elementary)', 'textures/maps/WRO/WRO-2021-Regular-Elementary.jpg'],
        ['WRO 2020 (Junior)', 'textures/maps/WRO/WRO-2020-Regular-Junior.jpg'],
        ['WRO 2019 (Junior)', 'textures/maps/WRO/WRO-2019-Regular-Junior.jpg'],
        ['WRO 2018 (Junior)', 'textures/maps/WRO/WRO-2018-Regular-Junior.png'],
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
    'textures/maps/FLL/FLL2020.jpg': [-70, 0, -40, 0],
    'textures/maps/WRO/WRO-2021-Regular-Elementary.jpg': [96, 0, 0, -90],
    'textures/maps/WRO/WRO-2021-Regular-Junior.jpg': [-103, 0, -43, 0],
  },

  this.missionObjects = {
    'textures/maps/FLL/FLL2020.jpg': [
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
    ],
    'textures/maps/WRO/WRO-2021-Regular-Elementary.jpg': [
      {
        "type": "box",
        "position": [
          51.17058769987688,
          21.66279126936351,
          1.6000000238418637
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ff0000ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -51.660743713378906,
          26.526363372802734,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffee00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -102.8509292602539,
          -19.87870216369629,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#40b800ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          27.962566375732422,
          28.688684463500977,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffee00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -9.174482345581055,
          21.824817657470703,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ff0000ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          19.719219207763672,
          -21.82147979736328,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ff0000ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -40.052059173583984,
          -31.044109344482422,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffee00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -94.29855184972963,
          -28.34495591010832,
          1.6000000238418521
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#f2f2f2ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -94.4621353149414,
          -36.53963088989258,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#f2f2f2ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -94.47148895263672,
          -45.04072570800781,
          1.600000023841858
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#f2f2f2ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -94.49833850086857,
          -19.834535261899866,
          1.600000023841855
        ],
        "size": [
          3.2,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#40b800ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          3.607983028871244,
          15.414739034053387,
          1.6000000238418566
        ],
        "size": [
          1.6,
          13,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#181cfbff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          3.6670053005218506,
          34.667659759521484,
          1.600000023841858
        ],
        "size": [
          1.6,
          13,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#181cfbff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          96.07976687230217,
          -18.090459612159844,
          1.6000000238418592
        ],
        "size": [
          6.4,
          3.2,
          3.2
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#181cfbff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          95.98451232910156,
          17.7130126953125,
          5
        ],
        "size": [
          8,
          3,
          10
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffee00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      }
    ],
    'textures/maps/WRO/WRO-2021-Regular-Junior.jpg': [
      {
        "type": "box",
        "position": [
          -62.56831741333008,
          -53.10039138793945,
          1.5
        ],
        "size": [
          3.2,
          3.2,
          3
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#009e00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -77.0372085571289,
          -53.142913818359375,
          1.5
        ],
        "size": [
          3.2,
          3.2,
          3
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#009e00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -69.8596420288086,
          -53.1329345703125,
          1.5
        ],
        "size": [
          3.2,
          3.2,
          3
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#009e00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -55.35474395751953,
          -53.11674499511719,
          1.5
        ],
        "size": [
          3.2,
          3.2,
          3
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#009e00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          36.53451156616211,
          -6.5136260986328125,
          2.5
        ],
        "size": [
          14.4,
          1.6,
          5
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffdd00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          95.9614028930664,
          40.8598747253418,
          2.5
        ],
        "size": [
          14.4,
          1.6,
          5
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffdd00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -10.407035827636719,
          -5.980367660522461,
          5
        ],
        "size": [
          3.2,
          3.2,
          10
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffffffff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          21.985145568847656,
          -41.86970138549805,
          5
        ],
        "size": [
          3.2,
          3.2,
          10
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffffffff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          21.78584861755371,
          41.45398712158203,
          5
        ],
        "size": [
          3.2,
          3.2,
          10
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ffffffff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -66.17134857177734,
          49.34359359741211,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ff0000ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -66.2055892944336,
          -5.787518501281738,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ff0000ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          66.13060760498047,
          47.181697845458984,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#ff0000ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -66.36726379394531,
          38.27432632446289,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#009e00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -66.09493255615234,
          27.190025329589844,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#009e00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          7.186825752258301,
          -0.1575072705745697,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#009e00ff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -66.14459228515625,
          16.15580177307129,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#1100ffff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          -66.28013610839844,
          5.074806213378906,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#1100ffff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      },
      {
        "type": "box",
        "position": [
          36.93013000488281,
          -47.75556564331055,
          2
        ],
        "size": [
          3.2,
          8,
          4
        ],
        "rotationMode": "degrees",
        "rotation": [
          0,
          0,
          0
        ],
        "color": "#1100ffff",
        "imageType": "repeat",
        "imageURL": "",
        "uScale": 1,
        "vScale": 1,
        "physicsOptions": "moveable",
        "magnetic": false,
        "laserDetection": null,
        "ultrasonicDetection": null
      }
    ],
  }

  this.defaultOptions = Object.assign(this.defaultOptions, {
    image: 'textures/maps/FLL/FLL2020.jpg',
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
        self.robotStart.rotation.y = missionStartPos[3] / 180 * Math.PI;
      } else {
        self.robotStart.position = new BABYLON.Vector3(0, 0, -6);
      }
    }

    if (self.options.missions && typeof self.missionObjects[self.options.image] != 'undefined') {
      self.options.objects = self.missionObjects[self.options.image];
    } else {
      self.options.objects = {};
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