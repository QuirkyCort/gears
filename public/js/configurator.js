var configurator = new function() {
  var self = this;

  this.savedRobot = null;

  this.bodyTemplate = {
    defaultConfig: {
      bodyHeight: 4,
      bodyWidth: 14,
      bodyLength: 16,
      wheels: true,
      wheelDiameter: 5.6,
      wheelWidth: 0.8,
      wheelToBodyOffset: 0.2,
      bodyEdgeToWheelCenterY: 1,
      bodyEdgeToWheelCenterZ: 2,
      caster: true,
      casterDiameter: 0,
      bodyMass: 1000,
      wheelMass: 200,
      casterMass: 0,
      wheelFriction: 10,
      bodyFriction: 0,
      casterFriction: 0,
      casterOffsetZ: 0,
      color: '#F09C0D'
    },
    optionsConfigurations: [
      {
        option: 'bodyHeight',
        type: 'slider',
        min: '1',
        max: '20',
        step: '0.5',
        reset: true
      },
      {
        option: 'bodyWidth',
        type: 'slider',
        min: '1',
        max: '20',
        step: '0.5',
        reset: true
      },
      {
        option: 'bodyLength',
        type: 'slider',
        min: '1',
        max: '30',
        step: '0.5',
        reset: true
      },
      {
        option: 'wheels',
        type: 'boolean',
        reset: true
      },
      {
        option: 'wheelDiameter',
        type: 'slider',
        min: '1',
        max: '10',
        step: '0.1',
        reset: true
      },
      {
        option: 'wheelWidth',
        type: 'slider',
        min: '0.2',
        max: '4',
        step: '0.1',
        reset: true
      },
      {
        option: 'wheelToBodyOffset',
        type: 'slider',
        min: '0.1',
        max: '2',
        step: '0.1',
        reset: true
      },
      {
        option: 'bodyEdgeToWheelCenterY',
        type: 'slider',
        min: '0.1',
        max: '5',
        step: '0.1',
        reset: true
      },
      {
        option: 'bodyEdgeToWheelCenterZ',
        type: 'slider',
        min: '0.1',
        max: '20',
        step: '0.1',
        reset: true
      },
      {
        option: 'caster',
        type: 'boolean',
        reset: true
      },
      {
        option: 'casterDiameter',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Set to 0 to use wheel diameter'
      },
      {
        option: 'casterOffsetZ',
        type: 'slider',
        min: '0',
        max: '20',
        step: '0.5',
        reset: true,
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageType',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Repeat on every face', 'repeat'],
          ['Only on top face', 'top'],
          ['Only on front face', 'front'],
          ['Map across all faces', 'all']
        ],
        reset: true
      },
      {
        option: 'imageURL',
        type: 'selectImage',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for robot body image. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'bodyMass',
        type: 'floatText',
      }
    ]
  };

  this.componentTemplates = [
    {
      name: 'Box',
      category: 'Blocks',
      defaultConfig: {
        type: 'Box',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          height: 1,
          width: 1,
          depth: 1,
          color: 'A3CF0D',
          imageType: 'repeat',
          imageURL: '',
          uScale: 1,
          vScale: 1
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'height',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'width',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'depth',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'color',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'imageType',
          type: 'select',
          options: [
            ['None', 'none'],
            ['Repeat on every face', 'repeat'],
            ['Only on top face', 'top'],
            ['Only on front face', 'front'],
            ['Map across all faces', 'all']
          ],
          reset: true
        },
        {
          option: 'imageURL',
          type: 'selectImage',
          reset: true
        },
        {
          option: 'imageURL',
          type: 'strText',
          reset: true,
          help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
        },  
      ]
    },
    {
      name: 'Cylinder',
      category: 'Blocks',
      defaultConfig: {
        type: 'Cylinder',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          height: 1,
          diameter: 1,
          color: 'A3CF0D',
          imageType: 'cylinder',
          imageURL: '',
          uScale: 1,
          vScale: 1
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'height',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'diameter',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'color',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'imageURL',
          type: 'selectImage',
          reset: true
        },
        {
          option: 'imageURL',
          type: 'strText',
          reset: true,
          help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
        },
      ]
    },
    {
      name: 'Sphere',
      category: 'Blocks',
      defaultConfig: {
        type: 'Sphere',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          diameter: 1,
          color: 'A3CF0D',
          imageType: 'sphere',
          imageURL: '',
          uScale: 1,
          vScale: 1
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'diameter',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'color',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'imageURL',
          type: 'selectImage',
          reset: true
        },
        {
          option: 'imageURL',
          type: 'strText',
          reset: true,
          help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
        },  
      ]
    },
    {
      name: 'ColorSensor',
      category: 'Sensors',
      defaultConfig: {
        type: 'ColorSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'sensorMinRange',
          type: 'floatText',
          help: 'Anything nearer than this will not be detected. Leave blank to use default.'
        },
        {
          option: 'sensorMaxRange',
          type: 'floatText',
          help: 'Anything further than this will not be detected. Leave blank to use default.'
        },
        {
          option: 'sensorFov',
          type: 'floatText',
          help: 'Field of View in radians. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'UltrasonicSensor',
      category: 'Sensors',
      defaultConfig: {
        type: 'UltrasonicSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'rayLength',
          type: 'floatText',
          help: 'Anything further than this will not be detected. Leave blank to use default.'
        },
        {
          option: 'rayIncidentLimit',
          type: 'floatText',
          help: 'Ignore object if angle of incident (radian) is greater than this. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'LaserRangeSensor',
      category: 'Sensors',
      defaultConfig: {
        type: 'LaserRangeSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'rayLength',
          type: 'floatText',
          help: 'Anything further than this will not be detected. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'TouchSensor',
      category: 'Sensors',
      defaultConfig: {
        type: 'TouchSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          width: 2,
          depth: 2,
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'width',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'depth',
          type: 'slider',
          min: '1',
          max: '20',
          step: '1',
          reset: true
        },
      ]
    },
    {
      name: 'GyroSensor',
      category: 'Sensors',
      defaultConfig: {
        type: 'GyroSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
      ]
    },
    {
      name: 'GPSSensor',
      category: 'Sensors',
      defaultConfig: {
        type: 'GPSSensor',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
      ]
    },
    {
      name: 'MagnetActuator',
      category: 'Actuators',
      defaultConfig: {
        type: 'MagnetActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'maxRange',
          type: 'floatText',
          help: 'Anything further than this will not be attracted. Leave blank to use default.'
        },
        {
          option: 'maxPower',
          type: 'floatText',
          help: 'Maximum attraction force. Actual will be lower due to distance falloff. Leave blank to use default.'
        },
        {
          option: 'dGain',
          type: 'floatText',
          help: 'Positive gain used to reduce wobbling of objects being attracted. Leave blank to use default of none (0).'
        }
      ]
    },
    {
      name: 'ArmActuator',
      category: 'Actuators',
      defaultConfig: {
        type: 'ArmActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        components: [],
        options: {
          armLength: 18,
          minAngle: -5,
          maxAngle: 180,
          mass: 100,
          startAngle: 0,
          baseColor: 'A39C0D',
          pivotColor: '808080',
          armColor: 'A3CF0D',
          imageType: 'repeat',
          imageURL: '',
          uScale: 1,
          vScale: 1,
          restitution: 0.4,
          friction: 0.1
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'armLength',
          type: 'floatText',
          help: 'Length of arm in cm. Leave blank to use default.',
          reset: true
        },
        {
          option: 'baseColor',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'pivotColor',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'armColor',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'imageType',
          type: 'select',
          options: [
            ['None', 'none'],
            ['Repeat on every face', 'repeat'],
            ['Only on top face', 'top'],
            ['Only on front face', 'front'],
            ['Map across all faces', 'all']
          ],
          reset: true
        },
        {
          option: 'imageURL',
          type: 'selectImage',
          reset: true
        },
        {
          option: 'imageURL',
          type: 'strText',
          reset: true,
          help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
        },
        {
          option: 'minAngle',
          type: 'floatText',
          help: 'Lowest possible angle for arm. Leave blank to use default.'
        },
        {
          option: 'maxAngle',
          type: 'floatText',
          help: 'Highest possible angle for arm. Leave blank to use default.'
        },
        {
          option: 'mass',
          type: 'floatText',
          help: 'If chaining actuators, it\'s recommended to reduce mass of child actuators'
        },
        {
          option: 'startAngle',
          type: 'floatText',
          reset: true
        },
        {
          option: 'friction',
          type: 'slider',
          min: '0',
          max: '1',
          step: '0.05',
          help: 'This will also apply to all child objects'
        },
      ]
    },
    {
      name: 'SwivelActuator',
      category: 'Actuators',
      defaultConfig: {
        type: 'SwivelActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        components: [],
        options: {
          mass: 100,
          baseColor: 'A39C0D',
          platformColor: '808080',
          width: 3,
          restitution: 0.4,
          friction: 0.1
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'baseColor',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'platformColor',
          type: 'color',
          help: 'Color in hex',
          reset: true
        },
        {
          option: 'width',
          type: 'slider',
          min: '1',
          max: '20',
          step: '0.5',
          reset: true,
          help: 'Width of the base'
        },
        {
          option: 'mass',
          type: 'floatText',
          help: 'If chaining actuators, it\'s recommended to reduce mass of child actuators'
        },
        {
          option: 'friction',
          type: 'slider',
          min: '0',
          max: '1',
          step: '0.05',
          help: 'This will also apply to all child objects'
        },
      ]
    },
    {
      name: 'LinearActuator',
      category: 'Actuators',
      defaultConfig: {
        type: 'LinearActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        components: [],
        options: {
          mass: 100,
          restitution: 0.1,
          friction: 1,
          degreesPerCm: 360,
          width: 2,
          baseColor: 'A39C0D',
          baseLength: 5,
          baseThickness: 1,
          platformLength: 2,
          platformThickness: 1,
          platformColor: '808080',
          max: 10,
          min: -10,
          startPos: 0,
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'mass',
          type: 'floatText',
          help: 'If chaining actuators, it\'s recommended to reduce mass of child actuators'
        },
        {
          option: 'degreesPerCm',
          type: 'floatText',
          help: 'The degrees of rotation required to produce one cm of linear movement'
        },
        {
          option: 'baseColor',
          type: 'color',
          reset: true
        },
        {
          option: 'width',
          type: 'slider',
          min: '0',
          max: '5',
          step: '0.1',
          reset: true,
          help: 'Width of both the base and moving platform'
        },
        {
          option: 'baseLength',
          type: 'slider',
          min: '1',
          max: '20',
          step: '0.5',
          reset: true,
          help: 'Length of the base'
        },
        {
          option: 'baseThickness',
          type: 'slider',
          min: '0',
          max: '5',
          step: '0.1',
          reset: true,
        },
        {
          option: 'platformColor',
          type: 'color',
          reset: true
        },
        {
          option: 'platformLength',
          type: 'slider',
          min: '0',
          max: '5',
          step: '0.1',
          reset: true,
        },
        {
          option: 'platformThickness',
          type: 'slider',
          min: '0',
          max: '5',
          step: '0.1',
          reset: true,
        },
        {
          option: 'startPos',
          type: 'slider',
          min: '-10',
          max: '10',
          step: '0.5',
          reset: true,
          help: 'Starting position of the moving platform'
        },
        {
          option: 'max',
          type: 'floatText',
          help: 'Max position'
        },
        {
          option: 'min',
          type: 'floatText',
          help: 'Min position'
        },
        {
          option: 'friction',
          type: 'slider',
          min: '0',
          max: '1',
          step: '0.05',
          help: 'This will also apply to all child objects'
        },
      ]
    },
    {
      name: 'PaintballLauncherActuator',
      category: 'Actuators',
      defaultConfig: {
        type: 'PaintballLauncherActuator',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: null
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'drawBackLimit',
          type: 'floatText',
          help: 'The limit that you can pull back the spring in degrees. Leave blank to use default.'
        },
        {
          option: 'powerScale',
          type: 'floatText',
          help: 'This is multiplied by the spring drawback to determine the initial velocity of the paintball. Leave blank to use default.'
        },
        {
          option: 'maxSpeed',
          type: 'floatText',
          help: 'Maximum rotation speed of the motor. NOT the maximum speed of the paintball. Leave blank to use default.'
        },
        {
          option: 'color',
          type: 'intText',
          help: 'Color of the paintball. From 0 to 5, they are Cyan, Green, Yellow, Red, Magenta, Blue. Leave blank to use default.'
        },
        {
          option: 'ttl',
          type: 'intText',
          help: 'Time-To-Live in milliseconds. After this duration, the paintball will be removed. Leave blank to use default.'
        },
        {
          option: 'ammo',
          type: 'intText',
          help: 'Amount of ammo available to the launcher at start. Set to "-1" for unlimited ammo. Leave blank to use default.'
        },
        {
          option: 'splatterTTL',
          type: 'intText',
          help: 'Time-To-Live in milliseconds for the paint splatter. After this duration, the paint splatter will be removed. Set a negative number to last forever. Leave blank to use default.'
        },
      ]
    },
    {
      name: 'WheelActuator',
      category: 'Actuators',
      defaultConfig: {
        type: 'WheelActuator',
        position: [0, 2.8, 0],
        rotation: [0, 0, 0],
        components: [],
        options: {
          diameter: 5.6,
          width: 0.8,
          mass: 200,
          friction: 10,
          restitution: 0.8
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'diameter',
          type: 'slider',
          min: '1',
          max: '10',
          step: '0.1',
          reset: true
        },
        {
          option: 'width',
          type: 'slider',
          min: '0.2',
          max: '4',
          step: '0.1',
          reset: true
        },
        {
          option: 'mass',
          type: 'floatText',
        },
        {
          option: 'friction',
          type: 'slider',
          min: '0',
          max: '10',
          step: '0.1',
        },
        {
          option: 'restitution',
          type: 'slider',
          min: '0',
          max: '1',
          step: '0.05',
        },        
      ]
    },
    {
      name: 'WheelPassive',
      category: 'Others',
      defaultConfig: {
        type: 'WheelPassive',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        components: [],
        options: {
          diameter: 5.6,
          width: 0.8,
          mass: 200,
          friction: 10,
          restitution: 0.8
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'rotation',
          type: 'vectors',
          min: '-180',
          max: '180',
          step: '5',
          deg2rad: true,
          reset: true
        },
        {
          option: 'diameter',
          type: 'slider',
          min: '1',
          max: '10',
          step: '0.1',
          reset: true
        },
        {
          option: 'width',
          type: 'slider',
          min: '0.2',
          max: '4',
          step: '0.1',
          reset: true
        },
        {
          option: 'mass',
          type: 'floatText',
        },
        {
          option: 'friction',
          type: 'slider',
          min: '0',
          max: '10',
          step: '0.1',
        },
        {
          option: 'restitution',
          type: 'slider',
          min: '0',
          max: '1',
          step: '0.05',
        },        
      ]
    },
    {
      name: 'Pen',
      category: 'Others',
      defaultConfig: {
        type: 'Pen',
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        options: {
          doubleSided: false
        }
      },
      optionsConfigurations: [
        {
          option: 'position',
          type: 'vectors',
          min: '-20',
          max: '20',
          step: '1',
          reset: true
        },
        {
          option: 'doubleSided',
          type: 'boolean',
          help: 'If true, the drawn trace will be visible from both sides.'
        }
      ]
    },
  ];

  this.pointerDragPlaneNormal = new BABYLON.Vector3(0,1,0);

  // Run on page load
  this.init = function() {
    if (typeof babylon.scene == 'undefined') {
      setTimeout(self.init, 500);
      return;
    }

    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$fileMenu = $('.fileMenu');
    self.$robotMenu = $('.robotMenu');
    self.$snapMenu = $('.snapMenu');

    self.$robotName = $('#robotName');

    self.$addComponent = $('.addComponent');
    self.$deleteComponent = $('.deleteComponent');
    self.$componentList = $('.componentsList');
    self.$settingsArea = $('.settingsArea');
    self.$undo = $('.undo');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);
    self.$robotMenu.click(self.toggleRobotMenu);
    self.$snapMenu.click(self.toggleSnapMenu);

    self.$addComponent.click(self.addComponent);
    self.$deleteComponent.click(self.deleteComponent);
    self.$undo.click(self.undo);

    self.$robotName.change(self.setRobotName);

    babylon.scene.physicsEnabled = false;
    babylon.setCameraMode('arc')
    babylon.renders.push(self.render);

    self.saveHistory();
    self.resetScene();
    self.saveRobotOptions();
  };

  // Apply pointerDragBehavior to selected mesh
  this.applyDragToSelected = function() {
    let selected = self.$componentList.find('li.selected');
    if (selected.length < 1) {
      return;
    }

    let index = selected[0].componentIndex;
    if (typeof index != 'undefined') {
      let dragBody = robot.getComponentByIndex(index).body;
      let dragBodyPos;

      if (dragBody.getBehaviorByName('PointerDrag')) {
        return;
      }

      let selected = self.$componentList.find('li.selected');
      if (typeof selected[0].component == 'undefined') {
        return;
      }

      function notClose(a, b) {
        if (Math.abs(a - b) > 0.01) {
          return true;
        }
        return false;
      }

      // Object drag start
      function dragStart(event) {
        dragBodyPos = dragBody.position.clone();
      }

      // Object drag
      function drag(event) {
        let delta = event.delta;
        
        if (dragBody.parent) {
          let matrix = dragBody.parent.getWorldMatrix().clone().invert();
          matrix.setTranslation(BABYLON.Vector3.Zero());
          delta = BABYLON.Vector3.TransformCoordinates(delta, matrix);  
        }

        dragBodyPos.addInPlace(delta);

        if (notClose(selected[0].component.position[0], dragBodyPos.x)) {
          dragBody.position.x = self.roundToSnap(dragBodyPos.x, self.snapStep[0]);
        }
        if (notClose(selected[0].component.position[1], dragBodyPos.y)) {
          dragBody.position.y = self.roundToSnap(dragBodyPos.y, self.snapStep[2]);
        }
        if (notClose(selected[0].component.position[2], dragBodyPos.z)) {
          dragBody.position.z = self.roundToSnap(dragBodyPos.z, self.snapStep[1]);
        }
      }

      // Object drag end
      function dragEnd(event) {
        self.saveHistory();
        let pos = dragBody.position;

        if (dragBody.parent == null && typeof dragBody.component.parent != 'undefined') {
          pos = pos.subtract(dragBody.component.parent.absolutePosition);
        }

        if (notClose(selected[0].component.position[0], pos.x)) {
          selected[0].component.position[0] = self.roundToSnap(pos.x, self.snapStep[0]);
        }
        if (notClose(selected[0].component.position[1], pos.y)) {
          selected[0].component.position[1] = self.roundToSnap(pos.y, self.snapStep[2]);
        }
        if (notClose(selected[0].component.position[2], pos.z)) {
          selected[0].component.position[2] = self.roundToSnap(pos.z, self.snapStep[1]);
        }
        self.resetScene(false);
      };

      let pointerDragBehavior = new BABYLON.PointerDragBehavior({dragPlaneNormal: self.pointerDragPlaneNormal});
      pointerDragBehavior.useObjectOrientationForDragging = false;
      pointerDragBehavior.moveAttached = false;

      pointerDragBehavior.onDragStartObservable.add(dragStart);
      pointerDragBehavior.onDragObservable.add(drag);
      pointerDragBehavior.onDragEndObservable.add(dragEnd);

      dragBody.isPickable = true;
      dragBody.addBehavior(pointerDragBehavior);
    }
  };
  
  // Runs every frame
  this.render = function(delta) {
    let camera = babylon.scene.activeCamera;
    let dir = camera.getTarget().subtract(camera.position);
    let x2 = dir.x ** 2;
    let y2 = dir.y ** 2;
    let z2 = dir.z ** 2;
    let max = Math.max(x2, y2, z2);

    self.pointerDragPlaneNormal.x = 0;
    self.pointerDragPlaneNormal.y = 0;
    self.pointerDragPlaneNormal.z = 0;
    if (x2 == max) {
      self.pointerDragPlaneNormal.x = 1;
    } else if (y2 == max) {
      self.pointerDragPlaneNormal.y = 1;
    } else {
      self.pointerDragPlaneNormal.z = 1;
    }

    if (self.wireframe && typeof self.wireframe.body != 'undefined') {
      self.wireframe.body.computeWorldMatrix(true);
    }
  }

  // Save history
  this.saveHistory = function() {
    if (typeof self.editHistory == 'undefined') {
      self.editHistory = [];
    }

    self.editHistory.push(JSON.stringify(robot.options));
  };

  // Clear history
  this.clearHistory = function() {
    if (typeof self.editHistory != 'undefined') {
      self.editHistory = [];
    }
  };

  // Undo
  this.undo = function() {
    if (typeof self.editHistory != 'undefined' && self.editHistory.length > 0) {
      var lastDesign = self.editHistory.pop();
      robot.options = JSON.parse(lastDesign);
      self.resetScene();
    }
  };

  // Save robot options
  this.saveRobotOptions = function() {
    self.savedRobot = JSON.parse(JSON.stringify(robot.options));
  };

  // Load robot options
  this.loadRobotOptions = function() {
    robot.options = JSON.parse(JSON.stringify(self.savedRobot));
    self.resetScene();
  };

  // Set the robot name
  this.setRobotName = function() {
    robot.options.name = self.$robotName.val();
  };

  // Show options
  this.showComponentOptions = function(component) {
    self.$settingsArea.empty();

    let genConfig = new GenConfig(self, self.$settingsArea);

    if (typeof component.options == 'undefined' || component.options == null) {
      component.options = {};
    }

    if (typeof component.bodyMass != 'undefined') { // main body
      genConfig.displayOptionsConfigurations(self.bodyTemplate, component);
    } else {
      let componentTemplate = self.componentTemplates.find(componentTemplate => componentTemplate.name == component.type);
      componentTemplate.optionsConfigurations.forEach(function(optionConfiguration){
        let options = component.options;
        if (optionConfiguration.option == 'position' || optionConfiguration.option == 'rotation') {
          options = component;
        }
        if (typeof genConfig.gen[optionConfiguration.type] != 'undefined') {
          self.$settingsArea.append(genConfig.gen[optionConfiguration.type](optionConfiguration, options));
        } else {
          console.log('Unrecognized configuration type');
        }
      });
    }
    if (component.type == 'Pen') {
      self.penSpecialCaseSetup(component);
    }
  };

  // Select built in images
  this.selectImage = function(opt, objectOptions) {
    let $body = $('<div class="selectImage"></div>');
    let $filter = $(
      '<div class="filter">Filter by Type: ' +
        '<select>' +
          '<option selected value="any">Any</option>' +
          '<option value="box">Box</option>' +
          '<option value="cylinder">Cylinder</option>' +
          '<option value="sphere">Sphere</option>' +
          '<option value="ground">Ground</option>' +
          '<option value="robot">Robot</option>' +
        '</select>' +
      '</div>'
    );
    let $select = $filter.find('select');
    let $imageList = $('<div class="images"></div>');

    BUILT_IN_IMAGES.forEach(function(image){
      let basename = image.url.split('/').pop();

      let $row = $('<div class="row"></div>');
      $row.addClass(image.type);

      let $descriptionBox = $('<div class="description"></div>');
      let $basename = $('<p class="bold"></p>').text(basename + ' (' + image.type + ')');
      let $description = $('<p></p>').text(image.description);
      $descriptionBox.append($basename);
      $descriptionBox.append($description);

      let $selectBox = $('<div class="select"><button>Select</button></div>');
      let $select = $selectBox.find('button');
      $select.prop('url', image.url);

      $select.click(function(e){
        objectOptions.imageURL = e.target.url;
        self.resetScene(false);
        $dialog.close();
      });

      $row.append($descriptionBox);
      $row.append($selectBox);
      $imageList.append($row);
    });

    $body.append($filter);
    $body.append($imageList);

    $select.change(function(){
      let filter = $select.val();

      $imageList.find('.row').removeClass('hide');
      if (filter != 'any') {
        $imageList.find(':not(.row.' + filter + ')').addClass('hide');
      }
    });

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>'
    );

    let $dialog = dialog('Select Built-In Image', $body, $buttons);

    $buttons.click(function() { $dialog.close(); });
  };

  // Special case for the pen, add some buttons to move it to useful locations
  this.penSpecialCaseSetup = function(component) {

    function moveTo(x,z) {
      let $posDiv = self.$settingsArea.find("div.configurationTitle:contains('position')")
      // Get the input boxes for x/y/z so value changes can be made visible
      let $inputX = $posDiv.next().find('input[type=text]');
      let $inputY = $posDiv.next().next().find('input[type=text]');
      let $inputZ = $posDiv.next().next().next().find('input[type=text]');
      // change only X and Z vals, Y is height from ground
      self.saveHistory();
      $inputX.val(x)
      component.position[0]=x
      $inputZ.val(z)
      component.position[2]=z
      self.resetScene(false);
    };

    let $centerWheelAxisBtn = $('<div class="btn_pen">Center On Wheel Axis</div>');
    $centerWheelAxisBtn.click(function(){
      // move the pen to the center of the wheel axis
      wheelAxisCenter = robot.leftWheel.mesh.position.add(robot.rightWheel.mesh.position).scale(1/2.0)
      moveTo(wheelAxisCenter.x, wheelAxisCenter.z)
    });
    let $centerWheelBtn = $('<div class="btn_pen">Center On Wheel</div>');
    let nextWheelCenter = 'L';
    $centerWheelBtn.click(function(){
      // move the pen to the center of a wheel.
      // Alternate between L and R wheels (and castor?)
      if (nextWheelCenter == 'L') {
        nextWheelCenter = 'R';
        wheelCenter = robot.leftWheel.mesh.position;
      } else {
        nextWheelCenter = 'L';
        wheelCenter = robot.rightWheel.mesh.position;
      }
      moveTo(wheelCenter.x, wheelCenter.z)
    });
    let $centerCSBtn = $('<div class="btn_pen">Center On Color Sensor</div>');
    let nextColorSensor = 0;
    $centerCSBtn.click(function(){
      // Move the pen to the center of the color sensor.  If there is more
      // than one color sensor, move to the next one
      var colorSensors = []
      for (c of robot.components) {
        if (c.type == "ColorSensor") {
          colorSensors.push(c);
        }
      }
      if (colorSensors.length <= 0) {
        return;
      }
      csPos = colorSensors[nextColorSensor].position
      nextColorSensor++;
      if (nextColorSensor >= colorSensors.length) {
        nextColorSensor = 0;
      }
      moveTo(csPos.x, csPos.z)
    });

    let $btndiv = $('<div class="buttons"></div>')
    $btndiv.append($centerWheelAxisBtn);
    $btndiv.append($centerWheelBtn);
    $btndiv.append($centerCSBtn);
    self.$settingsArea.append($btndiv)
  }

  // Setup picking ray
  this.setupPickingRay = function() {
    babylon.scene.onPointerUp = function(e, hit) {
      if (e.button != 0) {
        return;
      }

      if (hit.pickedMesh != null) {
        function getComponent(mesh) {
          if (typeof mesh.component != 'undefined') {
            return mesh.component;
          } else if (mesh.parent != null) {
            return getComponent(mesh.parent);
          } else if (mesh.id == 'body') {
            return true;
          } else {
            return null;
          }
        }

        let $components = self.$componentList.find('li');

        let component = getComponent(hit.pickedMesh);
        if (component) {
          $components.removeClass('selected');
          let $target = self.$componentList.find('li[componentIndex=' + component.componentIndex + ']');
          if ($target.length > 0) {
            $target.addClass('selected');
            self.showComponentOptions($target[0].component);  
          } else {
            $($components[0]).addClass('selected');
            self.showComponentOptions($components[0].component);
          }
  
          self.highlightSelected();
          self.applyDragToSelected();
        }
      }
    }
  };

  // Reset scene
  this.resetScene = function(reloadComponents=true) {
    if (typeof self.cameraRadius == 'undefined') {
      self.cameraRadius = 40;
    } else {
      self.cameraRadius = babylon.scene.cameras[0].radius;
    }
    babylon.resetScene();
    babylon.scene.physicsEnabled = false;
    self.setupPickingRay();
    babylon.scene.cameras[0].radius = self.cameraRadius;
    if (reloadComponents) {
      self.$robotName.val(robot.options.name);
      self.loadIntoComponentsWindow(robot.options);
      self.showComponentOptions(robot.options);
    }
    let $target = self.$componentList.find('li.selected');
    self.showComponentOptions($target[0].component);
    self.highlightSelected();
    self.applyDragToSelected();
  }

  // Add a new component to selected
  this.addComponent = function() {
    let $selected = self.getSelectedComponent();
    let COMPATIBLE_TYPES = ['ArmActuator', 'SwivelActuator', 'LinearActuator', 'WheelActuator', 'WheelPassive'];
    if (
      $selected.text() != 'Body'
      && COMPATIBLE_TYPES.indexOf($selected[0].component.type) == -1
    ) {
      toastMsg('Components can only be added to Body and Actuators.');
      return;
    }

    let $body = $('<div class="selectComponent"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><div class="text"></div></div>');

    let groups = [];
    self.componentTemplates.forEach(function(componentTemplate){
      if (groups.indexOf(componentTemplate.category) == -1) {
        groups.push(componentTemplate.category);
      }
    });

    groups.forEach(function(group){
      let $group = $('<optgroup label="' + group + '"></optgroup>');
      self.componentTemplates.forEach(function(componentTemplate){
        if (componentTemplate.category != group) {
          return;
        }
        let $component = $('<option></option>');
        $component.prop('value', componentTemplate.name);
        $component.text(componentTemplate.name);
        $group.append($component);
      });
      $select.append($group);
    });

    $body.append($select);
    $body.append($description);

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>' +
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog('Select Component', $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      self.saveHistory();
      let component = self.componentTemplates.find(componentTemplate => componentTemplate.name == $select.val())
      if (typeof $selected[0].component.components == 'undefined') {
        $selected[0].component.components = [];
      }
      $selected[0].component.components.push(JSON.parse(JSON.stringify(component.defaultConfig)));
      self.resetScene();
      $dialog.close();
    });
  };

  // Delete selected component
  this.deleteComponent = function() {
    let $selected = self.getSelectedComponent();
    if ($selected.text() == 'Body') {
      toastMsg('Cannot delete main body');
      return;
    }

    self.saveHistory();
    let i = $selected[0].componentParent.indexOf($selected[0].component);
    $selected[0].componentParent.splice(i, 1);
    self.resetScene();
  };

  // Get selected component
  this.getSelectedComponent = function() {
    return self.$componentList.find('li.selected');
  };

  // Select list item on click
  this.componentSelect = function(e) {
    if (typeof e.target.component != 'undefined') {
      self.$componentList.find('li').removeClass('selected');
      e.target.classList.add('selected');
      e.stopPropagation();

      self.showComponentOptions(e.target.component);
      self.highlightSelected();
      self.applyDragToSelected();
    }
  };

  // Highlight selected component
  this.highlightSelected = function() {
    let $selected = self.$componentList.find('li.selected');
    if ($selected.length < 1) {
      return;
    }

    let wireframe = babylon.scene.getMeshByID('wireframeComponentSelector');
    if (wireframe != null) {
      wireframe.dispose();
    }
    let index = $selected[0].componentIndex;
    if (typeof index != 'undefined') {
      let body = robot.getComponentByIndex(index).body;
      let size = body.getBoundingInfo().boundingBox.extendSize;
      let options = {
        height: size.y * 2,
        width: size.x * 2,
        depth: size.z * 2
      };
      let wireframeMat = babylon.scene.getMaterialByID('wireframeComponentSelector');
      if (wireframeMat == null) {
        wireframeMat = new BABYLON.StandardMaterial('wireframeComponentSelector', babylon.scene);
        wireframeMat.alpha = 0;
      }

      wireframe = BABYLON.MeshBuilder.CreateBox('wireframeComponentSelector', options, babylon.scene);
      wireframe.material = wireframeMat;
      wireframe.isPickable = false;

      wireframe.body = body;
      self.wireframe = wireframe;    

      wireframe.position = body.absolutePosition;

      wireframe.rotationQuaternion = body.absoluteRotationQuaternion;
      wireframe.enableEdgesRendering();
      wireframe.edgesWidth = 10;
      let wireframeAnimation = new BABYLON.Animation(
        'wireframeAnimation',
        'edgesColor',
        30,
        BABYLON.Animation.ANIMATIONTYPE_COLOR4,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );
      var keys = [];
      keys.push({
        frame: 0,
        value: new BABYLON.Color4(0, 0, 1, 1)
      });
      keys.push({
        frame: 15,
        value: new BABYLON.Color4(1, 0, 0, 1)
      });
      keys.push({
        frame: 30,
        value: new BABYLON.Color4(0, 0, 1, 1)
      });
      wireframeAnimation.setKeys(keys);
      wireframe.animations.push(wireframeAnimation);
      babylon.scene.beginAnimation(wireframe, 0, 30, true);
    }
  }

  // Load robot into components window
  this.loadIntoComponentsWindow = function(options) {
    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let ACTUATORS = ['MagnetActuator', 'ArmActuator', 'SwivelActuator', 'LinearActuator', 'PaintballLauncherActuator','WheelActuator'];
    let DUMB_BLOCKS = ['Box', 'Cylinder', 'Sphere', 'WheelPassive'];
    let motorCount = options.wheels ? 2 : 0;
    let sensorCount = 0;
    let componentIndex = 0;

    let $ul = $('<ul></ul>');
    let $li = $('<li class="selected">Body</li>');
    $li[0].component = options;
    $ul.append($li);

    function addComponents(components) {
      let $list = $('<ul></ul>');
      components.forEach(function(component){
        let $item = $('<li></li>');
        $item.attr('componentIndex', componentIndex);
        let text = component.type;

        if (DUMB_BLOCKS.indexOf(text) != -1) {
          ;
        } else if (ACTUATORS.indexOf(text) != -1) {
          text += ' (out' + PORT_LETTERS[(++motorCount)] + ')';
        } else {
          text += ' (in' + (++sensorCount) + ')';
        }

        $item.text(text);
        $item[0].componentParent = components;
        $item[0].component = component;
        $item[0].componentIndex = componentIndex++;
        $list.append($item);

        if (component.components instanceof Array) {
          $list.append(addComponents(component.components));
        }
      });

      if ($list.children().length > 0) {
        return $('<li class="ulHolder"></li>').append($list);
      } else {
        return null;
      }
    }

    $ul.append(addComponents(options.components));

    $ul.find('li').click(self.componentSelect);

    self.$componentList.empty();
    self.$componentList.append($ul);
  };

  // Save robot to json file
  this.saveRobot = function() {
    if (robotTemplates.findIndex(r => r.name == robot.options.name) != -1) {
      robot.options.name = robot.options.name + ' (Custom)';
      self.$robotName.val(robot.options.name);
    }

    robot.options.shortDescription = robot.options.name;
    robot.options.longDescription = '<p>Custom robot created in the configurator.</p>';

    let wheelSpacing = Math.round((robot.options.bodyWidth + robot.options.wheelWidth + robot.options.wheelToBodyOffset * 2) * 10) / 10;
    let sensors = '';
    var i = 1;
    var sensor = null;
    while (sensor = robot.getComponentByPort('in' + i)) {
      if (sensor.type == 'ColorSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-color#</li>';
      } else if (sensor.type == 'UltrasonicSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-ultrasonic#</li>';
      } else if (sensor.type == 'GyroSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-gyro#</li>';
      } else if (sensor.type == 'GPSSensor') {
        sensors += '<li>#robot-port# ' + i + ' : GPS</li>';
      } else if (sensor.type == 'LaserRangeSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-laser#</li>';
      } else if (sensor.type == 'TouchSensor') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-touch#</li>';
      } else if (sensor.type == 'Pen') {
        sensors += '<li>#robot-port# ' + i + ' : #robot-pen#</li>';
      } else {
        console.log(sensor);
      }
      i++;
    }
    let ports = robot.options.wheels ?
      '<li>#robot-port# A : #robot-leftWheel#</li>' +
      '<li>#robot-port# B : #robot-rightWheel#</li>' : "";
    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    //i = 3;
    i = robot.options.wheels ? 3 : 1;
    var motor = null;
    while (motor = robot.getComponentByPort('out' + PORT_LETTERS[i])) {
      if (motor.type == 'ArmActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-motorizedArm#</li>';
      } else if (motor.type == 'SwivelActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-swivel#</li>';
      } else if (motor.type == 'LinearActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-linear#</li>';
      } else if (motor.type == 'PaintballLauncherActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-paintball#</li>';
      } else if (motor.type == 'MagnetActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-electromagnet#</li>';
      } else if (motor.type == 'WheelActuator') {
        ports += '<li>#robot-port# ' + PORT_LETTERS[i] + ' : #robot-wheel#</li>';
      }
      i++;
    }

    robot.options.longerDescription =
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: ' + robot.options.wheelDiameter + ' cm</li>' +
        '<li>#robot-wheelSpacing#: ' + wheelSpacing + ' cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' + ports + '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' + sensors +'</ul>';

    robot.options.thumbnail = '';
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(robot.options, null, 2));
    hiddenElement.target = '_blank';
    hiddenElement.download = robot.options.name + '.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // Load robot from json file
  this.loadRobotLocal = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        robot.options = JSON.parse(this.result);
        self.clearHistory();
        self.saveHistory();
        self.resetScene();
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // Select robot from templates
  this.selectRobot = function() {
    let $body = $('<div class="selectRobot"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><img class="thumbnail" width="200" height="200"><div class="text"></div></div>');
    let $configurations = $('<div class="configurations"></div>');

    function displayRobotDescriptions(robot) {
      $description.find('.text').html(i18n.get(robot.longDescription));
      if (robot.thumbnail) {
        $description.find('.thumbnail').attr('src', robot.thumbnail);
      } else {
        $description.find('.thumbnail').attr('src', 'images/robots/default_thumbnail.png');
      }

      $configurations.html(i18n.replace(robot.longerDescription));
    }

    robotTemplates.forEach(function(robotTemplate){
      let $robot = $('<option></option>');
      $robot.prop('value', robotTemplate.name);
      $robot.text(i18n.get(robotTemplate.shortDescription));
      if (robotTemplate.name == robot.options.name) {
        $robot.attr('selected', 'selected');
        displayRobotDescriptions(robotTemplate);
      }
      $select.append($robot);
    });

    $body.append($select);
    $body.append($description);
    $body.append($configurations);

    $select.change(function(){
      let robotTemplate = robotTemplates.find(robotTemplate => robotTemplate.name == $select.val());
      displayRobotDescriptions(robotTemplate);
    });

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>' +
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog(i18n.get('#main-select_robot#'), $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      robot.options = JSON.parse(JSON.stringify(robotTemplates.find(robotTemplate => robotTemplate.name == $select.val())));
      self.clearHistory();
      self.saveHistory();
      self.resetScene();
      $dialog.close();
    });
  };

  // Display current position
  this.displayPosition = function() {
    let x = Math.round(robot.body.position.x * 10) / 10;
    let y = Math.round(robot.body.position.z * 10) / 10;
    let angles = robot.body.absoluteRotationQuaternion.toEulerAngles();
    let rot = Math.round(angles.y / Math.PI * 1800) / 10;

    acknowledgeDialog({
      title: 'Robot Position',
      message: $(
        '<p>Position: ' + x + ', ' + y + '</p>' +
        '<p>Rotation: ' + rot + ' degrees</p>'
      )
    })
  };

  // Save current position
  this.savePosition = function() {
    let x = Math.round(robot.body.position.x * 10) / 10;
    let y = Math.round(robot.body.position.z * 10) / 10;
    let angles = robot.body.absoluteRotationQuaternion.toEulerAngles();
    let rot = Math.round(angles.y / Math.PI * 1800) / 10;

    if (typeof babylon.world.defaultOptions.startPosXY != 'undefined') {
      babylon.world.options.startPosXY = x + ',' +y;
    } else {
      toastMsg('Current world doesn\'t allow saving of position');
      return;
    }
    if (typeof babylon.world.defaultOptions.startRot != 'undefined') {
      babylon.world.options.startRot = rot.toString();
    } else {
      toastMsg('Current world doesn\'t allow saving of rotation');
    }
    babylon.world.setOptions();
  };

  // Clear current position
  this.clearPosition = function() {
    if (babylon.world.options.startPosXY) {
      babylon.world.options.startPosXY = '';
    }
    if (babylon.world.options.startRot) {
      babylon.world.options.startRot = '';
    }
    babylon.world.setOptions();
  };

  // Toggle filemenu
  this.toggleFileMenu = function(e) {
    if ($('.fileMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Load from file', line: false, callback: self.loadRobotLocal},
        {html: 'Save to file', line: true, callback: self.saveRobot},
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // Toggle robotmenu
  this.toggleRobotMenu = function(e) {
    if ($('.robotMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'Select Robot', line: false, callback: self.selectRobot},
      ];

      menuDropDown(self.$robotMenu, menuItems, {className: 'robotMenuDropDown'});
    }
  };

  // Snapping
  this.snapStep = [0, 0, 0];
  this.roundToSnap = function(value, snap) {
    if (snap == 0) {
      return value;
    }
    let inv = 1.0 / snap;
    return Math.round(value * inv) / inv;
  }

  // Toggle snapmenu
  this.toggleSnapMenu = function(e) {
    if ($('.snapMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      function snapNone() {
        self.snapStep = [0, 0, 0];
      }
      function snap25() {
        self.snapStep = [0.25, 0.25, 0.25];
      }
      function snapTechnic() {
        self.snapStep = [0.4, 0.4, 0.4];
      }
      function snap05() {
        self.snapStep = [0.5, 0.5, 0.5];
      }
      function snapLego() {
        self.snapStep = [0.4, 0.4, 0.48];
      }
      function snap10() {
        self.snapStep = [1, 1, 1];
      }

      let menuItems = [
        {html: 'No Snapping', line: false, callback: snapNone},
        {html: 'Snap to 0.25cm', line: false, callback: snap25},
        {html: 'Snap to 0.4cm (Lego Technic)', line: false, callback: snapTechnic},
        {html: 'Snap to Lego (xy: 0.4, z: 0.48)', line: false, callback: snapLego},
        {html: 'Snap to 0.5cm', line: false, callback: snap05},
        {html: 'Snap to 1cm', line: false, callback: snap10},
      ];
      var tickIndex = 0;
      if (self.snapStep[2] == 0) {
        tickIndex = 0;
      } else if (self.snapStep[2] == 0.25) {
        tickIndex = 1;
      } else if (self.snapStep[2] == 0.4) {
        tickIndex = 2;
      } else if (self.snapStep[2] == 0.48) {
        tickIndex = 3;
      } else if (self.snapStep[2] == 0.5) {
        tickIndex = 4;
      } else if (self.snapStep[2] == 1) {
        tickIndex = 5;
      }
      menuItems[tickIndex].html = '<span class="tick">&#x2713;</span> ' + menuItems[tickIndex].html;

      menuDropDown(self.$snapMenu, menuItems, {className: 'snapMenuDropDown'});
    }
  };

  // Clicked on tab
  this.tabClicked = function(tabNav) {
  };
}

// Init class
configurator.init();
