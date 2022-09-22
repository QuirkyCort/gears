var builder = new function() {
  var self = this;

  this.worldOptions = JSON.parse(JSON.stringify(worlds[0].defaultOptions));

  this.groundTemplate = {
    optionsConfigurations: [
      {
        option: 'imageURL',
        type: 'selectImage',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for ground image. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'groundType',
        type: 'select',
        options: [
          ['Box', 'box'],
          ['Cylinder', 'cylinder'],
          ['None', 'none']
        ],
        reset: true,
        help: 'Walls only work with a Box ground. If None is selected, there will be no ground! This is only useful if a custom object is added to act as the ground.'
      },
      {
        option: 'imageScale',
        type: 'slider',
        min: '0.1',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Scales the image (eg. when set to 2, each pixel will equal 2mm).'
      },
      {
        option: 'uScale',
        type: 'slider',
        min: '0.1',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Repeats the image horizontally (eg. when set to 2, each image will appear twice).'
      },
      {
        option: 'vScale',
        type: 'slider',
        min: '0.1',
        max: '10',
        step: '0.1',
        reset: true,
        help: 'Repeats the image vertically (eg. when set to 2, each image will appear twice).'
      },
      {
        option: 'groundFriction',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
      },
      {
        option: 'groundRestitution',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
        help: 'Affects the bounciness of the ground'
      },
    ]
  };

  this.wallTemplate = {
    optionsConfigurations: [
      {
        option: 'wall',
        type: 'boolean',
        reset: true
      },
      {
        option: 'wallHeight',
        type: 'slider',
        min: '0.1',
        max: '30',
        step: '0.1',
        reset: true
      },
      {
        option: 'wallThickness',
        type: 'slider',
        min: '0.1',
        max: '30',
        step: '0.1',
        reset: true
      },
      {
        option: 'wallColor',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'wallFriction',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
      },
      {
        option: 'wallRestitution',
        type: 'slider',
        min: '0',
        max: '10',
        step: '0.1',
        help: 'Affects the bounciness of the ground'
      },
    ]
  };

  this.timerTemplate = {
    optionsConfigurations: [
      {
        option: 'timer',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Count up from zero', 'up'],
          ['Count down from duration', 'down']
        ],
        reset: true,
      },
      {
        option: 'timerDuration',
        type: 'slider',
        min: '1',
        max: '300',
        step: '1',
        reset: true,
      },
      {
        option: 'timerEnd',
        type: 'select',
        options: [
          ['Continue running', 'continue'],
          ['Stop the timer only', 'stopTimer'],
          ['Stop the timer and robot', 'stopRobot']
        ],
      },
    ]
  };

  this.robotTemplate = {
    optionsConfigurations: [
      {
        option: 'startPosXYZ',
        type: 'vectors',
        min: '-200',
        max: '200',
        step: '1',
        reset: true
      },
      {
        option: 'startRot',
        type: 'slider',
        min: '-180',
        max: '180',
        step: '5',
        reset: true,
      },
    ]
  };

  this.animationTemplate = {
    optionsConfigurations: [
      {
        option: 'restartAnimationOnRun',
        type: 'boolean',
      },
    ]
  };


  this.boxTemplate = {
    optionsConfigurations: [
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Drop to ground',
            callback: 'moveToGround'
          }
        ]
      },
      {
        option: 'position',
        type: 'vectors',
        min: '-100',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'animationMode',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Loop', 'loop'],
          ['Alternate', 'alternate'],
        ],
        reset: true,
        help: 'Loop: Restart from beginning. Alternate: Alternate between back and forth.'
      },
      {
        option: 'animationKeys',
        type: 'custom',
        generatorFunction: 'setAnimationKeys',
        help: 'Position object, set time, and add key. You need at least two keys for animation to work.'
      },
      {
        option: 'size',
        type: 'vectors',
        min: '1',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageType',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Repeat on every face', 'repeat'],
          ['Only on top face', 'top'],
          ['Only on front face', 'front'],
          ['Map across all faces', 'all']
        ],
        reset: true
      },
      {
        option: 'imageURL',
        type: 'selectImage',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false'],
          ['Custom', 'custom']
        ],
        reset: true
      },
      {
        option: 'physics_mass',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for moveable objects is 100. Set this to 0 to make it a fixed object.'
      },
      {
        option: 'physics_friction',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for objects is 0.1, while the ground is 1.0 by default.'
      },
      {
        option: 'physics_restitution',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Affects the bounciness of the object'
      },
      {
        option: 'physics_dampLinear',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens linear movements.'
      },
      {
        option: 'physics_dampAngular',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens rotations.'
      },
      {
        option: 'physics_group',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Sets the physics group bitmask (default is 1). Use together with mask.'
      },
      {
        option: 'physics_mask',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'A bitmask which sets which physics group this object will interact with. Default is -1 (all groups).'
      },
      {
        option: 'magnetic',
        type: 'boolean',
      },
      {
        option: 'laserDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'ultrasonicDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'receiveShadows',
        type: 'boolean',
        reset: true
      },
      {
        option: 'castShadows',
        type: 'boolean',
        reset: true
      },
    ]
  };

  this.cylinderTemplate = {
    optionsConfigurations: [
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Drop to ground',
            callback: 'moveToGround'
          }
        ]
      },
      {
        option: 'position',
        type: 'vectors',
        min: '-100',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'animationMode',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Loop', 'loop'],
          ['Alternate', 'alternate'],
        ],
        reset: true,
        help: 'Loop: Restart from beginning. Alternate: Alternate between back and forth.'
      },
      {
        option: 'animationKeys',
        type: 'custom',
        generatorFunction: 'setAnimationKeys',
        help: 'Position object, set time, and add key. You need at least two keys for animation to work.'
      },
      {
        option: 'size',
        type: 'vectors',
        min: '1',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'selectImage',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false'],
          ['Custom', 'custom']
        ],
        reset: true
      },
      {
        option: 'physics_mass',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for moveable objects is 100. Set this to 0 to make it a fixed object.'
      },
      {
        option: 'physics_friction',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for objects is 0.1, while the ground is 1.0 by default.'
      },
      {
        option: 'physics_restitution',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Affects the bounciness of the object'
      },
      {
        option: 'physics_dampLinear',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens linear movements.'
      },
      {
        option: 'physics_dampAngular',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens rotations.'
      },
      {
        option: 'physics_group',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Sets the physics group bitmask (default is 1). Use together with mask.'
      },
      {
        option: 'physics_mask',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'A bitmask which sets which physics group this object will interact with. Default is -1 (all groups).'
      },
      {
        option: 'magnetic',
        type: 'boolean',
      },
      {
        option: 'laserDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'ultrasonicDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'receiveShadows',
        type: 'boolean',
        reset: true
      },
      {
        option: 'castShadows',
        type: 'boolean',
        reset: true
      },
    ]
  };

  this.sphereTemplate = {
    optionsConfigurations: [
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Drop to ground',
            callback: 'moveToGround'
          }
        ]
      },
      {
        option: 'position',
        type: 'vectors',
        min: '-100',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'animationMode',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Loop', 'loop'],
          ['Alternate', 'alternate'],
        ],
        reset: true,
        help: 'Loop: Restart from beginning. Alternate: Alternate between back and forth.'
      },
      {
        option: 'animationKeys',
        type: 'custom',
        generatorFunction: 'setAnimationKeys',
        help: 'Position object, set time, and add key. You need at least two keys for animation to work.'
      },
      {
        option: 'size',
        type: 'vectors',
        min: '1',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'selectImage',
        reset: true
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false'],
          ['Custom', 'custom']
        ],
        reset: true
      },
      {
        option: 'physics_mass',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for moveable objects is 100. Set this to 0 to make it a fixed object.'
      },
      {
        option: 'physics_friction',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for objects is 0.1, while the ground is 1.0 by default.'
      },
      {
        option: 'physics_restitution',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Affects the bounciness of the object'
      },
      {
        option: 'physics_dampLinear',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens linear movements.'
      },
      {
        option: 'physics_dampAngular',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens rotations.'
      },
      {
        option: 'physics_group',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Sets the physics group bitmask (default is 1). Use together with mask.'
      },
      {
        option: 'physics_mask',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'A bitmask which sets which physics group this object will interact with. Default is -1 (all groups).'
      },
      {
        option: 'magnetic',
        type: 'boolean',
      },
      {
        option: 'laserDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'ultrasonicDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'receiveShadows',
        type: 'boolean',
        reset: true
      },
      {
        option: 'castShadows',
        type: 'boolean',
        reset: true
      },
    ]
  };

  this.modelTemplate = {
    optionsConfigurations: [
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Drop to ground',
            callback: 'moveToGround'
          }
        ]
      },
      {
        option: 'position',
        type: 'vectors',
        min: '-100',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'animationMode',
        type: 'select',
        options: [
          ['None', 'none'],
          ['Loop', 'loop'],
          ['Alternate', 'alternate'],
        ],
        reset: true,
        help: 'Loop: Restart from beginning. Alternate: Alternate between back and forth.'
      },
      {
        option: 'animationKeys',
        type: 'custom',
        generatorFunction: 'setAnimationKeys',
        help: 'Position object, set time, and add key. You need at least two keys for animation to work.'
      },
      {
        option: 'modelURL',
        type: 'selectModel',
        reset: true
      },
      {
        option: 'modelURL',
        type: 'strText',
        reset: true,
        help: 'URL for GLTF (.glb/.gltf) models. Will not work with most webhosts; Github will work.'
      },
      {
        option: 'modelScale',
        type: 'slider',
        min: '5',
        max: '200',
        step: '5',
        reset: true
      },
      {
        type: 'custom',
        option: 'modelAnimation',
        generatorFunction: 'selectAnimation'
      },
      {
        option: 'physicsOptions',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false'],
          ['Custom', 'custom']
        ],
        reset: true
      },
      {
        option: 'physics_mass',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for moveable objects is 100. Set this to 0 to make it a fixed object.'
      },
      {
        option: 'physics_friction',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Default for objects is 0.1, while the ground is 1.0 by default.'
      },
      {
        option: 'physics_restitution',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Affects the bounciness of the object'
      },
      {
        option: 'physics_dampLinear',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens linear movements.'
      },
      {
        option: 'physics_dampAngular',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Dampens rotations.'
      },
      {
        option: 'physics_group',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'Sets the physics group bitmask (default is 1). Use together with mask.'
      },
      {
        option: 'physics_mask',
        type: 'custom',
        generatorFunction: 'setPhysicsOptions',
        help: 'A bitmask which sets which physics group this object will interact with. Default is -1 (all groups).'
      },
      {
        option: 'magnetic',
        type: 'boolean',
      },
      {
        option: 'laserDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'ultrasonicDetection',
        type: 'select',
        options: [
          ['Default', null],
          ['Invisible (Ray passes through)', 'invisible'],
          ['Absorb with no reflection', 'absorb'],
          ['Normal', 'normal']
        ],
        help: 'Defaults to invisible for physicless objects, and normal for all others.'
      },
      {
        option: 'receiveShadows',
        type: 'boolean',
        reset: true
      },
      {
        option: 'castShadows',
        type: 'boolean',
        reset: true
      },
    ]
  };

  this.hingeTemplate = {
    optionsConfigurations: [
      {
        option: 'position',
        type: 'vectors',
        min: '-100',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'rotation',
        type: 'vectors',
        min: '-180',
        max: '180',
        step: '5',
        reset: true
      },
      {
        option: 'size',
        type: 'vectors',
        min: '1',
        max: '100',
        step: '1',
        reset: true
      },
      {
        option: 'hide',
        type: 'boolean',
        help: 'If set, the hinge will be hidden',
        reset: true
      },
      {
        option: 'speed',
        type: 'floatText',
        help: 'Rotation speed in radians per second'
      },
      {
        option: 'maxForce',
        type: 'floatText',
        help: 'Maximum force applied to achieve the specified speed'
      }
    ]
  };

  this.objectDefault = {
    ...world_Custom.objectDefault,
    position: [0,0,20],
  };

  this.boxDefault = {
    ...this.objectDefault,
    type: 'box',
    imageType: 'repeat',
  };

  this.cylinderDefault = {
    ...this.objectDefault,
    type: 'cylinder',
    imageType: 'cylinder',
  };

  this.sphereDefault = {
    ...this.objectDefault,
    type: 'sphere',
    imageType: 'sphere',
  };

  this.modelDefault = {
    ...this.objectDefault,
    type: 'model',
    imageType: 'sphere',
  };

  this.compoundDefault = {
    type: 'compound',
    objects: []
  };

  this.hingeDefault = {
    type: 'hinge',
    objects: [],
    position: [20,0,0],
    size: [10,2,0],
    hide: true,
    speed: 0,
    maxForce: 0,
    upperLimit: 0,
    lowerLimit: 0
  };

  // Run on page load
  this.init = function() {
    if (typeof babylon.scene == 'undefined') {
      setTimeout(self.init, 500);
      return;
    }

    self.$navs = $('nav li');
    self.$panelControls = $('.panelControlsArea .panelControls');
    self.$panels = $('.panels .panel');
    self.$fileMenu = $('.fileMenu');
    self.$worldMenu = $('.worldMenu');
    self.$snapMenu = $('.snapMenu');

    self.$addObject = $('.addObject');
    self.$cloneObject = $('.cloneObject');
    self.$deleteObject = $('.deleteObject');
    self.$objectsList = $('.objectsList');
    self.$settingsArea = $('.settingsArea');
    self.$objectID = $('.objectID');
    self.$undo = $('.undo');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);
    self.$worldMenu.click(self.toggleWorldMenu);
    self.$snapMenu.click(self.toggleSnapMenu);

    self.$addObject.click(self.addObject);
    self.$cloneObject.click(self.cloneObject);
    self.$deleteObject.click(self.deleteObject);
    self.$undo.click(self.undo);

    babylon.scene.physicsEnabled = false;
    babylon.setCameraMode('arc');
    babylon.renders.push(self.render);

    self.setupDrag();

    babylon.world.animate = false;
    babylon.world.overrideHide = true;

    self.saveHistory();
    self.resetScene();
  };

  // Setup drag
  this.setupDrag = function() {
    let dragBody;
    let dragBodyPos;
    let selected;

    function notClose(a, b) {
      if (Math.abs(a - b) > 0.01) {
        return true;
      }
      return false;
    }

    // Object drag start
    function dragStart(event) {
      dragBody = self.pointerDragBehavior.attachedNode;
      dragBodyPos = dragBody.position.clone();
      selected = self.$objectsList.find('li.selected');

      dragPointStart = event.dragPlanePoint;
      dragBody.computeWorldMatrix(true);
      dragOrigPos = dragBody.absolutePosition.clone();
    }

    // Object drag
    function drag(event) {
      let delta = event.delta;

      if (dragBody.parent) {
        let matrix = dragBody.parent.getWorldMatrix().clone().invert();
        matrix.setTranslation(BABYLON.Vector3.Zero());
        delta = BABYLON.Vector3.TransformCoordinates(delta, matrix);
      }
      dragBodyPos.addInPlace(delta);

      if (notClose(selected[0].object.position[0], dragBodyPos.x)) {
        dragBody.position.x = self.roundToSnap(dragBodyPos.x, self.snapStep[0]);
      }
      if (notClose(selected[0].object.position[1], dragBodyPos.y)) {
        dragBody.position.y = self.roundToSnap(dragBodyPos.y, self.snapStep[2]);
      }
      if (notClose(selected[0].object.position[2], dragBodyPos.z)) {
        dragBody.position.z = self.roundToSnap(dragBodyPos.z, self.snapStep[1]);
      }
    }

    // Object drag end
    function dragEnd(event) {
      if (typeof selected[0].object != 'undefined') {
        self.saveHistory();
        let node = self.pointerDragBehavior.attachedNode;
        let pos = node.position.clone();

        if (typeof node.pseudoParent != 'undefined') {
          let matrix = node.pseudoParent.getWorldMatrix().clone().invert();
          pos = BABYLON.Vector3.TransformCoordinates(pos, matrix);
        }

        if (notClose(selected[0].object.position[0], pos.x)) {
          selected[0].object.position[0] = self.roundToSnap(pos.x, self.snapStep[0]);
        }
        if (notClose(selected[0].object.position[1], pos.z)) {
          selected[0].object.position[1] = self.roundToSnap(pos.z, self.snapStep[1]);
        }
        if (notClose(selected[0].object.position[2], pos.y)) {
          selected[0].object.position[2] = self.roundToSnap(pos.y, self.snapStep[2]);
        }
        self.resetScene(false);
      }
    };

    self.pointerDragPlaneNormal = new BABYLON.Vector3(0,1,0);
    self.pointerDragBehavior = new BABYLON.PointerDragBehavior({dragPlaneNormal: this.pointerDragPlaneNormal});
    self.pointerDragBehavior.useObjectOrientationForDragging = false;
    self.pointerDragBehavior.moveAttached = false;

    self.pointerDragBehavior.onDragStartObservable.add(dragStart);
    self.pointerDragBehavior.onDragObservable.add(drag);
    self.pointerDragBehavior.onDragEndObservable.add(dragEnd);
  }

  // Runs every frame
  this.render = function(delta) {
    let camera = babylon.scene.activeCamera;
    let dir = camera.getTarget().subtract(camera.position);
    let x2 = dir.x ** 2;
    let y2 = dir.y ** 2;
    let z2 = dir.z ** 2;
    let max = Math.max(x2, y2, z2);

    self.pointerDragPlaneNormal.x = 0;
    self.pointerDragPlaneNormal.y = 0;
    self.pointerDragPlaneNormal.z = 0;
    if (x2 == max) {
      self.pointerDragPlaneNormal.x = 1;
    } else if (y2 == max) {
      self.pointerDragPlaneNormal.y = 1;
    } else {
      self.pointerDragPlaneNormal.z = 1;
    }
  }

  // Select animation from model
  this.selectAnimation = function(opt, objectOptions, $div) {
    let currentVal = objectOptions.modelAnimation;

    let selected = self.$objectsList.find('li.selected');
    let id = 'worldBaseObject_' + selected[0].name + selected[0].objectIndex;
    let mesh = babylon.scene.getMeshByID(id);

    if (typeof $div == 'undefined') {
      $div = $('<div>Loading Model...</div>');
    }

    if (mesh == null) {
      // model not loaded yet
      setTimeout(function(){
        self.selectAnimation(opt, objectOptions, $div);
      }, 200);
    } else {
      if (mesh.animations.length > 0) {
        let $select = $('<select></select>');
        let $opt = $('<option>None</option>');
        $select.append($opt);

        mesh.animations.forEach(function(animation){
          $opt = $('<option></option>');
          $opt.text(animation);
          $select.append($opt);
        });

        if (mesh.animations.indexOf(currentVal) == -1) {
          currentVal = 'None';
          objectOptions.modelAnimation = 'None';
        }

        if (currentVal) {
          $select.val(currentVal);
        }

        $select.change(function(){
          self.saveHistory();
          objectOptions.modelAnimation = $select.val();
          self.resetScene(false);
        });

        $div.text('');
        $div.append($select);

      } else {
        objectOptions.modelAnimation = 'None';
        $div.text('');
        $div.append($('<div>No animations in this model</div>'));
      }
    }

    return $div;
  };

  // Set custom physics options
  this.setPhysicsOptions = function(opt, objectOptions) {
    function genSelect (opt, currentVal, setter) {
      let $div = $('<div class="configuration"></div>');
      let $select = $('<select></select>');

      opt.options.forEach(function(option){
        let $opt = $('<option></option>');
        $opt.prop('value', option[1]);
        $opt.text(option[0]);
        if (option[1] == currentVal) {
          $opt.attr('selected', true);
        }

        $select.append($opt);
      });

      $select.change(function(){
        self.saveHistory();
        setter($select.val());
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append($select);
      return $div;
    }

    function genFloatText(opt, currentVal, setter) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');

      $input.val(currentVal);

      $input.change(function(){
        let trimmed = $input.val().trim();
        if (trimmed == '') {
          self.saveHistory();
          setter('');
          if (opt.reset) {
            self.resetScene(false);
          }
          return;
        }

        let val = parseFloat(trimmed);
        if (isNaN(val)) {
          toastMsg('Not a valid number');
        } else {
          self.saveHistory();
          setter(val);
          if (opt.reset) {
            self.resetScene(false);
          }
        }
      });

      $div.append($textBox);
      return $div;
    }

    if (opt.option == 'physicsOptions') {
      let currentVal = objectOptions[opt.option];
      if (typeof objectOptions.physicsOptions == 'object') {
        currentVal = 'custom';
      }
      return genSelect(opt, currentVal, function(val){
        if (val == 'custom') {
          objectOptions[opt.option] = {};
        } else {
          objectOptions[opt.option] = val;
        }
      });
    } else {
      if (typeof objectOptions.physicsOptions != 'object') {
        return false;
      }

      let option = opt.option.replace('physics_', '');
      return genFloatText(opt, objectOptions.physicsOptions[option], function(val){
        if (val == '') {
          delete objectOptions.physicsOptions[option];
        } else {
          objectOptions.physicsOptions[option] = val;
        }
      });
    }
  };


  // Set custom animation keys options
  this.setAnimationKeys = function(opt, objectOptions) {
    if (objectOptions.animationMode == 'none') {
      return '';
    }

    if (typeof objectOptions.animationKeys == 'undefined') {
      objectOptions.animationKeys = [];
    }

    let $div = $('<div class="configuration"></div>');
    let $buttonsBox = $('<div class="buttons"></div>');
    let $keyCount = $('<span></span>');
    $keyCount.text(objectOptions.animationKeys.length);
    let $keyTime = $('<input type="number"></input>');
    let maxTime = 0;
    objectOptions.animationKeys.forEach(animationKey => maxTime = Math.max(animationKey.time, maxTime));
    $keyTime.val(maxTime);

    function edit() {
      let $body = $('<div class="editAnimationKeys"></div>');
      let $table = $(
        '<table class="animationKeys">' +
          '<thead>' +
            '<tr>' +
              '<th>Time</th>' +
              '<th colspan="3">Position</th>' +
              '<th colspan="3">Rotation</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody></tbody>' +
        '</table>'
      );
      let $tbody = $table.find('tbody');

      objectOptions.animationKeys.forEach(function(animationKey){
        function round(input) {
          return Math.round(input*100) / 100;
        }
        let $row = $('<tr></tr>');
        $row[0].animationKey = animationKey;
        let $time = $('<input type="number"></input>').val(animationKey.time);
        $row.append($('<td></td>').append($time));
        $row.append($('<td></td>').text(round(animationKey.position[0])));
        $row.append($('<td></td>').text(round(animationKey.position[1])));
        $row.append($('<td></td>').text(round(animationKey.position[2])));
        $row.append($('<td></td>').text(round(animationKey.rotation[0])));
        $row.append($('<td></td>').text(round(animationKey.rotation[1])));
        $row.append($('<td></td>').text(round(animationKey.rotation[2])));
        let $delete = $('<button class="delete">Delete</button>')
        $row.append($('<td></td>').append($delete));

        $delete.click(function(){
          $row.remove();
        });

        $tbody.append($row);
      });
      $body.append($table);

      let $buttons = $(
        '<button type="button" class="cancel btn-light">Cancel</button>' +
        '<button type="button" class="ok btn-light">Ok</button>'
      );

      let $dialog = dialog('Edit animation keys', $body, $buttons);

      $buttons.siblings('.cancel').click(function() {
        $dialog.close();
      });
      $buttons.siblings('.ok').click(function() {
        let animationKeys = [];
        $tbody.children().each(function(i, ele){
          let animationKey = ele.animationKey;
          animationKey.time = parseFloat(ele.children[0].children[0].value);
          animationKeys.push(animationKey);
        });
        let valid = true;
        animationKeys.sort(function(a, b){
          if (b.time == a.time) {
            toastMsg('Invalid animation (Duplicate key timing)');
            valid = false;
          } else if (b.time > a.time) {
            return -1;
          } else {
            return 1;
          }
        });
        if (animationKeys.length > 0 && animationKeys[0].time != 0) {
          toastMsg('Invalid animation (Start time not 0)');
          return;
        }

        if (valid) {
          objectOptions.animationKeys = animationKeys;
          $dialog.close();
          self.resetScene();
        }
      });
    }

    function addKey() {
      let time = $keyTime.val();
      if (time.trim() == '') {
        time = 0;
      } else {
        try {
          time = parseFloat(time);
        } catch (e) {
          toastMsg('Error: Invalid time');
          return;
        }
      }
      if (objectOptions.animationKeys.length == 0 && time != 0) {
        toastMsg('Error: First key must be at time 0');
        return;
      }

      if (objectOptions.animationKeys.filter(animationKey => animationKey.time == time).length > 0) {
        toastMsg('Error: Key time must be unique');
        return;
      }

      let key = {
        time: time,
        position: [...objectOptions.position],
        rotation: [...objectOptions.rotation]
      };

      objectOptions.animationKeys.push(key);
      objectOptions.animationKeys.sort(function(a, b){
        if (b.time > a.time) {
          return -1;
        } else {
          return 1;
        }
      });

      self.resetScene();
    }

    let buttons = [
      {
        label: 'Edit',
        callback: edit
      },
      {
        label: 'Add Key',
        callback: addKey
      }
    ];

    $buttonsBox.append('<span>Key Time (s):</span>');
    $buttonsBox.append($keyTime);

    let $button = $('<button></button>');
    $button.text('Add Key');
    $button.click(addKey);
    $buttonsBox.append($button);

    $button = $('<button></button>');
    $button.text('Edit');
    $button.click(edit);
    $buttonsBox.append($button);
    $buttonsBox.append('<span>&nbsp;</span>');
    $buttonsBox.append($keyCount);

    $div.append($buttonsBox);

    return $div;
  };

  // Apply pointerDragBehavior to selected mesh
  this.applyDragToSelected = function() {
    let selected = self.$objectsList.find('li.selected');
    if (typeof selected[0].objectIndex != 'undefined') {
      let id = 'worldBaseObject_' + selected[0].name + selected[0].objectIndex;
      let mesh = babylon.scene.getMeshByID(id);

      // Models takes a while to load
      if (mesh == null) {
        setTimeout(self.applyDragToSelected, 200);
        return;
      }

      mesh.addBehavior(self.pointerDragBehavior);
    }
  };

  // Save history
  this.saveHistory = function() {
    if (typeof self.editHistory == 'undefined') {
      self.editHistory = [];
    }

    self.editHistory.push(JSON.stringify(self.worldOptions));
  };

  // Clear history
  this.clearHistory = function() {
    if (typeof self.editHistory != 'undefined') {
      self.editHistory = [];
    }
  };

  // Undo
  this.undo = function() {
    if (typeof self.editHistory != 'undefined' && self.editHistory.length > 0) {
      var lastDesign = self.editHistory.pop();
      self.worldOptions = JSON.parse(lastDesign);
      self.resetScene();
    }
  };

  // Drop object to ground level
  this.moveToGround = function(opt, objectOptions) {
    let selected = self.$objectsList.find('li.selected');
    if (typeof selected[0].objectIndex != 'undefined') {
      let id = 'worldBaseObject_' + selected[0].name + selected[0].objectIndex;
      let mesh = babylon.scene.getMeshByID(id);

      let down = new BABYLON.Vector3(0, -1, 0);
      let ray = new BABYLON.Ray(mesh.position, down, 1000);
      mesh.isPickable = false;
      let hit = babylon.scene.pickWithRay(ray);
      mesh.isPickable = true;
      let groundY = 0;
      if (hit.hit) {
        groundY = hit.pickedPoint.y;
      }

      if (selected[0].name == 'box') {
        let extendSize = mesh.getBoundingInfo().boundingBox.extendSizeWorld;
        objectOptions.position[2] = extendSize.y + groundY;

      } else if (selected[0].name == 'sphere') {
        objectOptions.position[2] = objectOptions.size[0] / 2 + groundY;

      } else if (selected[0].name == 'cylinder') {
        let quad = mesh.absoluteRotationQuaternion;
        let origVec = new BABYLON.Vector3(0,1,0);
        let rotVec =  new BABYLON.Vector3();
        rotVec = origVec.rotateByQuaternionToRef(quad, rotVec);

        let angle = Math.acos(BABYLON.Vector3.Dot(origVec, rotVec));
        let y2 = -(objectOptions.size[1] / 2) * Math.sin(angle) + -(objectOptions.size[0] / 2) * Math.cos(angle);

        objectOptions.position[2] = -y2 + groundY;

      } else if (selected[0].name == 'model') {
        let extendSize = mesh.getBoundingInfo().boundingBox.extendSizeWorld;
        objectOptions.position[2] = extendSize.y + groundY;
      }
      self.resetScene(false);
    }
  };

  // Show options
  this.showObjectOptions = function(li) {
    let name = li.name;

    let OBJECTS = ['box', 'cylinder', 'sphere', 'model', 'hinge']
    if (OBJECTS.indexOf(name) != -1) {
      self.$objectID.text('worldBaseObject_' + li.name + li.objectIndex);
    } else {
      self.$objectID.text('');
    }

    let currentOptions = li.object;
    self.$settingsArea.empty();

    let genConfig = new GenConfig(self, self.$settingsArea);

    if (name == 'ground') {
      genConfig.displayOptionsConfigurations(self.groundTemplate, currentOptions);
    } else if (name == 'wall') {
      genConfig.displayOptionsConfigurations(self.wallTemplate, currentOptions);
    } else if (name == 'timer') {
      genConfig.displayOptionsConfigurations(self.timerTemplate, currentOptions);
    } else if (name == 'robot') {
      genConfig.displayOptionsConfigurations(self.robotTemplate, currentOptions);
    } else if (name == 'animation') {
      genConfig.displayOptionsConfigurations(self.animationTemplate, currentOptions);
    } else if (name == 'box') {
      genConfig.displayOptionsConfigurations(self.boxTemplate, currentOptions);
    } else if (name == 'cylinder') {
      genConfig.displayOptionsConfigurations(self.cylinderTemplate, currentOptions);
    } else if (name == 'sphere') {
      genConfig.displayOptionsConfigurations(self.sphereTemplate, currentOptions);
    } else if (name == 'model') {
      genConfig.displayOptionsConfigurations(self.modelTemplate, currentOptions);
    } else if (name == 'hinge') {
      genConfig.displayOptionsConfigurations(self.hingeTemplate, currentOptions);
    }
  };

  // Setup picking ray
  this.setupPickingRay = function() {
    babylon.scene.onPointerUp = function(e, hit) {
      if (e.button != 0) {
        return;
      }

      if (hit.pickedMesh != null && hit.pickedMesh.id.match(/^worldBaseObject_/) != null) {
        let index = hit.pickedMesh.id.match(/[0-9]+$/);
        if (index) {
          index = parseInt(index[0]);
          let childList = self.$objectsList.find('li');
          for (child of childList) {
            if (typeof child.objectIndex != 'undefined' && child.objectIndex == index) {
              childList.removeClass('selected');
              $(child).addClass('selected');
              self.objectSelect(child);
              break;
            }
          }
        }
      }
    }
  };

  // Reset scene
  this.resetScene = function(reloadComponents=true) {
    simPanel.hideWorldInfoPanel();
    worlds[0].setOptions(self.worldOptions).then(function(){
      babylon.resetScene();
      babylon.scene.physicsEnabled = false;
      self.setupPickingRay();
      if (reloadComponents) {
        let selected = self.$objectsList.find('li.selected');
        let childList = self.$objectsList.find('li');
        let selectedIndex = [...childList].indexOf(selected[0]);

        self.loadIntoObjectsWindow(self.worldOptions);

        childList = self.$objectsList.find('li');
        if (typeof childList[selectedIndex] != 'undefined') {
          childList.removeClass('selected');
          $(childList[selectedIndex]).addClass('selected');
        }
      }
      let selected = self.$objectsList.find('li.selected');
      self.showObjectOptions(selected[0]);
      self.highlightSelected();
      self.applyDragToSelected();
    });
  }

  // Add a new object to selected
  this.addObject = function() {
    let $body = $('<div class="selectObject"></div>');
    let $select = $('<select></select>');
    let $description = $('<div class="description"><div class="text"></div></div>');

    let objectTypes = ['Box', 'Cylinder', 'Sphere', 'Model', 'Compound', 'Hinge'];

    objectTypes.forEach(function(type){
      let $object = $('<option></option>');
      $object.prop('value', type);
      $object.text(type);
      $select.append($object);
    });

    $body.append($select);
    $body.append($description);

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>' +
      '<button type="button" class="confirm btn-success">Ok</button>'
    );

    let $dialog = dialog('Select Object Type', $body, $buttons);

    $buttons.siblings('.cancel').click(function() { $dialog.close(); });
    $buttons.siblings('.confirm').click(function(){
      self.saveHistory();

      let selected = self.getSelectedComponent()[0];
      let object = null;
      if ($select.val() == 'Box') {
        object = JSON.parse(JSON.stringify(self.boxDefault));
      } else if ($select.val() == 'Cylinder') {
        object = JSON.parse(JSON.stringify(self.cylinderDefault));
      } else if ($select.val() == 'Sphere') {
        object = JSON.parse(JSON.stringify(self.sphereDefault));
      } else if ($select.val() == 'Model') {
        object = JSON.parse(JSON.stringify(self.modelDefault));
      } else if ($select.val() == 'Compound') {
        object = JSON.parse(JSON.stringify(self.compoundDefault));
      } else if ($select.val() == 'Hinge') {
        object = JSON.parse(JSON.stringify(self.hingeDefault));
      }

      if ($select.val() == 'Compound') {
        if (selected.name == 'compound' && selected.object.objects.length == 0) {
            toastMsg('First object in a compound cannot be another compound');
            $dialog.close();
            return;
        }
      }

      if ($select.val() == 'Hinge') {
        if (selected.name != 'compound') {
          toastMsg('Hinges can only be added to compounds');
          $dialog.close();
          return;
        } else if (selected.object.objects.length == 0) {
          toastMsg('First object in a compound cannot be a hinge');
          $dialog.close();
          return;
        }
      }

      if (selected.name == 'hinge') {
        if (selected.object.objects.length > 0) {
          toastMsg('Hinges can only contain one object');
          $dialog.close();
          return
        }
      }

      if (selected.name == 'compound' || selected.name == 'hinge') {
        selected.object.objects.push(object);
      } else {
        self.worldOptions.objects.push(object);
      }

      self.resetScene();
      $dialog.close();
    });
  };

  // Clone selected object
  this.cloneObject = function() {
    let $selected = self.getSelectedComponent();
    let VALID_OBJECTS = ['box', 'cylinder', 'sphere', 'model', 'compound', 'hinge'];
    if (VALID_OBJECTS.indexOf($selected[0].name) == -1) {
      toastMsg('Only objects can be cloned');
      return;
    }

    self.saveHistory();
    let object = JSON.parse(JSON.stringify($selected[0].object));
    let parentCompound = self.findParentCompound($selected[0].objectIndex);
    parentCompound.objects.push(object);
    self.resetScene();
  };

  // Find the parent of a child object
  this.findParentCompound = function(objectIndex) {
    let currentIndex = -1;

    function findParent(parent) {
      for (let i=0; i<parent.objects.length; i++) {
        currentIndex++;
        if (currentIndex == objectIndex) {
          return parent;
        } else if (parent.objects[i].type == 'compound' || parent.objects[i].type == 'hinge') {
          let result = findParent(parent.objects[i]);
          if (result != null) {
            return result;
          }
        }
      }
      return null;
    }

    return findParent(self.worldOptions);
  };

  // Delete selected object
  this.deleteObject = function() {
    let $selected = self.getSelectedComponent();
    let VALID_OBJECTS = ['box', 'cylinder', 'sphere', 'model', 'compound', 'hinge']
    if (VALID_OBJECTS.indexOf($selected[0].name) == -1) {
      toastMsg('Only objects can be deleted');
      return;
    }

    self.saveHistory();
    let parentCompound = self.findParentCompound($selected[0].objectIndex);
    if (parentCompound !== null) {
      let index = parentCompound.objects.indexOf($selected[0].object);
      parentCompound.objects.splice(index, 1);
    } else {
      let index = self.worldOptions.objects.indexOf($selected[0].object);
      self.worldOptions.objects.splice(index, 1);
    }
    self.resetScene();
  };

  // Get selected component
  this.getSelectedComponent = function() {
    return self.$objectsList.find('li.selected');
  };

  // Select list item on click
  this.objectSelect = function(target) {
    if (target.nodeName != 'LI') {
      return;
    }
    let prevSelection = self.$objectsList.find('li.selected');
    if (typeof prevSelection[0].objectIndex != 'undefined') {
      let id = 'worldBaseObject_' + prevSelection[0].name + prevSelection[0].objectIndex;
      let mesh = babylon.scene.getMeshByID(id);
      if (mesh) {
        mesh.removeBehavior(self.pointerDragBehavior);
      }
    }
    prevSelection.removeClass('selected');

    target.classList.add('selected');
    self.applyDragToSelected();

    self.showObjectOptions(target);
    self.highlightSelected();
  };

  // Highlight selected component
  this.highlightSelected = function() {
    let $selected = self.$objectsList.find('li.selected');
    if ($selected.length < 1) {
      return;
    }

    let wireframe = babylon.scene.getMeshByID('wireframeObjectSelector');
    if (wireframe != null) {
      wireframe.dispose();
    }
    let index = $selected[0].objectIndex;
    if (typeof index != 'undefined') {
      let id = 'worldBaseObject_' + $selected[0].name + index;
      let body = babylon.scene.getMeshByID(id);

      // Models takes a while to load
      if (body == null) {
        setTimeout(self.highlightSelected, 200);
        return;
      }

      let size = body.getBoundingInfo().boundingBox.extendSize;
      let options = {
        height: size.y * 2,
        width: size.x * 2,
        depth: size.z * 2
      };
      let wireframeMat = babylon.scene.getMaterialByID('wireframeObjectSelector');
      if (wireframeMat == null) {
        wireframeMat = new BABYLON.StandardMaterial('wireframeObjectSelector', babylon.scene);
        wireframeMat.alpha = 0;
      }

      wireframe = BABYLON.MeshBuilder.CreateBox('wireframeObjectSelector', options, babylon.scene);
      wireframe.material = wireframeMat;
      wireframe.position = body.absolutePosition;
      wireframe.rotationQuaternion = body.absoluteRotationQuaternion;
      wireframe.enableEdgesRendering();
      wireframe.edgesWidth = 50;
      wireframe.isPickable = false;
      let wireframeAnimation = new BABYLON.Animation(
        'wireframeAnimation',
        'edgesColor',
        30,
        BABYLON.Animation.ANIMATIONTYPE_COLOR4,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );
      var keys = [];
      keys.push({
        frame: 0,
        value: new BABYLON.Color4(0, 0, 1, 1)
      });
      keys.push({
        frame: 15,
        value: new BABYLON.Color4(1, 0, 0, 1)
      });
      keys.push({
        frame: 30,
        value: new BABYLON.Color4(0, 0, 1, 1)
      });
      wireframeAnimation.setKeys(keys);
      wireframe.animations.push(wireframeAnimation);
      babylon.scene.beginAnimation(wireframe, 0, 30, true);
    }
  }

  // Load world into objects window
  this.loadIntoObjectsWindow = function(options) {
    let objectIndex = 0;

    let $ul = $('<ul></ul>');
    let $li = $('<li class="selected">Ground</li>');
    $li[0].name = 'ground';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Wall</li>');
    $li[0].name = 'wall';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Timer</li>');
    $li[0].name = 'timer';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Robot</li>');
    $li[0].name = 'robot';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Animation</li>');
    $li[0].name = 'animation';
    $li[0].object = options;
    $ul.append($li);

    $li = $('<li>Objects</li>');
    $li[0].name = 'objects';
    $li[0].object = {};
    $ul.append($li);

    function listObject(object) {
      // Apply default options
      for (let key in self.objectDefault) {
        if (typeof object[key] == 'undefined') {
          object[key] = self.objectDefault[key];
        }
      }

      let $item = $('<li></li>');
      $item.text(object.type);
      $item[0].name = object.type;
      $item[0].object = object;
      $item[0].objectIndex = objectIndex++;
      if (object.type == 'compound' || object.type == 'hinge') {
        let $subList = $('<ul></ul>');
        object.objects.forEach(function(object){
          let $subItem = listObject(object);
          $subItem[0].child = true;
          $subList.append($subItem);
        });
        $item.append($subList);
      }

      return $item;
    }

    let $list = $('<ul></ul>');
    options.objects.forEach(function(object){
      $list.append(listObject(object));
    });

    if ($list.children().length > 0) {
      $ul.append($('<li class="ulHolder"></li>').append($list));
    }

    $ul.find('li').click(function(e) {
      self.objectSelect(e.target);
      e.stopPropagation();
    });

    self.$objectsList.empty();
    self.$objectsList.append($ul);
  };

  // Save world to json file
  this.saveWorld = function() {
    let world = {
      worldName: 'custom',
      options: self.worldOptions
    };

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(world, null, 2));
    hiddenElement.target = '_blank';
    hiddenElement.download = 'custom_world.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // Load object from json file
  this.loadObjectLocal = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        let objects = JSON.parse(this.result).objects;

        self.saveHistory();

        let selected = self.getSelectedComponent()[0];
        if (
          selected.name == 'compound'
          && (objects.type != 'Compound' || selected.object.objects.length > 0)
        ) {
          selected.object.objects.push(objects[0]);
        } else {
          self.worldOptions.objects.push(objects[0]);
        }

        self.resetScene();
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // Save selected object to json file
  this.saveObject = function() {
    let $selected = self.getSelectedComponent();

    let save = {
      objects: []
    };

    save.objects.push($selected[0].object);

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:application/json;base64,' + btoa(JSON.stringify(save, null, 2));
    hiddenElement.target = '_blank';
    hiddenElement.download = 'custom_object.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
  };

  // New world using defaults
  this.newWorld = function() {
    let options = {
      message: 'Create a new empty world? You will lose all unsaved changes.',
    };
    confirmDialog(options, function(){
      self.worldOptions = JSON.parse(JSON.stringify(worlds[0].defaultOptions));
      self.clearHistory();
      self.saveHistory();
      self.resetScene();
    });
  };

  // Load world from json file
  this.loadWorldLocal = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        let loadedJson = JSON.parse(this.result);

        if (loadedJson.worldName != 'custom') {
          let msg = 'Only "custom" worlds can be edited in the world builder.<br>';
          msg += 'This json file is for a "' + loadedJson.worldName + '" world.';
          showErrorModal(msg);
          return;
        }

        self.worldOptions = JSON.parse(JSON.stringify(worlds[0].defaultOptions));
        Object.assign(self.worldOptions, loadedJson.options);
        self.clearHistory();
        self.saveHistory();
        self.resetScene();
      };
      reader.readAsText(e.target.files[0]);
    });
  };

  // Toggle filemenu
  this.toggleFileMenu = function(e) {
    if ($('.fileMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      let menuItems = [
        {html: 'New World', line: true, callback: self.newWorld},
        {html: 'Load world from file', line: false, callback: self.loadWorldLocal},
        {html: 'Save world to file', line: true, callback: self.saveWorld},
        {html: 'Load object from file', line: false, callback: self.loadObjectLocal},
        {html: 'Save object to file', line: false, callback: self.saveObject},

      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // Toggle worldmenu
  this.toggleWorldMenu = function(e) {
    if ($('.worldMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      function toggleAnimate() {
        if (babylon.world.animate) {
          babylon.world.animate = false;
        } else {
          babylon.world.animate = true;
        }
      }

      let menuItems = [
        {html: i18n.get('Animate'), line: false, callback: toggleAnimate }
      ];
      if (babylon.world.animate) {
        menuItems[0].html = '<span class="tick">&#x2713;</span> ' + menuItems[0].html;
      }

      menuDropDown(self.$worldMenu, menuItems, {className: 'worldMenuDropDown'});
    }
  };

  // Snapping
  this.snapStep = [0, 0, 0];
  this.roundToSnap = function(value, snap) {
    if (snap == 0) {
      return value;
    }
    let inv = 1.0 / snap;
    return Math.round(value * inv) / inv;
  }

  // Toggle snapmenu
  this.toggleSnapMenu = function(e) {
    if ($('.snapMenuDropDown').length == 0) {
      $('.menuDropDown').remove();
      e.stopPropagation();

      function snapNone() {
        self.snapStep = [0, 0, 0];
      }
      function snap02() {
        self.snapStep = [0.2, 0.2, 0.2];
      }
      function snapTechnic() {
        self.snapStep = [0.4, 0.4, 0.4];
      }
      function snapLego() {
        self.snapStep = [0.4, 0.4, 0.48];
      }
      function snap05() {
        self.snapStep = [0.5, 0.5, 0.5];
      }
      function snap10() {
        self.snapStep = [1, 1, 1];
      }

      let menuItems = [
        {html: 'No Snapping', line: false, callback: snapNone},
        {html: 'Snap to 0.2cm', line: false, callback: snap02},
        {html: 'Snap to 0.4cm (Lego Technic)', line: false, callback: snapTechnic},
        {html: 'Snap to Lego (xy: 0.4, z: 0.48)', line: false, callback: snapLego},
        {html: 'Snap to 0.5cm', line: false, callback: snap05},
        {html: 'Snap to 1cm', line: false, callback: snap10},
      ];
      var tickIndex = 0;
      if (self.snapStep[2] == 0) {
        tickIndex = 0;
      } else if (self.snapStep[2] == 0.2) {
        tickIndex = 1;
      } else if (self.snapStep[2] == 0.4) {
        tickIndex = 2;
      } else if (self.snapStep[2] == 0.48) {
        tickIndex = 3;
      } else if (self.snapStep[2] == 0.5) {
        tickIndex = 4;
      } else if (self.snapStep[2] == 1) {
        tickIndex = 5;
      }
      menuItems[tickIndex].html = '<span class="tick">&#x2713;</span> ' + menuItems[tickIndex].html;

      menuDropDown(self.$snapMenu, menuItems, {className: 'snapMenuDropDown'});
    }
  };

  // Clicked on tab
  this.tabClicked = function(tabNav) {
  };
}

// Init class

builder.init();
