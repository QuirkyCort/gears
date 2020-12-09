function Robot() {
  var self = this;

  this.options = {};

  this.body = null;
  this.leftWheel = null;
  this.rightWheel = null;
  this.pen = null;
  this.components = [];

  this.sensorCount = 0;
  this.actuatorCount = 2;
  this.componentIndex = 0;

  this.playerColors =[
    new BABYLON.Color3(0.2, 0.94, 0.94),
    new BABYLON.Color3(0.2, 0.94, 0.2),
    new BABYLON.Color3(0.94, 0.94, 0.2),
    new BABYLON.Color3(0.94, 0.2, 0.2),
    new BABYLON.Color3(0.94, 0.2, 0.94),
    new BABYLON.Color3(0.2, 0.2, 0.94)
  ]

  // Run on page load
  this.init = function() {
  };

  // Create the scene
  this.load = function (scene, robotStart) {
    var options = self.options;
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
      if (self.player == 'single') {
        bodyMat.diffuseColor = new BABYLON.Color3(0.94, 0.61, 0.05);
      } else {
        bodyMat.diffuseColor = self.playerColors[self.player];
      }
      bodyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      bodyMat.freeze();

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

      // Add components
      self.components = [];
      self.sensorCount = 0;
      self.motorCount = 2;
      self.componentIndex = 0;
      self.loadComponents(self.options.components, self.components, self.body);

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
      self.leftWheel = new Wheel(scene, options);
      self.rightWheel = new Wheel(scene, options);
      self.leftWheel.load(
        [
          -(options.wheelWidth + options.bodyWidth) / 2 - options.wheelToBodyOffset,
          options.wheelDiameter / 2,
          (options.bodyLength / 2) - options.bodyEdgeToWheelCenterZ
        ],
        startPos,
        startRot,
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
          (options.bodyLength / 2) - options.bodyEdgeToWheelCenterZ
        ],
        startPos,
        startRot,
        body,
        new BABYLON.Vector3(
          (options.bodyWidth / 2) + options.wheelToBodyOffset + options.wheelWidth / 2,
          -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
          options.bodyLength / 2 - options.bodyEdgeToWheelCenterZ
        )
      );
      self.leftWheel.stop();
      self.rightWheel.stop();

      // if the robot has a pen, finish setting its position after wheel setup
      if (self.pen != null) {
        self.pen.finishInit();
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
      } else if (componentConfig.type == 'Pen') {
        component = new Pen(
          self.scene,
          parent,
          self,
          componentConfig.position,
          componentConfig.rotation,
          componentConfig.options);
        self.pen = component; // cache for easy access to pen later
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

  //
  this.addPen = function() {
    if (self.pen == null) {
      component = new Pen(
        self.scene,
        self.body, // TODO, not clear to me what parent should be here
        self, // backpointer to the robot
        null, // default position
        null, // default rotation
        null // default options
      );
      self.pen = component; // cache for easy access to pen later
      self.components.push(component);
      // Here, the robot is already built, so do the final pen init now
      self.pen.finishInit();
    }
  }

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
    self.leftWheel.reset();
    self.rightWheel.reset();
    self.pen = null;
    self.components.forEach(function(component) {
      if (typeof component.reset == 'function') {
        component.reset();
      }
      if (component.type == 'Pen') {
        self.pen = component;
      }
    })
  };

  // Render loop
  this.render = function(delta) {
    self.leftWheel.render(delta);
    self.rightWheel.render(delta);

    penComponent = null; // Note: only allows one pen per robot
    self.components.forEach(function(component) {
      if (component.type == 'Pen') {
        // render the pen last
        penComponent = component;
      } else {
        if (typeof component.render == 'function') {
          component.render(delta);
        }
      }
    });
    if (penComponent != null) {
      penComponent.render(delta);
    }
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

  // Init class
  self.init();
}
