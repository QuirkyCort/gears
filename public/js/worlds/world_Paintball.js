i18n.append({
  '#shortDescription#': {
    en: 'Paintball Challenges',
    de: 'Paintball-Herausforderungen',
  },
  '#longDescription#': {
    en: '<p>These challenges requires the use of the paintball launcher.</p>' +
        'Read the <a href="https://github.com/QuirkyCort/gears/wiki/Paintball-Launcher" target="_blank">Paintball Launcher documentations</a> to learn how to launch a paintball.</p>',
    de: '<p>Diese Herausforderungen erfordern die Nutzung des Paintball-Geschützes.</p>' +
        'Lies die <a href="https://github.com/QuirkyCort/gears/wiki/Paintball-Launcher" target="_blank">Dokumentations des Paintball-Geschützes</a>, um zu erfahren, wie man einen Paintball abfeuert.</p>',
  },
  '#firingRange#': {
    en: 'Firing Range',
    de: 'Schießbahn',
  },
  '#variableRange#': {
    en: 'Variable Range',
    de: 'Wechselnde Entfernung',
  },
  '#findTarget#': {
    en: 'Find the Target',
    de: 'Finde das Ziel',
  },
  '#highLow#': {
    en: 'High and Low',
    de: 'Hoch und Niedrig',
  },
  '#movingTarget1#': {
    en: 'Moving Target 1',
    de: 'Bewegliches Ziel 1',
  },
  '#movingTarget2#': {
    en: 'Moving Target 2',
    de: 'Bewegliches Ziel 2',
  },
  '#firingRangeLongDescriptiong#': {
    en: '<p>Test out the paintball launcher here.</p>' +
        '<p class="bold">Experiment 1</p>' +
        '<ul>' +
          '<li>Raise the paintball launcher to a 45 degrees angle.</li>' +
          '<li>Launch the paintball at different power and record how far it travelled.</li>' +
          '<li>Plot your recordings on a chart.</li>' +
          '<li>Basic: Keep your chart and use it in the later challenges.</li>' +
          '<li>Advanced: Can you find a mathematical equation to describe the curve in your chart?</li>' +
          '<li>Advanced: Create a function that takes a distance as an input, and launch the paintball to that distance by controlling power.</li>' +
        '</ul>' +
        '<p class="bold">Experiment 2</p>' +
        '<ul>' +
          '<li>Launch the paintball at full power, but vary the launcher angle from 0 to 90 degrees.</li>' +
          '<li>Record down the distance travelled for each launch angle and plot it on a chart.</li>' +
          '<li>Basic: Keep your chart and use it in the later challenges.</li>' +
          '<li>Advanced: Can you find a mathematical equation to describe the curve in your chart?</li>' +
          '<li>Advanced: Create a function that takes a distance as an input, and launch the paintball to that distance by controlling launch angle.</li>' +
        '</ul>',
    de: '<p>Teste das Paintball Geschütz hier.</p>' +
        '<p class="bold">Experiment 1</p>' +
        '<ul>' +
          '<li>Erhöhe den Abschusswinkel des Paintball-Geschützes auf 45 Grad.</li>' +
          '<li>Feuere den Paintball mit unterschiedlicher Kraft und unterschiedlichen Winkeln ab und notiere, wie weit er flog.</li>' +
          '<li>Stelle die notierten Werte in einem Diagramm dar.</li>' +
          '<li>Grundlagen: Bewahre das Diagramm für spätere Herausforderungen auf.</li>' +
          '<li>Fortgeschritten: Finde eine mathematische Gleichung für die Kurve des Diagramms.</li>' +
          '<li>Fortgeschritten: Erstelle ein Unterprogramm, welches die Entfernung als Eingabe erhält und durch Regelung der Abschusskraft einen Paintball auf diese Entfernung abfeuert.</li>' +
        '</ul>' +
        '<p class="bold">Experiment 2</p>' +
        '<ul>' +
          '<li>Feuere den Paintball mit voller Kraft ab, aber verändere den Abschusswinkel im Bereich von 0 bis 90 Grad.</li>' +
          '<li>Notiere die Entfernung für jeden Abschusswinkel und stelle die Werte in einem Diagramm dar.</li>' +
          '<li>Grundlagen: Bewahre das Diagramm für spätere Herausforderungen auf.</li>' +
          '<li>Fortgeschritten: Finde eine mathematische Gleichung für die Kurve des Diagramms.</li>' +
          '<li>Fortgeschritten: Erstelle ein Unterprogramm, welches die Entfernung als Eingabe erhält und durch Regelung des Abschusswinkels einen Paintball auf diese Entfernung abfeuert.</li>' +
        '</ul>'
  }
});

