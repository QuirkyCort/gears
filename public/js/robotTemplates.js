var robotTemplates = [
  {
    name: 'singleFollower',
    shortDescription: 'Single Sensor Line Follower',
    longDescription:
      '<p>This robot is equipped with a single color sensor for line following.</p>' +
      '<p>An electromagnet at the bottom of the robot lets you pick up magnetic objects.</p>' +
      '<p>It\'s good for learning the basics of line following, but some line following maps will require double sensors.</p>',
    longerDescription:
      '<h3>Dimensions</h3>' +
      '<ul>' +
        '<li>Wheel Diameter: 5.6 cm</li>' +
        '<li>Wheel Spacing: 15.2 cm</li>' +
      '</ul>' +
      '<h3>Actuators</h3>' +
      '<ul>' +
        '<li>Left Wheel: Port A</li>' +
        '<li>Right Wheel: Port B</li>' +
        '<li>Electromagnet: Port C</li>' +
      '</ul>' +
      '<h3>Sensors</h3>' +
      '<ul>' +
        '<li>Color Sensor: Port 1</li>' +
        '<li>Ultrasonic Distance: Port 2</li>' +
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
        type: 'magnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      }
    ]
  },
  {
    name: 'doubleFollower',
    shortDescription: 'Double Sensor Line Follower',
    longDescription:
      '<p>This robot is equipped with two color sensor for line following.</p>' +
      '<p>An electromagnet at the bottom of the robot lets you pick up magnetic objects, and a gyro allows accurate movements even when the robot is off the line.</p>',
    longerDescription:
      '<h3>Dimensions</h3>' +
      '<ul>' +
        '<li>Wheel Diameter: 5.6 cm</li>' +
        '<li>Wheel Spacing: 15.2 cm</li>' +
      '</ul>' +
      '<h3>Actuators</h3>' +
      '<ul>' +
        '<li>Left Wheel: Port A</li>' +
        '<li>Right Wheel: Port B</li>' +
        '<li>Electromagnet: Port C</li>' +
      '</ul>' +
      '<h3>Sensors</h3>' +
      '<ul>' +
        '<li>Color Sensor: Port 1</li>' +
        '<li>Color Sensor: Port 2</li>' +
        '<li>Ultrasonic Distance: Port 3</li>' +
        '<li>Gyro: Port 4</li>' +
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
        position: [0, 2.5, 5],
        options: null
      },
      {
        type: 'magnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      }
    ]
  },
  {
    name: 'maze',
    shortDescription: 'Maze Runner',
    longDescription:
      '<p>This robot is equipped with three ultrasonic sensor to facilitate maze navigation, and a color sensor to detect the end point.</p>' +
      '<p>An electromagnet at the bottom of the robot lets you pick up magnetic objects, and a gyro helps the robot move straight.</p>',
    longerDescription:
      '<h3>Dimensions</h3>' +
      '<ul>' +
        '<li>Wheel Diameter: 5.6 cm</li>' +
        '<li>Wheel Spacing: 15.2 cm</li>' +
      '</ul>' +
      '<h3>Actuators</h3>' +
      '<ul>' +
        '<li>Left Wheel: Port A</li>' +
        '<li>Right Wheel: Port B</li>' +
        '<li>Electromagnet: Port C</li>' +
      '</ul>' +
      '<h3>Sensors</h3>' +
      '<ul>' +
        '<li>Color Sensor: Port 1</li>' +
        '<li>Ultrasonic Distance (Front): Port 2</li>' +
        '<li>Ultrasonic Distance (Left): Port 3</li>' +
        '<li>Ultrasonic Distance (Right): Port 4</li>' +
        '<li>Gyro: Port 5</li>' +
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
        type: 'magnetActuator',
        position: [0, -1, 3],
        rotation: [0, 0, 0],
        options: null
      }
    ]
  },
  {
    name: 'tow',
    shortDescription: 'Tow Truck',
    longDescription:
      '<p>This robot is equipped with an arm mounted magnet.</p>' +
      '<p>It can pick up or tow magnetic objects. Just be careful not to knock the object away when turning around!</p>',
    longerDescription:
      '<h3>Dimensions</h3>' +
      '<ul>' +
        '<li>Wheel Diameter: 5.6 cm</li>' +
        '<li>Wheel Spacing: 15.2 cm</li>' +
      '</ul>' +
      '<h3>Actuators</h3>' +
      '<ul>' +
        '<li>Left Wheel: Port A</li>' +
        '<li>Right Wheel: Port B</li>' +
        '<li>Motorized Arm: Port C</li>' +
        '<li>Electromagnet: Port D</li>' +
      '</ul>' +
      '<h3>Sensors</h3>' +
      '<ul>' +
        '<li>Color Sensor (Left): Port 1</li>' +
        '<li>Color Sensor (Right): Port 2</li>' +
        '<li>Ultrasonic Distance: Port 3</li>' +
        '<li>Gyro: Port 4</li>' +
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
        type: 'armActuator',
        position: [0, 3, 4],
        rotation: [0, Math.PI, 0],
        options: null,
        components: [
          {
            type: 'magnetActuator',
            position: [0, -1.75, 8],
            rotation: [0, 0, 0],
            options: null
          }
        ]
      }
    ]
  }
];