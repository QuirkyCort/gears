var world_Test = new function() {
  var self = this;

  this.name = 'test';
  this.shortDescription = 'Test World';
  this.longDescription =
    '<p>A test world mainly for testing physics.</p>' +
    '<p>The small blue squares are magnetic, and can be picked up using the robot magnet.</p>';

  this.options = {};
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0)
  };

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
      option: 'startPosXY',
      title: 'Starting Position (x, y)',
      type: 'text',
      help: 'Enter using this format "x, y" (without quotes) and it will override the above. Center of image is "0, 0".'
    }
  ];

  this.defaultOptions = {
    staticObjectFriction: 1,
    kinematicObjectFriction: .8,
    staticObjectRestitution: 0.0,
    kinematicObjectRestitution: 0.1,
    startPos: 'ramp18',
    startPosXY: ''
  };

  // Set options, including default
  this.setOptions = function(options) {
    let tmpOptions = {};
    Object.assign(tmpOptions, self.defaultOptions);
    Object.assign(tmpOptions, self.options);
    Object.assign(self.options, tmpOptions);

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }

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

    if (
      typeof options != 'undefined'
      && typeof options.startPosXY != 'undefined'
      && options.startPosXY.trim() != ''
    ) {
      let xy = options.startPosXY.split(',');
      self.robotStart.position = new BABYLON.Vector3(parseFloat(xy[0]), 0, parseFloat(xy[1]));
    }

    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Create the scene
  this.load = function (scene) {
    self.loadMaterials(scene);

    return new Promise(function(resolve, reject) {
      world_Grid.loadBaseMap(scene);
      self.loadObjects(scene);
      resolve();
    });
  };

  // Objects
  this.loadObjects = function (scene) {
    // Ramp
    self.buildStatic(scene,[40,30,20],[0,-5,20],[Math.PI*0.4,0,0]);
    self.buildStatic(scene,[40,30,20],[35,-5,20],[Math.PI*0.3,0,0]);
    self.buildStatic(scene,[40,30,20],[70,-5,20],[Math.PI*0.25,0,0]);
    self.buildStatic(scene,[40,30,20],[105,-5,20],[Math.PI*0.4,0,0],0.01);

    // Bumps
    self.buildStatic(scene,[1,30,1],[140,0.5,15]);
    self.buildStatic(scene,[1,30,1],[140,0.5,20]);
    self.buildStatic(scene,[1,30,1],[140,0.5,25]);
    self.buildStatic(scene,[1,30,1],[140,0.5,30]);

    self.buildStatic(scene,[1,30,1.5],[140,0.5,40]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,46]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,50]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,55]);

    self.buildStatic(scene,[1,30,1.5],[140,0.5,70],[0,0.1,0]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,80],[0,-0.1,0]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,90],[0,0.2,0]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,100],[0,-0.2,0]);

    // Boxes for pushing
    self.buildKinematic(scene,[8,8,8],[-70,4,20],800);
    self.buildKinematic(scene,[8,8,8],[-105,4,20],1600);

    // Tower
    self.buildKinematic(scene,[8,8,8],[-140,4,40],200);
    self.buildKinematic(scene,[8,8,8],[-140,12,40],200);
    self.buildKinematic(scene,[8,8,8],[-140,20,40],200);
    self.buildKinematic(scene,[8,8,8],[-140,28,40],200);
    self.buildKinematic(scene,[8,8,8],[-140,36,40],200);

    // Wall
    self.buildKinematic(scene,[10,10,10],[-180,5,40],200);
    self.buildKinematic(scene,[10,10,10],[-180,15,40],200);
    self.buildKinematic(scene,[10,10,10],[-180,25,40],200);
    self.buildKinematic(scene,[10,10,10],[-170,5,40],200);
    self.buildKinematic(scene,[10,10,10],[-170,15,40],200);
    self.buildKinematic(scene,[10,10,10],[-170,25,40],200);

    self.buildKinematic(scene,[10,10,10],[-180,5,-40],200);
    self.buildKinematic(scene,[10,10,10],[-180,15,-40],200);
    self.buildKinematic(scene,[10,10,10],[-180,25,-40],200);
    self.buildKinematic(scene,[10,10,10],[-170,5,-40],200);
    self.buildKinematic(scene,[10,10,10],[-170,15,-40],200);
    self.buildKinematic(scene,[10,10,10],[-170,25,-40],200);

    // Bumps
    self.buildKinematic(scene,[1,30,1],[-35,0.5,15],100);
    self.buildKinematic(scene,[1,30,1],[-35,0.5,20],100);
    self.buildKinematic(scene,[1,30,1],[-35,0.5,25],100);
    self.buildKinematic(scene,[1,30,1],[-35,0.5,30],100);

    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,40],100);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,46],100);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,50],100);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,55],100);

    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,70],100,[0,0.1,0]);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,80],100,[0,-0.1,0]);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,90],100,[0,0.2,0]);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,100],100,[0,-0.2,0]);

    // Magnetic blocks to pickup
    self.buildMagnetic(scene, [0.5,2,2], [0, 0, -80]);

    self.buildMagnetic(scene, [0.5,2,2], [30, 0, -119]);
    self.buildMagnetic(scene, [0.5,2,2], [27, 0, -118]);
    self.buildMagnetic(scene, [0.5,2,2], [27, 0, -128]);
    self.buildMagnetic(scene, [0.5,2,2], [32, 0, -125]);

    // Wall around magnetic blocks
    self.buildStatic(scene,[3,30,1],[0,1.5,-150]);
    self.buildStatic(scene,[3,30,1],[0,1.5,-180]);
    self.buildStatic(scene,[3,1,30],[-15,1.5,-165]);
    self.buildStatic(scene,[3,1,30],[15,1.5,-165]);

    self.buildMagnetic(scene, [0.5,2,2], [-3, 0, -157]);
    self.buildMagnetic(scene, [0.5,2,2], [5, 0, -160]);
    self.buildMagnetic(scene, [0.5,2,2], [0, 0, -170]);
    self.buildMagnetic(scene, [0.5,2,2], [-9, 0, -165]);
    self.buildMagnetic(scene, [0.5,2,2], [7, 0, -171]);

    // Tower for magnetic blocks
    self.buildStatic(scene,[12,30,1],[-50,6,-150]);
    self.buildStatic(scene,[12,30,1],[-50,6,-180]);
    self.buildStatic(scene,[12,1,30],[-65,6,-165]);
    self.buildStatic(scene,[12,1,30],[-35,6,-165]);

    self.buildStatic(scene,[11,30,30],[-50,6,-165]);

    self.buildMagnetic(scene, [0.5,2,2], [-51, 13, -155]);
    self.buildMagnetic(scene, [0.5,2,2], [-48, 13, -167]);
    self.buildMagnetic(scene, [0.5,2,2], [-53, 13, -165]);
  };

  this.loadMaterials = function(scene) {
    self.kinematicMat = new BABYLON.StandardMaterial('kinematicMat', scene);
    self.kinematicMat.diffuseColor = new BABYLON.Color3(0.64, 0.2, 0.64);
    self.kinematicMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    self.staticMat = new BABYLON.StandardMaterial('staticMat', scene);
    self.staticMat.diffuseColor = new BABYLON.Color3(0.64, 0.64, 0.20);
    self.staticMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    self.magneticMat = new BABYLON.StandardMaterial('magneticMat', scene);
    self.magneticMat.diffuseColor = new BABYLON.Color3(0, 0, 0.80);
    self.magneticMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  }

  this.buildMagnetic = function(scene, dim, pos, mass=10) {
    var m1 = BABYLON.MeshBuilder.CreateBox('metal1', {height: dim[0], width: dim[1], depth: dim[2]}, scene);
    m1.isMagnetic = true;
    m1.material = self.magneticMat;
    m1.position.x = pos[0];
    m1.position.y = pos[1];
    m1.position.z = pos[2];
    m1.physicsImpostor = new BABYLON.PhysicsImpostor(
      m1,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: mass, friction: 0.5 },
      scene
    );
    m1.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
  };

  // static object builder
  this.buildStatic = function(scene, dim, pos, rot=[0,0,0], friction=self.options.staticObjectFriction, restitution=self.options.staticObjectRestitution) {
    var ramp = BABYLON.MeshBuilder.CreateBox('ramp', {height: dim[0], width: dim[1], depth: dim[2]}, scene);
    ramp.position.x = pos[0];
    ramp.position.y = pos[1];
    ramp.position.z = pos[2];
    ramp.rotation.x = rot[0];
    ramp.rotation.y = rot[1];
    ramp.rotation.z = rot[2];
    ramp.material = self.staticMat;

    ramp.physicsImpostor = new BABYLON.PhysicsImpostor(
      ramp,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        friction: friction,
        restitution: restitution
      },
      scene
    );
  };

  // kinematic object builder
  this.buildKinematic = function(scene, dim, pos, mass=200, rot=[0,0,0], friction=self.options.kinematicObjectFriction, restitution=self.options.kinematicObjectRestitution) {
    var block = BABYLON.MeshBuilder.CreateBox('block', {height: dim[0], width: dim[1], depth: dim[2]}, scene);
    block.position.x = pos[0];
    block.position.y = pos[1];
    block.position.z = pos[2];
    block.rotation.x = rot[0];
    block.rotation.y = rot[1];
    block.rotation.z = rot[2];
    block.material = self.kinematicMat;

    block.physicsImpostor = new BABYLON.PhysicsImpostor(
      block,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: mass,
        friction: friction,
        restitution: restitution
      },
      scene
    );
  }

}

// Init class
world_Test.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Test);