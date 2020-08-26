function Wheel(scene, options) {
  var self = this;

  this.mesh = null;
  this.joint = null;

  this.STOP_ACTION_BRAKE_FORCE = 2000;
  this.STOP_ACTION_COAST_FORCE = 1000;
  this.STOP_ACTION_HOLD_FORCE = 30000;
  this.MOTOR_POWER_DEFAULT = 30000;
  this.MAX_SPEED = 800 / 180 * Math.PI;
  this.MAX_ACCELERATION = 20;  // degrees / msec^2
  this.TIRE_DOWNWARDS_FORCE = new BABYLON.Vector3(0, -4000, 0);

  this.type = 'wheel';
  this.modes = {
    STOP: 1,
    RUN: 2,
    RUN_TO_POS: 3,
    RUN_TIL_TIME: 4
  };
  this.state = '';
  this.states = {
    RUNNING: 'running',
    RAMPING: 'ramping',
    HOLDING: 'holding',
    OVERLOADED: 'overloaded',
    STATE_STALLED: 'stalled',
    NONE: ''
  };

  this.speed_sp = 0;
  this._speed_sp = 0;
  this.stop_action = 'hold';
  this.position = 0;
  this.speed = 0;

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
      self.joint.setMotor(0, self.STOP_ACTION_HOLD_FORCE);
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
  this.load = function(pos, startPos, startRot, body, pivot) {
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
      height: options.wheelWidth,
      diameter: options.wheelDiameter,
      tessellation: 24,
      faceUV: faceUV
    };

    self.mesh = BABYLON.MeshBuilder.CreateCylinder('wheel', wheelOptions, scene);
    self.mesh.material = wheelMat;
    self.mesh.rotation.z = -Math.PI / 2;
    self.mesh.position.x = pos[0];
    self.mesh.position.y = pos[1];
    self.mesh.position.z = pos[2];
    scene.shadowGenerator.addShadowCaster(self.mesh);

    let transformNode = BABYLON.MeshBuilder.CreateBox('root', {width:1,depth:1,height:1}, scene);
    self.mesh.parent = transformNode;
    transformNode.rotate(BABYLON.Axis.Y, startRot.y, BABYLON.Space.LOCAL);
    transformNode.rotate(BABYLON.Axis.X, startRot.x, BABYLON.Space.LOCAL);
    transformNode.rotate(BABYLON.Axis.Z, startRot.z, BABYLON.Space.LOCAL);
    transformNode.position.addInPlace(startPos);
    transformNode.removeChild(self.mesh);
    transformNode.dispose();

    self.s = new BABYLON.Quaternion.FromEulerAngles(0,0,self.mesh.rotation.z);
    self.s_i = BABYLON.Quaternion.Inverse(self.s);
    self.axis0 = new BABYLON.Quaternion(0,1,0,0);
    self.axis1 = self.s.multiply(self.axis0).multiply(self.s_i);
    self.v1 = new BABYLON.Vector3(self.axis1.x, self.axis1.y, self.axis1.z);
    self.v1.normalize();

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

    self.joint = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
      mainPivot: pivot,
      connectedPivot: new BABYLON.Vector3(0, 0, 0),
      mainAxis: new BABYLON.Vector3(1, 0, 0),
      connectedAxis: new BABYLON.Vector3(0, 1, 0),
    });
    body.physicsImpostor.addJoint(self.mesh.physicsImpostor, self.joint);
  };

  this.render = function(delta) {
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
    self.speed = 0.8 * self.speed + 0.2 * ((self.position - self.prevPosition) / delta * 1000);
    self.prevPosition = self.position;
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
    self.joint.setMotor(speed, 30000);
  };

  this.setMotorSpeed = function(delta, reversed=false) {
    let diff = self.speed_sp - self._speed_sp;
    let diffLimit = delta * self.MAX_ACCELERATION;
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

    self.prevv2 = v2
  };

  this.getRotation = function(s, e) {
    var r = e.multiply(self.s_i);

    var axis2 = e.multiply(self.axis0).multiply(BABYLON.Quaternion.Inverse(e));

    v2 = new BABYLON.Vector3(axis2.x, axis2.y, axis2.z);
    v2.normalize();

    q1_xyz = self.v1.cross(v2);
    var q1_dot = BABYLON.Vector3.Dot(self.v1, v2);
    var q1_w = 1 + q1_dot;
    if (q1_w< 0.1) {
      if (Math.abs(self.v1.x)> Math.abs(self.v1.z)) {
        var q1 = new BABYLON.Quaternion(-self.v1.y, self.v1.x, 0, 0)
      } else {
        var q1 = new BABYLON.Quaternion(0,-self.v1.z, self.v1.y, 0)
      }
    } else {
      var q1 = new BABYLON.Quaternion(q1_xyz.x, q1_xyz.y, q1_xyz.z, q1_w);
    }

    q1.normalize();
    var q2 = BABYLON.Quaternion.Inverse(r).multiply(q1);
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