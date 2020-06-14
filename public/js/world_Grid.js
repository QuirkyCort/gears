var world_Grid = new function() {
  var self = this;

  this.name = 'grid';
  this.shortDescription = 'Grid Map (20cm)';

  this.options = {
    image: 'textures/maps/grid.png',
    length: 400,
    width: 400,
    wallHeight: 10,
    wallThickness: 5,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1
  };
  this.robotStart = {
    // position: new BABYLON.Vector3(105, 0, -40)
  };

  // Run on page load
  this.init = function() {
  };

  // Create the scene
  this.load = function (scene) {
    return new Promise(function(resolve, reject) {
      self.loadBaseMap(scene);
      resolve();
    });
  };

  // Base map
  this.loadBaseMap = function(scene) {
    var options = self.options;

    var groundMat = new BABYLON.StandardMaterial('ground', scene);
    var groundTexture = new BABYLON.Texture(options.image, scene);
    groundMat.diffuseTexture = groundTexture;
    groundMat.diffuseTexture.uScale = options.width / 20;
    groundMat.diffuseTexture.vScale = options.length / 20;
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    var boxOptions = {
        width: options.length,
        height: 10,
        depth: options.width,
        faceUV: faceUV
    };

    var ground = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.position.y = -5;

    var wallMat = new BABYLON.StandardMaterial('wallMat', scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.64, 0.64, 0.64);
    wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    let wall1 = {
      height: options.wallHeight + 10,
      width: options.length + options.wallThickness * 2,
      depth: options.wallThickness
    }

    var wallTop = BABYLON.MeshBuilder.CreateBox('wallTop', wall1, scene);
    wallTop.position.y = wall1.height / 2 - 10;
    wallTop.position.z = (options.width + options.wallThickness) / 2;
    wallTop.material = wallMat;

    var wallBottom = BABYLON.MeshBuilder.CreateBox('wallBottom', wall1, scene);
    wallBottom.position.y = wall1.height / 2 - 10;
    wallBottom.position.z = -(options.width + options.wallThickness) / 2;
    wallBottom.material = wallMat;

    let wall2 = {
      height: options.wallHeight + 10,
      width: options.wallThickness,
      depth: options.width
    }

    var wallLeft = BABYLON.MeshBuilder.CreateBox('wallLeft', wall2, scene);
    wallLeft.position.y = wall1.height / 2 - 10;
    wallLeft.position.x = -(options.length + options.wallThickness) / 2;
    wallLeft.material = wallMat;

    var wallRight = BABYLON.MeshBuilder.CreateBox('wallRight', wall2, scene);
    wallRight.position.y = wall1.height / 2 - 10;
    wallRight.position.x = (options.length + options.wallThickness) / 2;
    wallRight.material = wallMat;

    // Physics
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        friction: options.groundFriction,
        restitution: options.groundRestitution
      },
      scene
    );

    var wallOptions = {
      mass: 0,
      friction: options.wallFriction,
      restitution: options.wallRestitution
    };
    wallTop.physicsImpostor = new BABYLON.PhysicsImpostor(
      wallTop,
      BABYLON.PhysicsImpostor.BoxImpostor,
      wallOptions,
      scene
    );
    wallBottom.physicsImpostor = new BABYLON.PhysicsImpostor(
      wallBottom,
      BABYLON.PhysicsImpostor.BoxImpostor,
      wallOptions,
      scene
    );
    wallLeft.physicsImpostor = new BABYLON.PhysicsImpostor(
      wallLeft,
      BABYLON.PhysicsImpostor.BoxImpostor,
      wallOptions,
      scene
    );
    wallRight.physicsImpostor = new BABYLON.PhysicsImpostor(
      wallRight,
      BABYLON.PhysicsImpostor.BoxImpostor,
      wallOptions,
      scene
    );
  }
}

// Init class
world_Grid.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Grid);