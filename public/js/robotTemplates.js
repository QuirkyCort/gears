i18n.append({
  '#robot-dimensions#': {
    en: 'Dimensions',
  },
  '#robot-wheelDiameter#': {
    en: 'Wheel Diameter',
  },
  '#robot-wheelSpacing#': {
    en: 'Wheel Spacing',
  },
  '#robot-actuators#': {
    en: 'Actuators',
  },
  '#robot-port#': {
    en: 'Port',
  },
  '#robot-leftWheel#': {
    en: 'Left Wheel',
  },
  '#robot-rightWheel#': {
    en: 'Right Wheel',
  },
  '#robot-electromagnet#': {
    en: 'Electromagnet',
  },
  '#robot-motorizedArm#': {
    en: 'Motorized Arm',
  },
  '#robot-swivel#': {
    en: 'Swivel Platform',
  },
  '#robot-paintball#': {
    en: 'Paintball Launcher',
  },
  '#robot-sensors#': {
    en: 'Sensors',
  },
  '#robot-color#': {
    en: 'Color Sensor',
  },
  '#robot-front#': {
    en: 'Front',
  },
  '#robot-left#': {
    en: 'Left',
  },
  '#robot-right#': {
    en: 'Right',
  },
  '#robot-arm#': {
    en: 'Arm',
  },
  '#robot-ultrasonic#': {
    en: 'Ultrasonic Distance',
  },
  '#robot-gyro#': {
    en: 'Gyro',
  },
  '#robot-laser#': {
    en: 'Laser Range Sensor',
  },


  '#robot-singleFollowerShort#': {
    en: 'Single Sensor Line Follower',
  },
  '#robot-singleFollowerLong#': {
    en:
      '<p>This robot is equipped with a single color sensor for line following.</p>' +
      '<p>An electromagnet at the bottom of the robot lets you pick up magnetic objects.</p>' +
      '<p>It\'s good for learning the basics of line following, but some line following maps will require double sensors.</p>',
  },
  '#robot-doubleFollowerShort#': {
    en: 'Double Sensor Line Follower',
  },
  '#robot-doubleFollowerLong#': {
    en:
      '<p>This robot is equipped with two color sensor for line following.</p>' +
      '<p>An electromagnet at the bottom of the robot lets you pick up magnetic objects, and a gyro and GPS allows accurate movements even when the robot is off the line.</p>',
  },
  '#robot-paintballShort#': {
    en: 'Paintball ',
  },
  '#robot-paintballLong#': {
    en:
      '<p>This robot is similar to the double sensor line follower, but with the addition of a paintball launcher mounted on an motorized arm. ' +
      'The ultrasonic distance sensor is also replaced with a long range (5m) laser range sensor.</p>'  +
      '<p>Read the <a href="https://github.com/QuirkyCort/gears/wiki/Paintball-Launcher" target="_blank">Paintball Launcher documentations</a> to learn how to launch a paintball.</p>',
  },
  '#robot-mazeShort#': {
    en: 'Maze Runner',
  },
  '#robot-mazeLong#': {
    en:
      '<p>This robot is equipped with three ultrasonic sensor to facilitate maze navigation, and a color sensor to detect the end point.</p>' +
      '<p>An electromagnet at the bottom of the robot lets you pick up magnetic objects, and a gyro helps the robot move straight.</p>',
  },
  '#robot-maze2Short#': {
    en: 'Maze Runner MkII',
  },
  '#robot-maze2Long#': {
    en:
      '<p>This is an advanced maze runner robot that replaces the original\'s three ultrasonic sensor with a single laser range finder and a foward facing color sensor mounted on a swivel platform.</p>' +
      '<p>The forward facing color sensor is specially configured for long range (30cm) and narrow view (30 degrees).</p>',
  },
  '#robot-towShort#': {
    en: 'Tow Truck',
  },
  '#robot-towLong#': {
    en:
      '<p>This robot is equipped with an arm mounted magnet.</p>' +
      '<p>It can pick up or tow magnetic objects. Just be careful not to knock the object away when turning around!</p>',
  },
  '#robot-craneShort#': {
    en: 'Crane',
  },
  '#robot-craneLong#': {
    en:
      '<p>This robot is equipped with an electromagnet at the end of a two segments crane arm.</p>' +
      '<p>It can reach higher and further than the other robots, ' +
      'and a color sensor at the end of the arm allows it to identify what it is picking up.</p>' +
      '<p>When using this robot, fold the arms to avoid obstructing the ultrasonic sensor.</p>',
  },
});


