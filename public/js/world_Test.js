var world_Test = new function() {
  var self = this;

  this.name = 'test';
  this.shortDescription = 'Test Arena';

  this.options = {
    staticObjectFriction: 1,
    kinematicObjectFriction: .8,
    staticObjectRestitution: 0.0,
    kinematicObjectRestitution: 0.1
  };
  this.robotStart = {
    position: new BABYLON.Vector3(0, 0, 0) // Ramp 1, 18 degrees
    // position: new BABYLON.Vector3(35, 0, 0) // Ramp 2, 36 degrees
    // position: new BABYLON.Vector3(70, 0, 0) // Ramp 3, 45 degrees
    // position: new BABYLON.Vector3(105, 0, 0) // Ramp 3, 18 degrees, 0.1 friction

    // position: new BABYLON.Vector3(140, 0, 0) // static bumps
    // position: new BABYLON.Vector3(-35, 0, 0) // kinematic bumps

    // position: new BABYLON.Vector3(-70, 0, 0) // Object 1, weight 800
    // position: new BABYLON.Vector3(-105, 0, 0) // Object 2, weight 1600
    // position: new BABYLON.Vector3(-140, 0, 0) // Tower
    // position: new BABYLON.Vector3(-175, 0, 0) // Wall
  };

  // Run on page load
  this.init = function() {
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      world_Grid.loadBaseMap(scene);
      self.loadStatic(scene);
      self.loadKinematic(scene);
      resolve();
    });
  };

  // Additional static objects
  this.loadStatic = function (scene) {
    self.buildStatic(scene,[40,30,20],[0,-5,20],[Math.PI*0.4,0,0]);
    self.buildStatic(scene,[40,30,20],[35,-5,20],[Math.PI*0.3,0,0]);
    self.buildStatic(scene,[40,30,20],[70,-5,20],[Math.PI*0.25,0,0]);
    self.buildStatic(scene,[40,30,20],[105,-5,20],[Math.PI*0.4,0,0],0.1);

    // bumps
    self.buildStatic(scene,[1,30,1],[140,0.5,15]);
    self.buildStatic(scene,[1,30,1],[140,0.5,20]);
    self.buildStatic(scene,[1,30,1],[140,0.5,25]);
    self.buildStatic(scene,[1,30,1],[140,0.5,30]);

    self.buildStatic(scene,[1.5,30,1.5],[140,0.75,40]);
    self.buildStatic(scene,[1.5,30,1.5],[140,0.75,46]);
    self.buildStatic(scene,[1.5,30,1.5],[140,0.75,50]);
    self.buildStatic(scene,[1.5,30,1.5],[140,0.75,55]);

    self.buildStatic(scene,[1,30,1.5],[140,0.5,70],[0,0.1,0]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,80],[0,-0.1,0]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,90],[0,0.2,0]);
    self.buildStatic(scene,[1,30,1.5],[140,0.5,100],[0,-0.2,0]);
  };

  // Additional kinematic objects
  this.loadKinematic = function (scene) {
    self.buildKinematic(scene,[8,8,8],[-70,4,20],800);
    self.buildKinematic(scene,[8,8,8],[-105,4,20],1600);

    // Tower
    self.buildKinematic(scene,[8,8,8],[-140,4,40],400);
    self.buildKinematic(scene,[8,8,8],[-140,12,40],400);
    self.buildKinematic(scene,[8,8,8],[-140,20,40],400);

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

    // bumps
    self.buildKinematic(scene,[1,30,1],[-35,0.5,15],100);
    self.buildKinematic(scene,[1,30,1],[-35,0.5,20],100);
    self.buildKinematic(scene,[1,30,1],[-35,0.5,25],100);
    self.buildKinematic(scene,[1,30,1],[-35,0.5,30],100);

    self.buildKinematic(scene,[1.5,30,1.5],[-35,0.75,40],100);
    self.buildKinematic(scene,[1.5,30,1.5],[-35,0.75,46],100);
    self.buildKinematic(scene,[1.5,30,1.5],[-35,0.75,50],100);
    self.buildKinematic(scene,[1.5,30,1.5],[-35,0.75,55],100);

    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,70],100,[0,0.1,0]);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,80],100,[0,-0.1,0]);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,90],100,[0,0.2,0]);
    self.buildKinematic(scene,[1,30,1.5],[-35,0.5,100],100,[0,-0.2,0]);
  };

  // static object builder
  this.buildStatic = function(scene, dim, pos, rot=[0,0,0], friction=self.options.staticObjectFriction, restitution=self.options.staticObjectRestitution) {
    var staticMat = new BABYLON.StandardMaterial('staticMat', scene);
    staticMat.diffuseColor = new BABYLON.Color3(0.64, 0.64, 0.20);
    staticMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var ramp = BABYLON.MeshBuilder.CreateBox('ramp', {height: dim[0], width: dim[1], depth: dim[2]}, scene);
    ramp.position.x = pos[0];
    ramp.position.y = pos[1];
    ramp.position.z = pos[2];
    ramp.rotation.x = rot[0];
    ramp.rotation.y = rot[1];
    ramp.rotation.z = rot[2];
    ramp.material = staticMat;

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
    var kinematicMat = new BABYLON.StandardMaterial('kinematicMat', scene);
    kinematicMat.diffuseColor = new BABYLON.Color3(0.64, 0.2, 0.64);
    kinematicMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var block = BABYLON.MeshBuilder.CreateBox('block', {height: dim[0], width: dim[1], depth: dim[2]}, scene);
    block.position.x = pos[0];
    block.position.y = pos[1];
    block.position.z = pos[2];
    block.rotation.x = rot[0];
    block.rotation.y = rot[1];
    block.rotation.z = rot[2];
    block.material = kinematicMat;

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