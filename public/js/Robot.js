function Robot() {
  var self = this;

  this.options = {};

  this.body = null;
  this.leftWheel = null;
  this.rightWheel = null;
  this.components = [];

  this.sensorCount = 0;
  this.actuatorCount = 2;
  this.componentIndex = 0;

  this.is_pen_down = false // we only draw pen traces for when the pen is down
  this.pen_color = new BABYLON.Color3(0.5, 0.5, 1.0);
  // NOTE: pen_meshes does not include current_pen_mesh!
  this.pen_meshes = []; // array of Ribbon mesh objects, one per down()/up()
  this.pen_current_path = []; // the path we are currently drawing
  this.pen_current_mesh = null;
  // animate can be set to 'none' to disable the pen
  this.pen_default_options = {'animate' : 'animate',
                              'orientaton' : 'h',
                              'width': 1.0,
                              'debug' : false
                             }
  this.pen_options = {...this.pen_default_options}
  // once the simulation is finished, we may need to render some paths once
  // this is set to true once simulation starts, then back to false after
  // the final render
  this.pen_final_render_needed = false
  
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
    this.reset_pen();
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

      resolve();
    });
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
    this.reset_pen()
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
    // update the pen *after* we have moved the robot body
    self.pen_update()
  };

  // pen implementation functions
  this.pen_down = function() {
    this.pen_current_path = []; // the path we are currently drawing
    this.pen_current_mesh = null;
    this.is_pen_down = true
    if (self.pen_options['debug']) {
      console.log('pen down');
    }
  };

  this.pen_up = function() {
    if (self.is_pen_down) {
      if (self.pen_options['animate'] === 'onUp' ||
          self.pen_options['animate'] === 'onFinish') {
        self.pen_rebuild_mesh()
      }
      if (this.pen_current_mesh != null) {
        this.pen_meshes.push(this.pen_current_mesh)
        this.pen_current_mesh = null
      }
      this.pen_current_path = [];
      self.pen_current_path_dirty = false
    }
    this.is_pen_down = false
    if (self.pen_options['debug']) {
      console.log('pen up');
    }
  };

  this.set_pen_color = function(r, g, b) {
    self.pen_color = new BABYLON.Color3(r, g, b);
    if (self.pen_options['debug']) {
      console.log('pen color now', r, g, b);
    }
  };

  this.set_pen_options = function(options) {
    self.last_pen_options = options;
    js_options = Sk.ffi.remapToJs(options)
    if (self.pen_options['debug']) {
      console.log('pen options set', js_options);
    }
    for (const [key, value] of Object.entries(js_options)) {
      if (self.pen_options['debug']) {
        console.log('setting pen option ', key, ' : ', value);
      }
      self.pen_options[key] = value;
    }    
  }

  // do all the pen updates for this time through the render loop.
  // This needs to be called after the body is rendered...
  this.pen_update = function() {
    // assume that skulpt.running may change asynchronously
    robotRunning = skulpt.running
    if (robotRunning) {
      self.pen_final_render_needed = true;
    } else {
      if (!self.pen_final_render_needed) {
        return;
      }
    }
    self.pen_update_position()
    if (self.pen_options['animate'] == 'animate') {
      // if animating the pen, rebuild each time through render loop
      if (self.pen_current_path_dirty) {
        self.pen_rebuild_mesh()
      }
    }
    if (!robotRunning && self.pen_final_render_needed) {
      self.pen_final_render()
    }
  }

  
  // update current pen path if the pen is down
  this.pen_update_position = function() {
    if (!self.is_pen_down) {
      return
    }
    // Body position gets updated in the render loop prior to this
    // ref axes y and z are swapped!
    let cur_pos = [self.body.position.x, self.body.position.z]
    // it seems like a better position would be exactly between the L and R
    // wheel positions:
    wheelAxisCenter = self.leftWheel.mesh.position.add(self.rightWheel.mesh.position).scale(1/2.0)
    cur_pos = [wheelAxisCenter.x, wheelAxisCenter.z] 
    // TODO consider allowing other positions on robot
    if (self.pen_current_path.length == 0) {
      self.pen_current_path.push(cur_pos);
      self.pen_current_path_dirty = true;
    } else {
      let old_pos = self.pen_current_path.slice(-1)[0];
      // TODO - this epsilon is in any coordinate.  It would be better
      // to use compare the difference vector distance to the epsilon 
      penPathEpsilon = 0.05
      if (arrayAlmostEquals(cur_pos, old_pos, penPathEpsilon)) {
        // efficiency, skip points very close to previous
      } else {
        self.pen_current_path.push(cur_pos)
        self.pen_current_path_dirty = true;
      }
    }
  };

  this.pen_rebuild_mesh = function() {
    let animateMode = this.pen_options['animate']
    if (animateMode === 'none') {
      return;
    }
    if (animateMode != 'animate' && self.pen_options['debug']) {
      // gets called lots of times in animate mode, so don't log those
      console.log('pen rebuild mesh');
    }
    // drawing current path only
    var idx;
    var path = this.pen_current_path;
    if (this.pen_current_path.length < 2) {
      return;
    }
    if (this.pen_current_mesh != null ) {
      // remove the old ribbon mesh
      self.scene.removeMesh(this.current_pen_mesh);
      this.pen_current_mesh.dispose();
      this.pen_current_mesh = null;
    }
    var mat = new BABYLON.StandardMaterial("mat1", self.scene);
    mat.alpha = 1.0;
    mat.diffuseColor = this.pen_color;
    mat.backFaceCulling = false;
    // in animate mode, every time we change the path, we recreate the mesh.
    // I didn't find a way around this, because the length of a ribbon is
    // not allowed to change.
    rpaths = ribbonVPathsFromXYPath(path, this.pen_options);
    try {
      ribbon = BABYLON.MeshBuilder.CreateRibbon("ribbon",
                                                {pathArray: rpaths,
                                                 sideOrientation: BABYLON.Mesh.DOUBLESIDE},
                                                this.scene);
      if (animateMode === 'onFinish') {
        ribbon.setEnabled(false)
      }
      ribbon.material = mat;
      this.pen_current_mesh = ribbon;
    } catch(err) {
      // do nothing if unable to create ribbon
    }
  };

  this.pen_final_render = function() {
    if (self.pen_options['debug']) {
      console.log('pen final render');
    }
    // force the pen to finish up so the last path gets rendered
    self.pen_up();
    self.pen_final_render_needed = false;
    for (idx = 0; idx < this.pen_meshes.length; idx++) {
      mesh = this.pen_meshes[idx];
      mesh.setEnabled(true); // make mesh visible
    }
  }

  // clear all pen meshes, clear the current pen trace, set the pen to up
  this.reset_pen = function() {
    this.is_pen_down = false
    this.pen_final_render_needed = false
    // TODO - Not resetting pen color here, reconsider
    this.pen_options = {...this.pen_default_options}
    if (this.pen_current_mesh != null ) {
      self.scene.removeMesh(this.pen_current_mesh)
      this.pen_current_mesh.dispose()
      this.pen_current_mesh = null;
    }
    for (idx = 0; idx < this.pen_meshes.length; idx++) {
      mesh = this.pen_meshes[idx]
      self.scene.removeMesh(mesh)
      mesh.dispose()
    }
    this.pen_meshes = []
    this.pen_current_path = []; // the path we are currently drawing
    self.pen_current_path_dirty = false
  }
    
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