var robotTemplates = [
  {
    name: 'singleFollower',
    shortDescription: '#robot-singleFollowerShort#',
    longDescription: '#robot-singleFollowerLong#',
    longerDescription:
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: 5.6 cm</li>' +
        '<li>#robot-wheelSpacing#: 15.2 cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' +
        '<li>#robot-port# A : #robot-leftWheel#</li>' +
        '<li>#robot-port# B : #robot-rightWheel#</li>' +
        '<li>#robot-port# C : #robot-electromagnet#</li>' +
      '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' +
        '<li>#robot-port# 1 : #robot-color#</li>' +
        '<li>#robot-port# 2 : #robot-ultrasonic#</li>' +
        '<li>#robot-port# 3 : #robot-gyro#</li>' +
        '<li>#robot-port# 4 : GPS</li>' +
      '</ul>',
    thumbnail: 'images/robots/singleFollower.jpg',

    bodyHeight: 4,
    bodyWidth: 14,
    bodyLength: 16,

    wheelDiameter: 5.6,
    wheelWidth: 0.8,
    wheelToBodyOffset: 0.2,

    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 2,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 0, // Warning: No effect due to parenting

    wheelFriction: 10,
    bodyFriction: 0,
    casterFriction: 0, // Warning: No effect due to parenting

    components: [
      {
        type: 'ColorSensor',
        position: [0, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'UltrasonicSensor',
        position: [0, 2.5, 8],
        rotation: [0, 0, 0],
        options: null
      },
      {
        type: 'GyroSensor',
        position: [0, 2.5, 2.5],
        options: null
      },
      {
        type: 'GPSSensor',
        position: [0, 2.5, 5],
        options: null
      },
      {
        type: 'MagnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      }
    ]
  },
  {
    name: 'doubleFollower',
    shortDescription: '#robot-doubleFollowerShort#',
    longDescription: '#robot-doubleFollowerLong#',
    longerDescription:
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: 5.6 cm</li>' +
        '<li>#robot-wheelSpacing#: 15.2 cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' +
        '<li>#robot-port# A : #robot-leftWheel#</li>' +
        '<li>#robot-port# B : #robot-rightWheel#</li>' +
        '<li>#robot-port# C : #robot-electromagnet#</li>' +
      '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' +
        '<li>#robot-port# 1 : #robot-color#</li>' +
        '<li>#robot-port# 2 : #robot-color#</li>' +
        '<li>#robot-port# 3 : #robot-ultrasonic#</li>' +
        '<li>#robot-port# 4 : #robot-gyro#</li>' +
        '<li>#robot-port# 5 : GPS</li>' +
      '</ul>',
    thumbnail: 'images/robots/doubleFollower.jpg',

    bodyHeight: 4,
    bodyWidth: 14,
    bodyLength: 16,

    wheelDiameter: 5.6,
    wheelWidth: 0.8,
    wheelToBodyOffset: 0.2,

    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 2,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 0, // Warning: No effect due to parenting

    wheelFriction: 10,
    bodyFriction: 0,
    casterFriction: 0, // Warning: No effect due to parenting

    components: [
      {
        type: 'ColorSensor',
        position: [-2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'ColorSensor',
        position: [2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'UltrasonicSensor',
        position: [0, 2.5, 8],
        rotation: [0, 0, 0],
        options: null
      },
      {
        type: 'GyroSensor',
        position: [0, 2.5, 2.5],
        options: null
      },
      {
        type: 'GPSSensor',
        position: [0, 2.5, 5],
        options: null
      },
      {
        type: 'MagnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      }
    ]
  },
  {
    name: 'paintball',
    shortDescription: '#robot-paintballShort#',
    longDescription: '#robot-paintballLong#',
    longerDescription:
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: 5.6 cm</li>' +
        '<li>#robot-wheelSpacing#: 15.2 cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' +
        '<li>#robot-port# A : #robot-leftWheel#</li>' +
        '<li>#robot-port# B : #robot-rightWheel#</li>' +
        '<li>#robot-port# C : #robot-electromagnet#</li>' +
        '<li>#robot-port# D : #robot-motorizedArm#</li>' +
        '<li>#robot-port# E : #robot-paintball#</li>' +
      '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' +
        '<li>#robot-port# 1 : #robot-color#</li>' +
        '<li>#robot-port# 2 : #robot-color#</li>' +
        '<li>#robot-port# 3 : #robot-laser#</li>' +
        '<li>#robot-port# 4 : #robot-gyro#</li>' +
        '<li>#robot-port# 5 : GPS</li>' +
      '</ul>',
    thumbnail: 'images/robots/paintball.jpg',

    bodyHeight: 4,
    bodyWidth: 14,
    bodyLength: 16,

    wheelDiameter: 5.6,
    wheelWidth: 0.8,
    wheelToBodyOffset: 0.2,

    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 2,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 0, // Warning: No effect due to parenting

    wheelFriction: 10,
    bodyFriction: 0,
    casterFriction: 0, // Warning: No effect due to parenting

    components: [
      {
        type: 'ColorSensor',
        position: [-2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'ColorSensor',
        position: [2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'LaserRangeSensor',
        position: [0, 2.5, 7.5],
        rotation: [-Math.PI/2, 0, 0],
        options: {
          rayLength: 500
        }
      },
      {
        type: 'GyroSensor',
        position: [2.5, 2.5, 5],
        options: null
      },
      {
        type: 'GPSSensor',
        position: [0, 2.5, 5],
        options: null
      },
      {
        type: 'MagnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      },
      {
        type: 'ArmActuator',
        position: [0, 3, 1],
        rotation: [0, 0, 0],
        options: {
          armLength: 3,
          maxAngle: 90
        },
        components: [
          {
            type: 'PaintballLauncherActuator',
            position: [0, 2.3, 2],
            rotation: [0, 0, 0],
            options: null
          }
        ]
      }
    ]
  },
  {
    name: 'maze',
    shortDescription: '#robot-mazeShort#',
    longDescription: '#robot-mazeLong#',
    longerDescription:
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: 5.6 cm</li>' +
        '<li>#robot-wheelSpacing#: 15.2 cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' +
        '<li>#robot-port# A : #robot-leftWheel#</li>' +
        '<li>#robot-port# B : #robot-rightWheel#</li>' +
        '<li>#robot-port# C : #robot-electromagnet#</li>' +
      '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' +
        '<li>#robot-port# 1 : #robot-color#</li>' +
        '<li>#robot-port# 2 : #robot-ultrasonic# (#robot-front#)</li>' +
        '<li>#robot-port# 3 : #robot-ultrasonic# (#robot-left#)</li>' +
        '<li>#robot-port# 4 : #robot-ultrasonic# (#robot-right#)</li>' +
        '<li>#robot-port# 5 : #robot-gyro#</li>' +
      '</ul>',
    thumbnail: 'images/robots/maze.jpg',

    bodyHeight: 4,
    bodyWidth: 14,
    bodyLength: 16,

    wheelDiameter: 5.6,
    wheelWidth: 0.8,
    wheelToBodyOffset: 0.2,

    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 2,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 0, // Warning: No effect due to parenting

    wheelFriction: 10,
    bodyFriction: 0,
    casterFriction: 0, // Warning: No effect due to parenting

    components: [
      {
        type: 'ColorSensor',
        position: [0, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'UltrasonicSensor',
        position: [0, 2.5, 8],
        rotation: [0, 0, 0],
        options: null
      },
      {
        type: 'UltrasonicSensor',
        position: [-6, 3, 4],
        rotation: [0, -Math.PI/2, 0],
        options: null
      },
      {
        type: 'UltrasonicSensor',
        position: [6, 3, 4],
        rotation: [0, Math.PI/2, 0],
        options: null
      },
      {
        type: 'Box',
        position: [-8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'Box',
        position: [8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'GyroSensor',
        position: [0, 2.5, 5],
        options: null
      },
      {
        type: 'MagnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      }
    ]
  },
  {
    name: 'maze2',
    shortDescription: '#robot-maze2Short#',
    longDescription: '#robot-maze2Long#',
    longerDescription:
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: 5.6 cm</li>' +
        '<li>#robot-wheelSpacing#: 15.2 cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' +
        '<li>#robot-port# A : #robot-leftWheel#</li>' +
        '<li>#robot-port# B : #robot-rightWheel#</li>' +
        '<li>#robot-port# C : #robot-electromagnet#</li>' +
        '<li>#robot-port# D : #robot-swivel#</li>' +
      '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' +
        '<li>#robot-port# 1 : #robot-color#</li>' +
        '<li>#robot-port# 2 : #robot-gyro#</li>' +
        '<li>#robot-port# 3 : #robot-laser#</li>' +
        '<li>#robot-port# 4 : #robot-color# (#robot-swivel#)</li>' +
      '</ul>',
    thumbnail: 'images/robots/maze2.jpg',

    bodyHeight: 4,
    bodyWidth: 14,
    bodyLength: 16,

    wheelDiameter: 5.6,
    wheelWidth: 0.8,
    wheelToBodyOffset: 0.2,

    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 2,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 0, // Warning: No effect due to parenting

    wheelFriction: 10,
    bodyFriction: 0,
    casterFriction: 0, // Warning: No effect due to parenting

    components: [
      {
        type: 'ColorSensor',
        position: [0, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'Box',
        position: [-8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'Box',
        position: [8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'GyroSensor',
        position: [0, 2, 0],
        options: null
      },
      {
        type: 'MagnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      },
      {
        type: 'SwivelActuator',
        position: [0, 2, 5],
        rotation: [0, 0, 0],
        options: null,
        components: [
          {
            type: 'LaserRangeSensor',
            position: [-0.75, 1, 0],
            rotation: [-Math.PI/2, 0, 0],
            options: null
          },
          {
            type: 'ColorSensor',
            position: [1, 1.25, 0],
            rotation: [0, 0, 0],
            options: {
              sensorMaxRange: 30,
              sensorFov: 0.524
            }
          },
        ]
      }
    ]
  },
  {
    name: 'tow',
    shortDescription: '#robot-towShort#',
    longDescription: '#robot-towLong#',
    longerDescription:
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: 5.6 cm</li>' +
        '<li>#robot-wheelSpacing#: 15.2 cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' +
        '<li>#robot-port# A : #robot-leftWheel#</li>' +
        '<li>#robot-port# B : #robot-rightWheel#</li>' +
        '<li>#robot-port# C : #robot-motorizedArm#</li>' +
        '<li>#robot-port# D : #robot-electromagnet#</li>' +
      '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' +
        '<li>#robot-port# 1 : #robot-color# (#robot-left#)</li>' +
        '<li>#robot-port# 2 : #robot-color# (#robot-right#)</li>' +
        '<li>#robot-port# 3 : #robot-ultrasonic#</li>' +
        '<li>#robot-port# 4 : #robot-gyro#</li>' +
      '</ul>',
    thumbnail: 'images/robots/tow.jpg',

    bodyHeight: 4,
    bodyWidth: 14,
    bodyLength: 16,

    wheelDiameter: 5.6,
    wheelWidth: 0.8,
    wheelToBodyOffset: 0.2,

    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 2,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 0, // Warning: No effect due to parenting

    wheelFriction: 10,
    bodyFriction: 0,
    casterFriction: 0, // Warning: No effect due to parenting

    components: [
      {
        type: 'ColorSensor',
        position: [-2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'ColorSensor',
        position: [2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'UltrasonicSensor',
        position: [0, 2.5, 8],
        rotation: [0, 0, 0],
        options: null
      },
      {
        type: 'Box',
        position: [-8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'Box',
        position: [8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'GyroSensor',
        position: [-4, 2.5, 5],
        options: null
      },
      {
        type: 'ArmActuator',
        position: [0, 3, 4],
        rotation: [0, Math.PI, 0],
        options: null,
        components: [
          {
            type: 'MagnetActuator',
            position: [0, -1.75, 8],
            rotation: [0, 0, 0],
            options: null
          }
        ]
      }
    ]
  },
  {
    name: 'crane',
    shortDescription: '#robot-craneShort#',
    longDescription: '#robot-craneLong#',
    longerDescription:
      '<h3>#robot-dimensions#</h3>' +
      '<ul>' +
        '<li>#robot-wheelDiameter#: 5.6 cm</li>' +
        '<li>#robot-wheelSpacing#: 15.2 cm</li>' +
      '</ul>' +
      '<h3>#robot-actuators#</h3>' +
      '<ul>' +
        '<li>#robot-port# A : #robot-leftWheel#</li>' +
        '<li>#robot-port# B : #robot-rightWheel#</li>' +
        '<li>#robot-port# C : #robot-motorizedArm# 1</li>' +
        '<li>#robot-port# D : #robot-motorizedArm# 2</li>' +
        '<li>#robot-port# E : #robot-electromagnet#</li>' +
      '</ul>' +
      '<h3>#robot-sensors#</h3>' +
      '<ul>' +
        '<li>#robot-port# 1 : #robot-color# (#robot-left#)</li>' +
        '<li>#robot-port# 2 : #robot-color# (#robot-right#)</li>' +
        '<li>#robot-port# 3 : #robot-ultrasonic#</li>' +
        '<li>#robot-port# 4 : #robot-gyro#</li>' +
        '<li>#robot-port# 5 : #robot-color# (#robot-arm#)</li>' +
      '</ul>',
    thumbnail: 'images/robots/crane.jpg',

    bodyHeight: 4,
    bodyWidth: 14,
    bodyLength: 16,

    wheelDiameter: 5.6,
    wheelWidth: 0.8,
    wheelToBodyOffset: 0.2,

    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 2,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 0, // Warning: No effect due to parenting

    wheelFriction: 10,
    bodyFriction: 0,
    casterFriction: 0, // Warning: No effect due to parenting

    components: [
      {
        type: 'ColorSensor',
        position: [-2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'ColorSensor',
        position: [2, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'UltrasonicSensor',
        position: [0, 2.5, 8],
        rotation: [0, 0, 0],
        options: null
      },
      {
        type: 'Box',
        position: [-8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'Box',
        position: [8.7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'GyroSensor',
        position: [-4, 2.5, 5],
        options: null
      },
      {
        type: 'ArmActuator',
        position: [0, 3, 4],
        rotation: [0, 0, 0],
        options: null,
        components: [
          {
            type: 'ArmActuator',
            position: [0, 0, 8],
            rotation: [0, 0, 0],
            options: {
              minAngle: -160,
              maxAngle: 160,
              mass: 50
            },
            components: [
              {
                type: 'MagnetActuator',
                position: [0, -1.75, 8],
                rotation: [0, 0, 0],
                options: null
              },
              {
                type: 'ColorSensor',
                position: [0, -1.25, 10],
                rotation: [Math.PI/2, 0, 0],
                options: null
              }
            ]
          }
        ]
      }
    ]
  }
];