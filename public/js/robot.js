function Wheel() {
  var self = this;

  this.mesh = null;
  this.joint = null;

  this.STOP_ACTION_BRAKE_FORCE = 1000;
  this.STOP_ACTION_COAST_FORCE = 100;
  this.STOP_ACTION_HOLD_FORCE = 1500;
  this.MOTOR_POWER_DEFAULT = 1500;

  this.speed_sp = 1050;
  this.stop_action = 'hold';

  this.runForever = function() {
    let speed = -self.speed_sp / 180 * Math.PI;
    self.joint.setMotor(speed, self.MOTOR_POWER_DEFAULT);
  }

  this.stop = function() {
    if (self.stop_action == 'hold') {
      self.joint.setMotor(0, self.STOP_ACTION_HOLD_FORCE);
    } else if (self.stop_action == 'brake') {
      self.joint.setMotor(0, self.STOP_ACTION_BRAKE_FORCE);
    } else {
      self.joint.setMotor(0, self.STOP_ACTION_COAST_FORCE);
    }
  }
}

var robot = new function() {
  var self = this;

  this.options = {
    wheelDiameter: 5.6,
    wheelWidth: 2.8,
    wheelToBodyOffset: 0.2,
    bodyHeight: 5,
    bodyWidth: 10,
    bodyLength: 15,
    bodyEdgeToWheelCenterY: 1,
    bodyEdgeToWheelCenterZ: 1,

    bodyMass: 1000,
    wheelMass: 200,
    casterMass: 400, // Warning: No effect due to parenting

    wheelFriction: 2,
    bodyFriction: 0.1,
    casterFriction: 0 // Warning: No effect due to parenting
  };

  this.robot = {
    body: null,
    leftWheel: new Wheel(),
    rightWheel: new Wheel()
  }

  // Run on page load
  this.init = function() {
  };

  // Create the scene
  this.load = function (scene, robotStart) {
    var options = self.options;

    return new Promise(function(resolve, reject) {
      var startPos = new BABYLON.Vector3(0,0,0);
      if (typeof robotStart != 'undefined') {
        if (typeof robotStart.position != 'undefined') {
          startPos = robotStart.position;
        }
      }

      // Body
      var bodyMat = new BABYLON.StandardMaterial('wheel', scene);
      bodyMat.diffuseColor = new BABYLON.Color3(0.94, 0.61, 0.05);
      bodyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      let bodyOptions = {
        height: options.bodyHeight,
        width: options.bodyWidth,
        depth: options.bodyLength
      }
      var body = BABYLON.MeshBuilder.CreateBox('body', bodyOptions, scene);
      self.robot.body = body;
      body.material = bodyMat;
      body.visibility = 1;
      body.position.x = 0;
      body.position.y = (options.bodyHeight / 2) + (options.wheelDiameter / 2) - options.bodyEdgeToWheelCenterY;
      body.position.z = -(options.bodyLength / 2) + options.bodyEdgeToWheelCenterZ;
      scene.shadowGenerator.addShadowCaster(body);
      body.position.addInPlace(startPos);

      // Rear caster
      let casterOptions = {
        diameter: options.wheelDiameter,
        segments: 5
      }
      var caster = BABYLON.MeshBuilder.CreateSphere("sphere", casterOptions, scene);
      caster.position.y = -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY;
      caster.position.z = -(options.bodyLength / 2) + (options.wheelDiameter / 2);
      scene.shadowGenerator.addShadowCaster(caster);
      caster.parent = body;

      // Wheels
      var wheelMat = new BABYLON.StandardMaterial('wheel', scene);
      var wheelTexture = new BABYLON.Texture('textures/robot/wheel.png', scene);
      wheelMat.diffuseTexture = wheelTexture;
      wheelMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

      var faceUV = new Array(3);
      faceUV[0] = new BABYLON.Vector4(0, 0, 200/828, 1);
      faceUV[1] = new BABYLON.Vector4(200/828, 3/4, 1, 1);
      faceUV[2] = new BABYLON.Vector4(0, 0, 200/828, 1);
      let wheelOptions = {
        height: options.wheelWidth,
        diameter: options.wheelDiameter,
        tessellation: 48,
        faceUV: faceUV
      };

      var wheelLeft = BABYLON.MeshBuilder.CreateCylinder("wheelLeft", wheelOptions, scene);
      self.robot.leftWheel.mesh = wheelLeft;
      wheelLeft.material = wheelMat;
      wheelLeft.rotation.z = -Math.PI / 2;
      wheelLeft.position.x = -(options.wheelWidth + options.bodyWidth) / 2 - options.wheelToBodyOffset;
      wheelLeft.position.y = options.wheelDiameter / 2;
      scene.shadowGenerator.addShadowCaster(wheelLeft);
      wheelLeft.position.addInPlace(startPos);

      var wheelRight = BABYLON.MeshBuilder.CreateCylinder("wheelRight", wheelOptions, scene);
      self.robot.rightWheel.mesh = wheelRight;
      wheelRight.material = wheelMat;
      wheelRight.rotation.z = -Math.PI / 2;
      wheelRight.position.x = (options.wheelWidth + options.bodyWidth) / 2 + options.wheelToBodyOffset;
      wheelRight.position.y = options.wheelDiameter / 2;
      scene.shadowGenerator.addShadowCaster(wheelRight);
      wheelRight.position.addInPlace(startPos);

      // Add Physics
      caster.physicsImpostor = new BABYLON.PhysicsImpostor(
        caster,
        BABYLON.PhysicsImpostor.SphereImpostor,
        {
          mass: options.casterMass,
          restitution: 0.0,
          friction: options.casterFriction
        },
        scene
      );
      body.physicsImpostor = new BABYLON.PhysicsImpostor(
        body,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: options.bodyMass,
          restitution: 0.4,
          friction: options.bodyFriction
        },
        scene
      );
      wheelLeft.physicsImpostor = new BABYLON.PhysicsImpostor(
        wheelLeft,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        {
          mass: options.wheelMass,
          restitution: 0.8,
          friction: options.wheelFriction
        },
        scene
      );
      wheelRight.physicsImpostor = new BABYLON.PhysicsImpostor(
        wheelRight,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        {
          mass: options.wheelMass,
          restitution: 0.8,
          friction: options.wheelFriction
        },
        scene
      );

      var jointLeftWheel = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(
          -(options.bodyWidth / 2) - options.wheelToBodyOffset - options.wheelWidth / 2,
          -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
          options.bodyLength / 2 - options.bodyEdgeToWheelCenterZ
        ),
        connectedPivot: new BABYLON.Vector3(0, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(0, 1, 0),
      });
      body.physicsImpostor.addJoint(wheelLeft.physicsImpostor, jointLeftWheel);
      self.robot.leftWheel.joint = jointLeftWheel;

      var jointRightWheel = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(
          (options.bodyWidth / 2) + options.wheelToBodyOffset + options.wheelWidth / 2,
          -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
          options.bodyLength / 2 - options.bodyEdgeToWheelCenterZ
        ),
        connectedPivot: new BABYLON.Vector3(0, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(0, 1, 0),
      });
      body.physicsImpostor.addJoint(wheelRight.physicsImpostor, jointRightWheel);
      self.robot.rightWheel.joint = jointRightWheel;

      resolve();
    });
  };
}

// Init class
robot.init();