function arrayAlmostEquals(a, b, epsilon) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => Math.abs(val-b[index]) <= epsilon);
}    

function ribbonVPathsFromXYPath(xyPath, pen_options){
  // note Z and Y need to be flipped in creating the vectors.  Not sure why.
  // we're going to make the ribbon width vertical
  ribbon_width = pen_options.width;
  r_v_path = [];  
  r_v_path2 = [];  
  for (idx = 0; idx < xyPath.length; idx++) {
    x = xyPath[idx][0]
    y = xyPath[idx][1]
    z = 0
    if (pen_options.orientation[0] == 'h') {
      if (idx == 0) {
        v1 = new BABYLON.Vector3(x, 0.1, y);
        v2 = v1;
        lastx = x
        lasty = y
      } else {
        // offset each of v1 v2 perpendicular to travel direction
        dx = x - lastx
        dy = y - lasty
        crossv = new BABYLON.Vector2(dy, -dx)
        crossv = crossv.normalize().scale(ribbon_width/2.0)
        // console.log('ns-crossv :', crossv)
        v1 = new BABYLON.Vector3(x+crossv.x, 0.1, y+crossv.y);
        v2 = new BABYLON.Vector3(x-crossv.x, 0.1, y-crossv.y);
      }
    } else {
      v1 = new BABYLON.Vector3(x, z, y);
      v2 = new BABYLON.Vector3(x, z+ribbon_width, y);
    }
    r_v_path.push(v1);
    r_v_path2.push(v2);
  }
  return [r_v_path, r_v_path2]
}  
