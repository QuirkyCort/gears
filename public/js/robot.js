function Wheel(scene, options) {
  var self = this;

  this.mesh = null;
  this.joint = null;

  this.STOP_ACTION_BRAKE_FORCE = 2000;
  this.STOP_ACTION_COAST_FORCE = 1000;
  this.STOP_ACTION_HOLD_FORCE = 30000;
  this.MOTOR_POWER_DEFAULT = 3000;
  this.MAX_SPEED = 800 / 180 * Math.PI;
  this.MAX_ACCELERATION = 2;  // degrees / msec^2
  this.TIRE_DOWNWARDS_FORCE = new BABYLON.Vector3(0, -4000, 0);

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
    self.prevPosition = 0;
    self.mode = self.modes.STOP;
    self.state = self.states.HOLDING;
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
      tessellation: 12,
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

var robot = new function() {
  var self = this;

  this.options = {
    bodyHeight: 4,
    bodyWidth: 10,
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
        position: [-2.5, -1, 9],
        rotation: [Math.PI/2, 0, 0],
        options: null
      },
      {
        type: 'ColorSensor',
        position: [2.5, -1, 9],
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
        position: [-7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'Box',
        position: [7, -1, 3],
        rotation: [0, 0, 0],
        options: {
          height: 3,
          width: 1,
          depth: 14
        }
      },
      {
        type: 'GyroSensor',
        position: [0, 2.5, -5],
        options: null
      }
    ]
  };

  this.body = null;
  this.leftWheel = null;
  this.rightWheel = null;
  this.components = [];

  this.sensorCount = 0;
  this.actuatorCount = 2;

  // Run on page load
  this.init = function() {
  };

  // Create the scene
  this.load = function (scene, robotStart) {
    var options = self.options;
    self.scene = scene;

    return new Promise(function(resolve, reject) {
      var startPos = new BABYLON.Vector3(0,0,0);
      if (typeof robotStart != 'undefined') {
        if (typeof robotStart.position != 'undefined') {
          startPos = robotStart.position;
        }
      }

      // Body
      var bodyMat = new BABYLON.StandardMaterial('body', scene);
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
      var casterMat = new BABYLON.StandardMaterial('caster', scene);
      casterMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
      casterMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
      let casterOptions = {
        diameter: options.wheelDiameter,
        segments: 5
      }
      var caster = BABYLON.MeshBuilder.CreateSphere("sphere", casterOptions, scene);
      caster.material = casterMat;
      caster.position.y = -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY;
      caster.position.z = -(options.bodyLength / 2) + (options.wheelDiameter / 2);
      scene.shadowGenerator.addShadowCaster(caster);
      caster.parent = body;

      // Add components
      self.loadComponents();

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
          (options.wheelWidth + options.bodyWidth) / 2 + options.wheelToBodyOffset,
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

  // Load components
  this.loadComponents = function() {
    self.components = [];
    self.sensorCount = 0;
    self.motorCount = 2;

    self.options.components.forEach(function(component){
      if (component.type == 'ColorSensor') {
        self.components.push(new ColorSensor(
          self.scene,
          self.body,
          component.position,
          component.rotation,
          'in' + (++self.sensorCount),
          component.options));
      } else if (component.type == 'UltrasonicSensor') {
        self.components.push(new UltrasonicSensor(
          self.scene,
          self.body,
          component.position,
          component.rotation,
          'in' + (++self.sensorCount),
          component.options));
      } else if (component.type == 'GyroSensor') {
        self.components.push(new GyroSensor(
          self.scene,
          self.body,
          component.position,
          'in' + (++self.sensorCount),
          component.options));
      } else if (component.type == 'Box') {
        self.components.push(new BoxBlock(
          self.scene,
          self.body,
          component.position,
          component.rotation,
          component.options));
      } else {
        console.log('Unrecognized component type: ' + component.type);
      }
    });
  };

  // Load meshes for components that needs it
  this.loadMeshes = function(meshes) {
    self.components.forEach(function(component) {
      if (typeof component.loadMeshes == 'function') {
        component.loadMeshes(meshes);
      }
    });
  };

  // Get component based on port name
  this.getComponentByPort = function(port) {
    return self.components.find(sensor => sensor.port == port);
  };

  // Reset robot
  this.reset = function() {
    self.leftWheel.reset();
    self.rightWheel.reset();
    self.components.forEach(function(component) {
      if (typeof component.reset == 'function') {
        component.reset();
      }
    })
  };

  // Render loop
  this.render = function(delta) {
    self.leftWheel.render(delta);
    self.rightWheel.render(delta);

    self.components.forEach(function(component) {
      if (typeof component.render == 'function') {
        component.render(delta);
      }
    });
  };
}

// Init class
robot.init();
