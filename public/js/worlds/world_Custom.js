var world_Custom = new function() {
  World_Base.call(this);
  this.parent = {};
  for (p in this) {
    this.parent[p] = this[p];
  }

  var self = this;

  this.name = 'custom';
  this.shortDescription = 'Custom world';
  this.longDescription =
    '<p>This world is automatically generated from the provided image.</p>' +
    '<p>There are many more options available through editing of the JSON file. Please read the wiki for more details.</p>';

  this.optionsConfigurations = [
    {
      option: 'imageURL',
      title: 'Image URL',
      type: 'text',
      help: 'URL for ground image. Will not work with most webhosts; Imgur will work.'
    },
    {
      option: 'imageFile',
      title: 'Upload Image',
      type: 'file',
      accept: 'image/*',
      help: 'This will override both "Image URL". Will not work if map configuration is saved to a file. You must upload it manually everytime.'
    },
    {
      option: 'groundType',
      title: 'Ground Type',
      type: 'select',
      options: [
        ['Box', 'box'],
        ['Cylinder', 'cylinder'],
        ['None', 'none']
      ],
      help: 'Walls only work with a Box ground. If None is selected, there will be no ground! This is only useful if a custom object is added to act as the ground.'
    },
    {
      option: 'timer',
      title: 'Display Timer',
      type: 'select',
      options: [
        ['None', 'none'],
        ['Count up from 0', 'up'],
        ['Count down from duration', 'down']
      ]
    },
    {
      option: 'timerDuration',
      title: 'Timer Duration (s)',
      type: 'slider',
      min: '0',
      max: '300',
      step: '1'
    },
    {
      option: 'timerEnd',
      title: 'At Timer End',
      type: 'select',
      options: [
        ['Continue running', 'continue'],
        ['Stop the timer only', 'stopTimer'],
        ['Stop the timer and robot', 'stopRobot']
      ],
      help: 'What will happend when timer ends.'
    },
    {
      option: 'imageScale',
      title: 'Image Scale Factor',
      type: 'float',
      help: 'Scales the image (eg. when set to 2, each pixel will equal 2mm). Default to 1.'
    },
    {
      option: 'wall',
      title: 'Wall',
      type: 'checkbox',
      label: 'Wall Present'
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
      title: 'Starting Position (x, y, z)',
      type: 'text',
      help: 'Enter using this format "x, y, z" (in cm, without quotes) and it will override the above. Center of image is "0, 0, 0".'
    },
    {
      option: 'startRotStr',
      title: 'Starting Rotation (degrees)',
      type: 'text',
      help: 'Set the starting rotation in degrees. Positive rotation is clockwise.'
    }
  ];

  this.defaultOptions = Object.assign(this.defaultOptions, {
    imageURL: 'textures/maps/custom.png',
  });

  this.setOptions = function(options) {
    self.mergeOptionsWithDefault(options);

    return this.parent.setOptions(options);
  };

  // Run on page load
  this.init = function() {
    Object.assign(self.options, self.defaultOptions);
  };
}

// Init class
world_Custom.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Custom);