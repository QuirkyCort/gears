function Robot() {
  var self = this;

  this.options = {};
  this.processedOptions = {};

  this.body = null;
  this.leftWheel = null;
  this.rightWheel = null;
  this.components = [];

  this.sensorCount = 0;
  this.actuatorCount = 2;
  this.componentIndex = 0;

  this.playerIndividualColors = [
    new BABYLON.Color3(0.2, 0.94, 0.94),
    new BABYLON.Color3(0.2, 0.94, 0.2),
    new BABYLON.Color3(0.94, 0.94, 0.2),
    new BABYLON.Color3(0.94, 0.2, 0.2),
    new BABYLON.Color3(0.94, 0.2, 0.94),
    new BABYLON.Color3(0.2, 0.2, 0.94)
  ];

  this.playerTeamColors = [
    new BABYLON.Color3(0.09, 0.09, 0.902),
    new BABYLON.Color3(0.09, 0.495, 0.9),
    new BABYLON.Color3(0.9, 0.09, 0.09),
    new BABYLON.Color3(0.9, 0.09, 0.495),
  ];

  this.defaultOptions = {
    color: '#f09c0d',
    imageType: 'all',
    imageURL: '',
    caster: true,
    wheels: true
  };

  this.mailboxes = {};

  this.hubButtons = {
    backspace: false,
    up: false,
    down: false,
    left: false,
    right: false,
    enter: false
  };

  // Run on page load
  this.init = function() {
  };

  // Create the scene
  this.load = function (scene, robotStart) {
    var options = {...self.defaultOptions};
    self.processedOptions = options;
    Object.assign(options, self.options);
    self.scene = scene;

    return new Promise(function(resolve, reject) {
      var startPos = new BABYLON.Vector3(0,0,0);
      var startRot = new BABYLON.Vector3(0,0,0);
      if (typeof robotStart != 'undefined') {
        if (typeof robotStart.position != 'undefined') {
          startPos = robotStart.position;
        }
        if (typeof robotStart.rotation != 'undefined') {
          startRot = robotStart.rotation;
        }
      }

      // Body
      var bodyMat = new BABYLON.StandardMaterial('body', scene);
      var faceUV = new Array(6);
      for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
      }

      function setCustomColors() {
        let VALID_IMAGETYPES = ['top','front','repeat','all','cylinder','sphere'];
        if (VALID_IMAGETYPES.indexOf(options.imageType) != -1 && options.imageURL != '') {
          if (options.imageType == 'top') {
            faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
          } else if (options.imageType == 'front') {
            faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1);
          } else if (options.imageType == 'repeat') {
            for (var i = 0; i < 6; i++) {
              faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
            }
          } else if (options.imageType == 'all') {
            faceUV[0] = new BABYLON.Vector4(0,   0,   1/3, 1/2);
            faceUV[1] = new BABYLON.Vector4(1/3, 0,   2/3, 1/2);
            faceUV[2] = new BABYLON.Vector4(2/3, 0,   1,   1/2);
            faceUV[3] = new BABYLON.Vector4(0,   1/2, 1/3, 1);
            faceUV[4] = new BABYLON.Vector4(1/3, 1/2, 2/3, 1);
            faceUV[5] = new BABYLON.Vector4(2/3, 1/2, 1,   1);
          }

          bodyMat.diffuseTexture = new BABYLON.Texture(options.imageURL, scene);
        } else {
          bodyMat = babylon.getMaterial(scene, options.color);
        }
      }

      if (self.player == 'single') {
        setCustomColors();
      } else {
        // Arena mode
        let robotColorMode = null;
        if (typeof arena != 'undefined') {
          robotColorMode = arena.robotColorMode;
        }

        if (robotColorMode == 'team') {
          bodyMat.diffuseColor = self.playerTeamColors[self.player];
        } else if (robotColorMode == 'custom') {
          setCustomColors();
        } else {
          bodyMat.diffuseColor = self.playerIndividualColors[self.player];
        }
      }
      bodyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      bodyMat.freeze();

      let bodyOptions = {
        height: options.bodyHeight,
        width: options.bodyWidth,
        depth: options.bodyLength,
        faceUV: faceUV
      };
      var body = BABYLON.MeshBuilder.CreateBox('body', bodyOptions, scene);
      self.body = body;
      body.material = bodyMat;
      body.visibility = 1;
      body.position.x = 0;
      body.position.y = (options.bodyHeight / 2) + (options.wheelDiameter / 2) - options.bodyEdgeToWheelCenterY;
      body.position.z = 0;
      scene.shadowGenerator.addShadowCaster(body);
      body.position.addInPlace(startPos);
      body.rotate(BABYLON.Axis.Y, startRot.y, BABYLON.Space.LOCAL);
      body.rotate(BABYLON.Axis.X, startRot.x, BABYLON.Space.LOCAL);
      body.rotate(BABYLON.Axis.Z, startRot.z, BABYLON.Space.LOCAL);

      // Add label
      self.addLabel();

      // Add a paintballCollide function
      body.paintballCollide = self.paintballCollide;

      // Rear caster
      if (options.caster) {

        var casterMat = new BABYLON.StandardMaterial('caster', scene);
        casterMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        casterMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        casterMat.freeze();

        let casterOptions = {
          diameter: options.wheelDiameter,
          segments: 5
        }
        if (typeof options.casterDiameter != 'undefined' && options.casterDiameter > 0) {
          casterOptions.diameter = options.casterDiameter;
        }
        var caster = BABYLON.MeshBuilder.CreateSphere("sphere", casterOptions, scene);
        caster.material = casterMat;
        caster.position.y = -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY - options.wheelDiameter / 2 + casterOptions.diameter / 2;
        caster.position.z = -(options.bodyLength / 2) + (casterOptions.diameter / 2);
        if (typeof options.casterOffsetZ != 'undefined') {
          caster.position.z += options.casterOffsetZ;
        }

        scene.shadowGenerator.addShadowCaster(caster);
        caster.parent = body;

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
      }
      // Add components
      self.components = [];
      self.sensorCount = 0;
      self.motorCount = options.wheels ? 2 : 0;

      self.componentIndex = 0;
      self.loadComponents(self.options.components, self.components, self.body);

      // Add Physics
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

      // Hold position if speed is too low
      var origin = body.physicsImpostor.physicsBody.getWorldTransform().getOrigin();
      var lastOrigin = [
          origin.x(),
          origin.y(),
          origin.z()
      ];

      body.physicsImpostor.registerBeforePhysicsStep(function(){
        if (body.physicsImpostor.getLinearVelocity().lengthSquared() < 0.1) {
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

      // Add joints
      self.loadJoints(self.components);


      // Wheels
      driveWheelOptions = {
        diameter: options.wheelDiameter,
        width: options.wheelWidth,
        mass: options.wheelMass,
        friction: options.wheelFriction,
        maxAcceleration: options.wheelMaxAcceleration,
        stopActionHoldForce: options.wheelStopActionHoldForce,
        tireDownwardsForce: options.wheelTireDownwardsForce
      };

      if (options.wheels){
        self.leftWheel = new Wheel(
          scene,
          body,
          [
            -(options.wheelWidth + options.bodyWidth) / 2 - options.wheelToBodyOffset,
            -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
            (options.bodyLength / 2) - options.bodyEdgeToWheelCenterZ
          ],
          [0,0,0],
          'outA',
          driveWheelOptions
        );
        self.leftWheel.loadImpostor();
        self.leftWheel.loadJoints();

        self.rightWheel = new Wheel(
          scene,
          body,
          [
            (options.wheelWidth + options.bodyWidth) / 2 + options.wheelToBodyOffset,
            -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
            (options.bodyLength / 2) - options.bodyEdgeToWheelCenterZ
          ],
          [0,0,0],
          'outB',
          driveWheelOptions
        );
        self.rightWheel.loadImpostor();
        self.rightWheel.loadJoints();
      }
      resolve();
    });
  };

  // Add label
  this.addLabel = function() {
    if (typeof babylon.gui != 'undefined' && self.name) {
      self.nameLabel = new BABYLON.GUI.Rectangle();
      self.nameLabel.height = '30px';
      self.nameLabel.width = '200px';
      self.nameLabel.cornerRadius = 0;
      self.nameLabel.thickness = 0;
      babylon.gui.addControl(self.nameLabel);

      var label = new BABYLON.GUI.TextBlock();
      self.label = label;
      label.fontFamily = 'sans';
      label.text = self.name;
      label.color = '#FFFF77';
      label.outlineWidth = 1;
      label.outlineColor = 'black'
      label.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      label.fontSize = 20;
      self.nameLabel.addControl(label);

      self.nameLabel.linkWithMesh(self.body);
      self.nameLabel.linkOffsetY = -50;

      self.nameLabel.isVisible = false;
    }
  };

  // Hide label
  this.hideLabel = function() {
    if (typeof self.nameLabel != 'undefined') {
      self.nameLabel.isVisible = false;
    }
  };

  // Show label
  this.showLabel = function() {
    if (typeof self.nameLabel != 'undefined') {
      self.nameLabel.isVisible = true;
    }
  };

  // Paintball collide function. Used to notify world of hit for score keeping.
  this.paintballCollide = function(thisImpostor, otherImpostor, hit) {
    if (typeof babylon.world.paintBallHit == 'function'){
      babylon.world.paintBallHit(self, otherImpostor, hit);
    }
  };

  // Add joints
  this.loadJoints = function(components) {
    components.forEach(function(component) {
      if (typeof component.components != 'undefined') {
        self.loadJoints(component.components);
      }
      if (typeof component.loadJoints == 'function') {
        component.loadJoints();
      }
    });
  };

  // Load components
  this.loadComponents = function(componentsConfig, components, parent) {
    let PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    componentsConfig.forEach(function(componentConfig){
      let component = null;
      if (componentConfig.type == 'ColorSensor') {
        component = new ColorSensor(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'in' + (++self.sensorCount),
          componentConfig.options);
      } else if (componentConfig.type == 'UltrasonicSensor') {
        component = new UltrasonicSensor(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'in' + (++self.sensorCount),
          componentConfig.options);
      } else if (componentConfig.type == 'GyroSensor') {
        component = new GyroSensor(
          self.scene,
          parent,
          componentConfig.position,
          'in' + (++self.sensorCount),
          componentConfig.options);
      } else if (componentConfig.type == 'GPSSensor') {
        component = new GPSSensor(
          self.scene,
          parent,
          componentConfig.position,
          'in' + (++self.sensorCount),
          componentConfig.options);
      } else if (componentConfig.type == 'Box') {
        component = new BoxBlock(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          componentConfig.options);
      } else if (componentConfig.type == 'Cylinder') {
        component = new CylinderBlock(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          componentConfig.options);
      } else if (componentConfig.type == 'Sphere') {
        component = new SphereBlock(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          componentConfig.options);
      } else if (componentConfig.type == 'WheelPassive') {
        component = new WheelPassive(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          componentConfig.options);
      } else if (componentConfig.type == 'MagnetActuator') {
        component = new MagnetActuator(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'out' + PORT_LETTERS[(++self.motorCount)],
          componentConfig.options);
      } else if (componentConfig.type == 'ArmActuator') {
        component = new ArmActuator(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'out' + PORT_LETTERS[(++self.motorCount)],
          componentConfig.options);
      } else if (componentConfig.type == 'LaserRangeSensor') {
        component = new LaserRangeSensor(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'in' + (++self.sensorCount),
          componentConfig.options);
      } else if (componentConfig.type == 'SwivelActuator') {
        component = new SwivelActuator(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'out' + PORT_LETTERS[(++self.motorCount)],
          componentConfig.options);
      } else if (componentConfig.type == 'PaintballLauncherActuator') {
        component = new PaintballLauncherActuator(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'out' + PORT_LETTERS[(++self.motorCount)],
          componentConfig.options);
      } else if (componentConfig.type == 'WheelActuator') {
        component = new Wheel(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'out' + PORT_LETTERS[(++self.motorCount)],
          componentConfig.options);
      } else if (componentConfig.type == 'Pen') {
        component = new Pen(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'in' + (++self.sensorCount),
          componentConfig.options);
      } else if (componentConfig.type == 'TouchSensor') {
        component = new TouchSensor(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'in' + (++self.sensorCount),
          componentConfig.options);
      } else if (componentConfig.type == 'LinearActuator') {
        component = new LinearActuator(
          self.scene,
          parent,
          componentConfig.position,
          componentConfig.rotation,
          'out' + PORT_LETTERS[(++self.motorCount)],
          componentConfig.options);
      } else {
        console.log('Unrecognized component type: ' + componentConfig.type);
      }
      if (component != null) {
        component.componentIndex = self.componentIndex++;
      }
      if (component) {
        if (typeof componentConfig.components != 'undefined') {
          self.loadComponents(componentConfig.components, component.components, component.end);
        }
        if (typeof component.loadImpostor == 'function') {
          component.loadImpostor();
        }
        components.push(component);
      }
    });
  };

  // Load meshes for components that needs it
  this.loadMeshes = function(meshes) {
    function loadMeshes(components) {
      components.forEach(function(component) {
        if (component.components) {
          loadMeshes(component.components);
        }
        if (typeof component.loadMeshes == 'function') {
          component.loadMeshes(meshes);
        }
      });
    }
    loadMeshes(self.components);
  };

  // Get component based on port name
  this.getComponentByPort = function(port) {
    return self._getComponentByPort(port, self.components);
  };

  this._getComponentByPort = function(port, components) {
    for (let i=0; i<components.length; i++) {
      if (components[i].port == port) {
        return components[i];
      } else if (components[i].components) {
        let result = self._getComponentByPort(port, components[i].components);
        if (result) {
          return result;
        }
      }
    }
  };

  // Get component based on componentIndex
  this.getComponentByIndex = function(index) {
    return self._getComponentByIndex(index, self.components);
  };

  this._getComponentByIndex = function(index, components) {
    for (let i=0; i<components.length; i++) {
      if (components[i].componentIndex == index) {
        return components[i];
      } else if (components[i].components) {
        let result = self._getComponentByIndex(index, components[i].components);
        if (result) {
          return result;
        }
      }
    }
  };

  // Reset robot
  this.reset = function() {
    if (self.leftWheel) {
      self.leftWheel.reset();
    }
    if (self.rightWheel) {
      self.rightWheel.reset();
    }
    self.components.forEach(function(component) {
      if (typeof component.reset == 'function') {
        component.reset();
      }
    })
  };

  // Render loop
  this.render = function(delta) {
    if (self.leftWheel != null) {
      self.leftWheel.render(delta);
    }
    if (self.rightWheel != null) {
      self.rightWheel.render(delta);
    }

    self.components.forEach(function(component) {
      if (typeof component.render == 'function') {
        component.render(delta);
      }
    });
  };

  // Force all motors to stop
  this.stopAll = function() {
    if (self.leftWheel) {
      self.leftWheel.stop();
    }
    if (self.rightWheel) {
      self.rightWheel.stop();
    }
    self.components.forEach(function(component){
      if (typeof component.stop == 'function') {
        component.stop();
      }
    })
  };

  // Send a message
  this.radioSend = function(dest, mailbox, value) {
    const TEAM_MATES = [
      [1],
      [0],
      [3],
      [2]
    ];
    const ALL = [0, 1, 2, 3];

    if (dest == 'all') {
      dest = ALL;
    } else if (dest == 'team') {
      if (self.player == 'single') {
        dest = [1]
      } else {
        dest = TEAM_MATES[self.player];
      }
    } else if (typeof dest == 'number') {
      dest = [dest];
    }

    dest.forEach(function(d){
      if (d == self.player) {
        return;
      }

      let recepient = window.parent.robots[d];

      if (typeof recepient != 'undefined') {
        if (typeof recepient.mailboxes[mailbox] == 'undefined') {
          recepient.mailboxes[mailbox] = [];
        }
        recepient.mailboxes[mailbox].push([value, self.player]);
      }
    })
  };

  // Check if messages available
  this.radioAvailable = function(mailbox) {
    if (typeof self.mailboxes[mailbox] == 'undefined') {
      return 0;
    }

    return self.mailboxes[mailbox].length;
  };

  // Read message
  this.radioRead = function(mailbox) {
    if (typeof self.mailboxes[mailbox] == 'undefined') {
      return null;
    }

    if (self.mailboxes[mailbox].length == 0) {
      return null;
    }

    return self.mailboxes[mailbox].shift();
  };

  // Empty mailbox
  this.radioEmpty = function(mailbox) {
    if (typeof mailbox == 'undefined') {
      self.mailboxes = {};
    } else if (typeof self.mailboxes[mailbox] != 'undefined') {
      self.mailboxes[mailbox] = [];
    }
  };

  // Set button
  this.setHubButton = function(btn, state) {
    self.hubButtons[btn] = state;
  };

  // Get buttons
  this.getHubButtons = function() {
    return self.hubButtons;
  };

  this.objectTrackerGetByName = function(name){
    if ([0,1,2,3,'team','opponent1','opponent2','self'].includes(name)){
      if (self.player == 'single' && name != 'self'){
        return null;
      }

      let player_num = 0;
      if (typeof name == 'number'){
        player_num = name;
      }
      else if (name == 'team'){
        const TEAM_MATES = [1,0,3,2];
        player_num = TEAM_MATES[self.player];
      }
      else if (name == 'opponent1'){
        const OPP1 = [2,2,0,0];
        player_num = OPP1[self.player];
      }
      else if (name == 'opponent2'){
        const OPP2 = [3,3,1,1];
        player_num = OPP2[self.player];
      }
      else{
        if (self.player == 'single'){
          player_num = 0;
        }
        else{
          player_num = self.player;
        }
      }
      let robot = robots[player_num];
      if (robot != null && robot.body != null){
          return robot.body;
      }
      return null;
    } else if (typeof name == 'string'){
      for (mesh of self.scene.meshes){
        if (mesh.objectTrackerLabel == name){
          return mesh;
        }
      }
    }
    return null;
  };

  this.objectTrackerPosition = function(name){
    let temp = self.objectTrackerGetByName(name);
    if (temp != null){
      let pos = temp.absolutePosition;
      return [pos.x, pos.y, pos.z];
    }
    return null;
  };

  this.objectTrackerVelocity = function(name){
    let temp = self.objectTrackerGetByName(name);
    if (temp != null && temp.physicsImpostor != null){
      let vel = temp.physicsImpostor.getLinearVelocity();
      return [vel.x, vel.y, vel.z];
    }
    return null;
  };

  // Init class
  self.init();
}