var world_Paintball = new function() {
  var self = this;

  this.name = 'paintball';
  this.shortDescription = i18n.get('#shortDescription#');
  this.longDescription = i18n.get('#longDescription#');
  this.thumbnail = 'images/worlds/paintball.jpg';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0)
  };

  this.optionsConfigurations = [
    {
      option: 'challenge',
      title: 'Select Challenge',
      type: 'selectWithHTML',
      options: [
        [i18n.get('#firingRange#'), 'firingRange'],
        [i18n.get('#variableRange#'), 'variableRange'],
        [i18n.get('#findTarget#'), 'findTarget'],
        [i18n.get('#highLow#'), 'highLow'],
        [i18n.get('#movingTarget1#'), 'movingTarget1'],
        [i18n.get('#movingTarget2#'), 'movingTarget2'],
      ],
      optionsHTML: {
        firingRange:
          i18n.get('#firingRangeLongDescriptiong#'),
        variableRange:
          '<p>The target is placed a random distance away from the starting line. ' +
          'Using what you have learned in the previous challenge, program your robot to hit the target.</p>' +
          '<p>Advanced: Program your robot to measure the distance to the target (...using the laser range sensor), and automatically launch the paintball at the correct angle and power.</p>',
        findTarget:
          '<p>There is a single randomly placed target. ' +
          'Program your robot to automatically find and hit the target.</p>' +
          '<p>Your robot may turn around, but should otherwise stay at the starting position. ' +
          'Solving this requires a combination of what you have done for the "Variable Range" challenge and the Gyro world\'s "Random Direction" challenge.</p>',
        highLow:
          '<p>There are a total of 4 targets. All of them are 200cm away from your starting position, and are spaced 50cm apart vertically.</p>' +
          '<p>Program your robot to hit all of them.</p>' +
          '<p>Advanced: Create a function that takes a distance and height as inputs, and launch the paintball at the correct angle and power to hit the target.</p>',
        movingTarget1:
          '<p>The target is constantly moving towards and away from you. ' +
          'Pick a random position between 2 to 4 meters, and time your firing to hit the target as it passes that point.</p>' +
          '<p>Advanced: Program your robot to measure the target\'s speed and automatically fire at the right time to hit the target.</p>',
        movingTarget2:
          '<p>This time, the target is moving left and right.</p>' +
          '<p>Advanced: Program your robot to automatically aim and hit the target.</p>' +
          '<p class="bold">This can be very challenging!</p>',
      }
    }
  ];

  this.imagesURL = {
    firingRange: 'textures/maps/Paintball/firingRange.png',
    variableRange: 'textures/maps/Paintball/firingRange.png',
    findTarget: null,
    highLow: null,
    movingTarget1: 'textures/maps/Paintball/firingRange.png',
    movingTarget2: null,
  };

  this.robotStarts = {
    firingRange: new BABYLON.Vector3(0, 0, -245),
    variableRange: new BABYLON.Vector3(0, 0, -245),
    findTarget:  new BABYLON.Vector3(0, 0, -6),
    highLow:  new BABYLON.Vector3(0, 0, -6),
    movingTarget1: new BABYLON.Vector3(0, 0, -245),
    movingTarget2: new BABYLON.Vector3(0, 0, -6),
  };

  this.defaultOptions = {
    challenge: 'firingRange',
    length: 100,
    width: 100,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1
  };

  // Set options, including default
  this.setOptions = function(options) {
    Object.assign(self.options, self.defaultOptions);

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }

    self.robotStart.position = self.robotStarts[self.options.challenge];

    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Firing Range challenge
  this.loadFiringRange = function(scene) {
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [530, 50, 10],
      [0, 0, -10]
    );
  };

  // Variable Range challenge
  this.loadVariableRange = function(scene) {
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [530, 50, 10],
      [0, 0, -10]
    );

    let z = Math.random() * 300 - 135;

    let targets = [
      [12, [0, z, 0]]
    ]
    self.addTargets(scene, 'textures/maps/Paintball/target.png', targets);
  };

  // Find target challenge
  this.loadFindTarget = function(scene) {
    let ground = self.addCylinder(
      scene,
      babylon.getMaterial(scene, 'fff'),
      [10, 1000],
      [0,0,-10]
    );
    ground.receiveShadows = true;

    let dist = Math.random() * 300 + 100;
    let rot = Math.random() * 2 * Math.PI;
    let x = Math.sin(rot) * dist;
    let z = Math.cos(rot) * dist;

    let targets = [
      [12, [x, z, 0], [0, rot, 0]]
    ]
    self.addTargets(scene, 'textures/maps/Paintball/target.png', targets);
  };


  // High and low targets
  this.loadHighLow = function(scene) {
    // ground for player
    let ground1 = self.addBox(
      scene,
      null,
      [50, 50, 10],
      [0, 0, -10]
    );
    ground1.receiveShadows = true;

    // ground for targets
    self.addBox(
      scene,
      null,
      [30, 10, 5],
      [0, 200, -5]
    );
    self.addBox(
      scene,
      null,
      [30, 10, 5],
      [0, 200, 45]
    );
    self.addBox(
      scene,
      null,
      [30, 10, 5],
      [0, 200, 95]
    );
    self.addBox(
      scene,
      null,
      [30, 10, 5],
      [0, 200, -55]
    );

    let targets = [
      [[12, 2, 12], [0, 200, 0]],
      [[12, 2, 12], [0, 200, 50]],
      [[12, 2, 12], [0, 200, 100]],
      [[12, 2, 12], [0, 200, -50]],
    ]
    self.targetMeshes = self.addTargets(scene, 'textures/maps/Paintball/target.png', targets);

    function paintballCollide(ownImpostor, otherImpostor, hit) {
      let impulseVector = otherImpostor.getLinearVelocity().scale(50);
      ownImpostor.applyImpulse(impulseVector, hit.pickedPoint);
    }

    self.targetMeshes.forEach(function(mesh){
      mesh.paintballCollide = paintballCollide;
    })
  };

  // Moving target 1 challenge
  this.loadMovingTarget1 = function(scene) {
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [530, 50, 10],
      [0, 0, -10]
    );

    let z = Math.random() * 300 - 135;

    let targets = [
      [12, [0, -135, 0]]
    ]
    self.targetMeshes = self.addTargets(scene, 'textures/maps/Paintball/target.png', targets);

    self.targetMeshes[0].startZ = -135;
    self.targetMeshes[0].endZ = 165;
    self.targetMeshes[0].speed = 30 / 1000;
    self.targetMeshes[0].animate = function(delta, mesh) {
      mesh.position.z += mesh.speed * delta;
      mesh.position.x = 0;
      if (mesh.position.z > mesh.endZ) {
        mesh.position.z = mesh.endZ;
        mesh.speed = -mesh.speed;
      } else if (mesh.position.z < mesh.startZ) {
        mesh.position.z = mesh.startZ;
        mesh.speed = -mesh.speed;
      }
    };
  };

  // Moving target 2 challenge
  this.loadMovingTarget2 = function(scene) {
    // ground for player
    let ground1 = self.addBox(
      scene,
      null,
      [50, 50, 10],
      [0, 0, -10]
    );
    ground1.receiveShadows = true;

    // ground for target
    self.addBox(
      scene,
      null,
      [500, 50, 10],
      [0, 200, -10]
    );

    let targets = [
      [12, [-230, 200, 0]]
    ]
    self.targetMeshes = self.addTargets(scene, 'textures/maps/Paintball/target.png', targets);

    self.targetMeshes[0].startX = -230;
    self.targetMeshes[0].endX = 230;
    self.targetMeshes[0].speed = 30 / 1000;
    self.targetMeshes[0].animate = function(delta, mesh) {
      mesh.position.x += mesh.speed * delta;
      mesh.position.z = 200;
      if (mesh.position.x > mesh.endX) {
        mesh.position.x = mesh.endX;
        mesh.speed = -mesh.speed;
      } else if (mesh.position.x < mesh.startX) {
        mesh.position.x = mesh.startX;
        mesh.speed = -mesh.speed;
      }
    };
  };

  // Render
  this.render = function (delta) {
    if (self.targetMeshes) {
      self.targetMeshes.forEach(function(mesh) {
        if (typeof mesh.animate == 'function') {
          mesh.animate(delta, mesh);
        }
      })
    }
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      // Set standby game state
      self.game = {
        state: 'standby',
        startTime: null,
        renderTimeout: 0,
        red: 0,
        green: 0,
        score: 0,
        redExpired: false
      };

      if (self.options.challenge == 'firingRange') {
        self.loadFiringRange(scene);
      } else if (self.options.challenge == 'variableRange') {
        self.loadVariableRange(scene);
      } else if (self.options.challenge == 'findTarget') {
        self.loadFindTarget(scene);
      } else if (self.options.challenge == 'highLow') {
        self.loadHighLow(scene);
      } else if (self.options.challenge == 'movingTarget1') {
        self.loadMovingTarget1(scene);
      } else if (self.options.challenge == 'movingTarget2') {
        self.loadMovingTarget2(scene);
      }

      resolve();
    });
  };

  // Load box with target image
  this.addTargets = function (scene, imageSrc, targets, physics=true) {
    var mat = new BABYLON.StandardMaterial('target', scene);
    var texture = new BABYLON.Texture(imageSrc, scene);
    mat.diffuseTexture = texture;
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
    }

    let physicsOptions = {
      mass: 100,
      friction: 0.1
    };

    let meshes = [];
    targets.forEach(function(target) {
      let rot = [0, 0, 0];
      if (target[2]) {
        rot = target[2];
      }

      let size = [target[0], target[0], target[0]];
      if (target[0] instanceof Array) {
        size = target[0];
      }
      if (physics) {
        meshes.push(self.addBox(scene, mat, size, target[1], false, physicsOptions, true, [0, 0, 0], faceUV));
      } else {
        meshes.push(self.addBox(scene, mat, size, target[1], false, false, true, [0, 0, 0], faceUV));
      }
    });

    return meshes;
  };

  // Load image into tile
  this.loadImageTile = function (scene, imageSrc, size, pos=[0,0,0], physicsOptions=null) {
    var mat = new BABYLON.StandardMaterial('image', scene);
    var texture = new BABYLON.Texture(imageSrc, scene);
    mat.diffuseTexture = texture;
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    if (! physicsOptions) {
      physicsOptions = {
        mass: 0,
        friction: self.options.groundFriction,
        restitution: self.options.groundRestitution
      };
    }
    let tile = self.addBox(scene, mat, size, pos, false, physicsOptions, true, [0, Math.PI/2, 0], faceUV);
    tile.receiveShadows = true;

    return tile;
  };

  // Add box
  this.addBox = function(scene, material, size, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null) {
    var boxOptions = {
      width: size[0],
      depth: size[1],
      height: size[2],
    };
    if (pos.length < 3) {
      pos.push(0);
    }
    if (faceUV) {
      boxOptions.faceUV = faceUV;
    }

    var box = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    if (visible) {
      box.material = material;
    } else {
      box.visibility = 0;
    }
    box.position.x = pos[0];
    box.position.y = pos[2] + size[2] / 2;
    box.position.z = pos[1];
    box.rotation.x = rot[0];
    box.rotation.y = rot[1];
    box.rotation.z = rot[2];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      box.isMagnetic = true;
    }

    if (physicsOptions !== false) {
      if (physicsOptions === true) {
        physicsOptions = {
          mass: mass,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
        };
      }

      box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box,
        BABYLON.PhysicsImpostor.BoxImpostor,
        physicsOptions,
        scene
      );
    }

    return box;
  };

  // Add a cylinder
  this.addCylinder = function (scene, material, size, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null) {
    var cylinderOptions = {
      height: size[0],
      diameter: size[1],
    };
    if (pos.length < 3) {
      pos.push(0);
    }
    if (faceUV) {
      cylinderOptions.faceUV = faceUV;
    }

    var cylinder = BABYLON.MeshBuilder.CreateCylinder('cylinder', cylinderOptions, scene);
    if (visible) {
      cylinder.material = material;
    } else {
      cylinder.visibility = 0;
    }
    cylinder.position.x = pos[0];
    cylinder.position.y = pos[2] + size[0] / 2;
    cylinder.position.z = pos[1];
    cylinder.rotation.x = rot[0];
    cylinder.rotation.y = rot[1];
    cylinder.rotation.z = rot[2];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      cylinder.isMagnetic = true;
    }

    if (physicsOptions !== false) {
      if (physicsOptions === true) {
        physicsOptions = {
          mass: mass,
          friction: self.options.wallFriction,
          restitution: self.options.wallRestitution
        };
      }

      cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(
        cylinder,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        physicsOptions,
        scene
      );
    }

    return cylinder;
  };

}

// Init class
world_Paintball.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Paintball);