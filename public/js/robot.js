function Wheel(scene, options) {
  var self = this;

  this.mesh = null;
  this.joint = null;

  this.STOP_ACTION_BRAKE_FORCE = 1000;
  this.STOP_ACTION_COAST_FORCE = 100;
  this.STOP_ACTION_HOLD_FORCE = 1500;
  this.MOTOR_POWER_DEFAULT = 1500;

  this.modes = {
    STOP: 1,
    RUN: 2,
    RUN_TO_POS: 2,
    RUN_TIL_TIME: 3
  };

  this.speed_sp = 1050;
  this.stop_action = 'hold';
  this.position = 0;

  this.mode = this.modes.STOP;
  this.actualPosition = 0;
  this.positionAdjustment = 0;
  this.rotationRounds = 0;
  this.prevRotation = 0;
  this.angularVelocity = 0;
  this.s = null;

  //
  // Accessed by through Python
  //
  this.runForever = function() {
    self.mode = self.modes.RUN;

    let speed = -self.speed_sp / 180 * Math.PI;
    self.joint.setMotor(speed, self.MOTOR_POWER_DEFAULT);
  };

  this.stop = function() {
    self.mode = self.modes.STOP;

    if (self.stop_action == 'hold') {
      self.joint.setMotor(0, self.STOP_ACTION_HOLD_FORCE);
    } else if (self.stop_action == 'brake') {
      self.joint.setMotor(0, self.STOP_ACTION_BRAKE_FORCE);
    } else {
      self.joint.setMotor(0, self.STOP_ACTION_COAST_FORCE);
    }
  };

  //
  // Used in JS
  //
  this.load = function(pos, startPos, body, pivot) {
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

    self.mesh = BABYLON.MeshBuilder.CreateCylinder("wheel", wheelOptions, scene);
    self.mesh.material = wheelMat;
    self.mesh.rotation.z = -Math.PI / 2;
    self.mesh.position.x = pos[0];
    self.mesh.position.y = pos[1];
    self.mesh.position.z = pos[2];
    scene.shadowGenerator.addShadowCaster(self.mesh);
    self.mesh.position.addInPlace(startPos);
    self.s = new BABYLON.Quaternion.FromEulerAngles(0,0,self.mesh.rotation.z);

    self.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.mesh,
      BABYLON.PhysicsImpostor.CylinderImpostor,
      {
        mass: options.wheelMass,
        restitution: 0.8,
        friction: options.wheelFriction
      },
      scene
    );

    self.joint = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
      mainPivot: pivot,
      connectedPivot: new BABYLON.Vector3(0, 0, 0),
      mainAxis: new BABYLON.Vector3(1, 0, 0),
      connectedAxis: new BABYLON.Vector3(0, 1, 0),
    });
    body.physicsImpostor.addJoint(self.mesh.physicsImpostor, self.joint);
  };

  this.render = function(delta) {
    self.updatePosition();
  };

  this.updatePosition = function(delta) {
    let e = self.mesh.rotationQuaternion;
    let rot = self.getRotation(this.s, e) / Math.PI * 180;

    if (! isNaN(rot)) {
      if (rot - self.prevRotation > 180) {
        self.rotationRounds -= 1;
      } else if (rot - self.prevRotation < -180) {
        self.rotationRounds += 1;
      }
      self.prevRotation = rot;

      let position = self.rotationRounds * 360 + rot;
      self.angularVelocity = (position - self.actualPosition) / delta * 1000;
      self.actualPosition = position;
      self.position = position - self.positionAdjustment;
    }
  };

  this.getRotation = function(s, e) {
    r = e.multiply(BABYLON.Quaternion.Inverse(s));

    var axis0 = new BABYLON.Quaternion(0,1,0,0);
    var axis1 = s.multiply(axis0).multiply(BABYLON.Quaternion.Inverse(s));
    axis2 = e.multiply(axis0).multiply(BABYLON.Quaternion.Inverse(e));

    var v1 = new BABYLON.Vector3(axis1.x, axis1.y, axis1.z);
    var v2 = new BABYLON.Vector3(axis2.x, axis2.y, axis2.z);
    v1.normalize();
    v2.normalize();

    var q1_xyz = v1.cross(v2);
    q1_dot = BABYLON.Vector3.Dot(v1, v2);
    var q1_w = 1 + q1_dot;
    q1 = new BABYLON.Quaternion(q1_xyz.x, q1_xyz.y, q1_xyz.z, q1_w);
    q1.normalize();
    q2 = BABYLON.Quaternion.Inverse(r).multiply(q1);
    q2.normalize();
    var d = 2 * Math.acos(q2.w);

    var q2_xyz = new BABYLON.Vector3(q2.x, q2.y, q2.z);
    q2_xyz.normalize();

    var flip = false;
    if (BABYLON.Vector3.Dot(q2_xyz, v2) > 0) {
      flip = !flip;
    }
    if (q1_dot < 0) {
      flip = !flip;
    }

    if (flip) {
      return 2 * Math.PI - d;
    } else {
      return d;
    }
  };
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

  this.body = null;
  this.leftWheel = null;
  this.rightWheel = null;

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
      self.body = body;
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

      // Wheels
      self.leftWheel = new Wheel(scene, options);
      self.rightWheel = new Wheel(scene, options);
      self.leftWheel.load(
        [
          -(options.wheelWidth + options.bodyWidth) / 2 - options.wheelToBodyOffset,
          options.wheelDiameter / 2,
          0
        ],
        startPos,
        body,
        new BABYLON.Vector3(
          -(options.bodyWidth / 2) - options.wheelToBodyOffset - options.wheelWidth / 2,
          -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
          options.bodyLength / 2 - options.bodyEdgeToWheelCenterZ
        )
      );
      self.rightWheel.load(
        [
          (options.wheelWidth + options.bodyWidth) / 2 - options.wheelToBodyOffset,
          options.wheelDiameter / 2,
          0
        ],
        startPos,
        body,
        new BABYLON.Vector3(
          (options.bodyWidth / 2) + options.wheelToBodyOffset + options.wheelWidth / 2,
          -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
          options.bodyLength / 2 - options.bodyEdgeToWheelCenterZ
        )
      );
      self.leftWheel.stop();
      self.rightWheel.stop();


      resolve();
    });
  };

  // Render loop
  this.render = function(delta) {
    self.leftWheel.render(delta);
    self.rightWheel.render(delta);
  };
}

// Init class
robot.init();
