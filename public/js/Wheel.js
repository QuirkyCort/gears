function Wheel(scene, parent, pos, rot, port, options) {
  var self = this;

  this.parent = parent;

  this.type = 'WheelActuator';
  this.port = port;
  this.options = null;

  this.components = [];

  this.bodyPosition = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
  this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
  this.initialQuaternion = new BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

  this.bodyVector = null;
  this.wheelVector = null;

  this.mesh = null;
  this.joint = null;

  this.STOP_ACTION_BRAKE_FORCE = 2000;
  this.STOP_ACTION_COAST_FORCE = 1000;
  this.STOP_ACTION_HOLD_FORCE = 30000;
  this.MOTOR_POWER_DEFAULT = 30000;
  this.MAX_SPEED = 800 / 180 * Math.PI;
  this.MAX_ACCELERATION = 20;  // degrees / msec^2
  this.TIRE_DOWNWARDS_FORCE = -4000;

  this.modes = {
    STOP: 1,
    RUN: 2,
    RUN_TO_POS: 3,
    RUN_TIL_TIME: 4
  };
  //this.state = '';
  this.states = {
    RUNNING: 'running',
    RAMPING: 'ramping',
    HOLDING: 'holding',
    OVERLOADED: 'overloaded',
    STATE_STALLED: 'stalled',
    NONE: ''
  };
  this.state = this.states.HOLDING;

  this.speed_sp = 0;
  this._speed_sp = 0;
  this.stop_action = 'hold';
  this.position = 0;
  this.speed = 0;

  this.position_target = 0;
  this.prevPosition = 0;
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
  };

  this.runTimed = function() {
    self.mode = self.modes.RUN_TIL_TIME;
  };

  this.runToPosition = function() {
    if (self.position_target < self.position) {
      self.positionDirectionReversed = true;
    } else {
      self.positionDirectionReversed = false;
    }
    self.mode = self.modes.RUN_TO_POS;
  };

  this.stop = function() {
    self.mode = self.modes.STOP;

    if (self.stop_action == 'hold') {
      self.joint.setMotor(0, self.stopActionHoldForce);
      self.state = self.states.HOLDING;
      self.position_target = self.position;
    } else if (self.stop_action == 'brake') {
      self.joint.setMotor(0, self.STOP_ACTION_BRAKE_FORCE);
      self.state = self.states.NONE;
    } else {
      self.joint.setMotor(0, self.STOP_ACTION_COAST_FORCE);
      self.state = self.states.NONE;
    }
  };

  this.init = function() {
    self.setOptions(options);

    self.maxAcceleration = self.options.maxAcceleration;
    self.stopActionHoldForce = self.options.stopActionHoldForce;
    self.TIRE_DOWNWARDS_FORCE = new BABYLON.Vector3(0, self.options.tireDownwardsForce, 0);

    var wheelMat = scene.getMaterialByID('wheel');
    if (wheelMat == null) {
      var wheelMat = new BABYLON.StandardMaterial('wheel', scene);
      var wheelTexture = new BABYLON.Texture('textures/robot/wheel.png', scene);
      wheelMat.diffuseTexture = wheelTexture;
      wheelMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      wheelMat.freeze();
    }

    var faceUV = new Array(3);
    faceUV[0] = new BABYLON.Vector4(0, 0, 200/828, 1);
    faceUV[1] = new BABYLON.Vector4(200/828, 3/4, 1, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0, 200/828, 1);
    let wheelOptions = {
      height: self.options.width,
      diameter: self.options.diameter,
      tessellation: 24,
      faceUV: faceUV
    };

    self.mesh = BABYLON.MeshBuilder.CreateCylinder('wheel', wheelOptions, scene);
    self.body = self.mesh;
    self.end = self.mesh;
    self.body.component = self;
    self.mesh.material = wheelMat;

    self.mesh.parent = parent;
    self.mesh.position = self.bodyPosition;
    self.mesh.rotation.z = -Math.PI / 2;
    self.mesh.rotate(BABYLON.Axis.Y, rot[1], BABYLON.Space.LOCAL);
    self.mesh.rotate(BABYLON.Axis.X, rot[0], BABYLON.Space.LOCAL);
    self.mesh.rotate(BABYLON.Axis.Z, rot[2], BABYLON.Space.LOCAL);
    parent.removeChild(self.mesh);

    scene.shadowGenerator.addShadowCaster(self.mesh);
  };

  this.loadImpostor = function(){
    self.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      self.mesh,
      BABYLON.PhysicsImpostor.CylinderImpostor,
      {
        mass: options.mass,
        restitution: options.restitution,
        friction: options.friction
      },
      scene
    );

    // Hold position if speed is too low
    var origin = self.mesh.physicsImpostor.physicsBody.getWorldTransform().getOrigin();
    var lastOrigin = [
        origin.x(),
        origin.y(),
        origin.z()
    ];

    self.mesh.physicsImpostor.registerBeforePhysicsStep(function(){
      if (self.mesh.physicsImpostor.getLinearVelocity().lengthSquared() < 0.1) {
        origin.setX(lastOrigin[0]);
        origin.setY(lastOrigin[1]);
        origin.setZ(lastOrigin[2]);
      } else {
        lastOrigin = [
          origin.x(),
          origin.y(),
          origin.z()
        ];
      }
    });
  };

  this.loadJoints = function(){
    var wheel2world = self.mesh.absoluteRotationQuaternion;

    let zero = BABYLON.Vector3.Zero();
    var world2body = parent.absoluteRotationQuaternion;
    world2body = BABYLON.Quaternion.Inverse(world2body);

    var mainPivot = self.mesh.position.subtract(parent.position);
    mainPivot.rotateByQuaternionAroundPointToRef(world2body, zero, mainPivot);

    var mainAxis = new BABYLON.Vector3(0, 1, 0);
    mainAxis.rotateByQuaternionAroundPointToRef(wheel2world, zero, mainAxis);
    mainAxis.rotateByQuaternionAroundPointToRef(world2body, zero, mainAxis);

    self.wheelVector = new BABYLON.Vector3(1,0,0);
    self.bodyVector = new BABYLON.Vector3(0,0,0);
    self.wheelVector.rotateByQuaternionAroundPointToRef(wheel2world, zero, self.bodyVector);
    self.bodyVector.rotateByQuaternionAroundPointToRef(world2body, zero, self.bodyVector);
    self.normalVector = new BABYLON.Vector3(0,1,0)

    let targetBody = parent;
    while (targetBody.parent) {
      mainPivot.addInPlace(targetBody.position);
      targetBody = targetBody.parent;
    }

    self.joint = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
      mainPivot: mainPivot,
      connectedPivot: new BABYLON.Vector3(0, 0, 0),
      mainAxis: mainAxis,
      connectedAxis: new BABYLON.Vector3(0, 1, 0),
    });
    targetBody.physicsImpostor.addJoint(self.mesh.physicsImpostor, self.joint);
  };

  this.setOptions = function(options) {
    self.options = {
      diameter: 5.6,
      width: 0.8,
      mass: 200,
      friction: 10,
      restitution: 0.8,
      maxAcceleration: self.MAX_ACCELERATION,
      stopActionHoldForce: self.STOP_ACTION_HOLD_FORCE,
      tireDownwardsForce: self.TIRE_DOWNWARDS_FORCE,
      components: []
    };

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }
  };

  this.reset = function() {
    self.positionAdjustment += self.position;
    self.position = 0;
    self.position_target = 0;
    self.mode = self.modes.STOP;
    self.state = self.states.HOLDING;
  };

  //
  // Used in JS
  //

  this.render = function(delta) {
    if (
      typeof self.mesh == 'undefined' ||
      self.mesh == null ||
      typeof self.mesh.physicsImpostor == 'undefined'
      || self.mesh.physicsImpostor == null
    ) {
      return;
    }

    self.mesh.physicsImpostor.applyForce(self.TIRE_DOWNWARDS_FORCE, self.mesh.getAbsolutePosition());
    if (self.mode == self.modes.RUN) {
      self.setMotorSpeed(delta);
    } else if (self.mode == self.modes.RUN_TIL_TIME) {
      self.setMotorSpeed(delta);
      if (Date.now() > self.time_target) {
        self.stop();
      }
    } else if (self.mode == self.modes.RUN_TO_POS) {
      self.setMotorSpeed(delta, self.positionDirectionReversed);
      if (
        (self.positionDirectionReversed == false && self.position >= self.position_target) ||
        (self.positionDirectionReversed && self.position <= self.position_target)
      ) {
        self.stop();
      }
    } else if (self.state == self.states.HOLDING) {
      self.holdPosition(delta);
    }

    self.updatePosition(delta);
    if (delta == 0) {
      self.speed = 0;
    } else {
      self.speed = 0.8 * self.speed + 0.2 * ((self.position - self.prevPosition) / delta * 1000);
    }
    self.prevPosition = self.position;

    self.components.forEach(function(component) {
      if (typeof component.render == 'function') {
        component.render(delta);
      }
    });
  };

  this.holdPosition = function(delta) {
    const P_GAIN = 0.1;
    const MAX_POSITION_CORRECTION_SPEED = 5;
    let error = self.position_target - self.position;
    let speed = -error * P_GAIN;

    if (speed > MAX_POSITION_CORRECTION_SPEED) {
      speed = MAX_POSITION_CORRECTION_SPEED;
    } else if (speed < -MAX_POSITION_CORRECTION_SPEED) {
      speed = -MAX_POSITION_CORRECTION_SPEED;
    } else if (speed < 1) {
      // speed = 0;
    }
    self.joint.setMotor(speed, self.stopActionHoldForce);
  };

  this.setMotorSpeed = function(delta, reversed=false) {
    let diff = self.speed_sp - self._speed_sp;
    let diffLimit = delta * self.maxAcceleration;
    if (diff > diffLimit) {
      self._speed_sp += diffLimit;
      self.state = self.states.RAMPING;
    } else if (diff < -diffLimit) {
      self._speed_sp -= diffLimit;
      self.state = self.states.RAMPING;
    } else {
      self._speed_sp = self.speed_sp;
      self.state = self.states.RUNNING;
    }

    let speed = -self._speed_sp / 180 * Math.PI;
    if (speed > self.MAX_SPEED) {
      speed = self.MAX_SPEED;
    } else if (speed < -self.MAX_SPEED) {
      speed = -self.MAX_SPEED;
    }
    if (reversed) {
      speed = -speed;
    }
    self.joint.setMotor(speed, self.MOTOR_POWER_DEFAULT);
  };

  this.updatePosition = function(delta) {
    let e = self.mesh.rotationQuaternion;
    let rot = self.getRotation(self.s, e) / Math.PI * 180;

    if (rot - self.prevRotation > 180) {
      self.rotationRounds -= 1;
    } else if (rot - self.prevRotation < -180) {
      self.rotationRounds += 1;
    }
    prevRotation = self.prevRotation
    self.prevRotation = rot;

    let position = self.rotationRounds * 360 + rot;
    self.angularVelocity = (position - self.actualPosition) / delta * 1000;
    self.actualPosition = position;
    self.position = position - self.positionAdjustment;
  };

  this.getRotation = function(){
    let rotatedBodyVector = new BABYLON.Vector3(0,0,0);
    let rotatedWheelVector = new BABYLON.Vector3(0,0,0);
    let rotatedNormalVector = new BABYLON.Vector3(0,0,0);
    let zero = BABYLON.Vector3.Zero();

    this.bodyVector.rotateByQuaternionAroundPointToRef(parent.absoluteRotationQuaternion, zero, rotatedBodyVector);
    this.wheelVector.rotateByQuaternionAroundPointToRef(self.mesh.absoluteRotationQuaternion, zero, rotatedWheelVector);
    this.normalVector.rotateByQuaternionAroundPointToRef(self.mesh.absoluteRotationQuaternion, zero, rotatedNormalVector);

    return BABYLON.Vector3.GetAngleBetweenVectors(rotatedBodyVector, rotatedWheelVector, rotatedNormalVector);
  };

  this.init();
}