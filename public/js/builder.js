var builder = new function() {
  var self = this;

  this.worldOptions = JSON.parse(JSON.stringify(worlds[0].defaultOptions));

  this.groundTemplate = {
    optionsConfigurations: [
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Select built-in image',
            callback: 'selectImage'
          }
        ]
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
        option: 'size',
        type: 'vectors',
        min: '1',
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
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        option: 'imageType',
        type: 'select',
        options: [
          ['Repeat on every face', 'repeat'],
          ['Only on top face', 'top'],
          ['Only on front face', 'front'],
          ['Map across all faces', 'all']
        ],
        reset: true
      },
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Select built-in image',
            callback: 'selectImage'
          }
        ]
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'select',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false']
        ],
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
        option: 'size',
        type: 'vectors',
        min: '1',
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
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Select built-in image',
            callback: 'selectImage'
          }
        ]
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'select',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false']
        ],
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
        option: 'size',
        type: 'vectors',
        min: '1',
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
        option: 'color',
        type: 'color',
        help: 'Color in hex',
        reset: true
      },
      {
        type: 'buttons',
        buttons: [
          {
            label: 'Select built-in image',
            callback: 'selectImage'
          }
        ]
      },
      {
        option: 'imageURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
      },
      {
        option: 'physicsOptions',
        type: 'select',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false']
        ],
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
        type: 'buttons',
        buttons: [
          {
            label: 'Select built-in model',
            callback: 'selectModel'
          }
        ]
      },
      {
        option: 'modelURL',
        type: 'strText',
        reset: true,
        help: 'URL for image texture. Will not work with most webhosts; Imgur will work.'
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
        option: 'physicsOptions',
        type: 'select',
        options: [
          ['Fixed', 'fixed'],
          ['Moveable', 'moveable'],
          ['Physicsless', 'false']
        ],
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

  this.pointerDragBehavior = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)});
  this.pointerDragBehavior.useObjectOrientationForDragging = false;

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

    self.$addObject = $('.addObject');
    self.$cloneObject = $('.cloneObject');
    self.$deleteObject = $('.deleteObject');
    self.$objectsList = $('.objectsList');
    self.$settingsArea = $('.settingsArea');
    self.$undo = $('.undo');

    self.$navs.click(self.tabClicked);
    self.$fileMenu.click(self.toggleFileMenu);

    self.$addObject.click(self.addObject);
    self.$cloneObject.click(self.cloneObject);
    self.$deleteObject.click(self.deleteObject);
    self.$undo.click(self.undo);

    babylon.scene.physicsEnabled = false;
    babylon.setCameraMode('arc')

    self.pointerDragBehavior.onDragEndObservable.add(self.dragEnd);

    self.saveHistory();
    self.resetScene();
  };

  // Select built in images
  this.selectImage = function(objectOptions) {
    let $body = $('<div class="selectImage"></div>');
    let $filter = $(
      '<div class="filter">Filter by Type: ' +
        '<select>' +
          '<option selected value="any">Any</option>' +
          '<option value="box">Box</option>' +
          '<option value="cylinder">Cylinder</option>' +
          '<option value="sphere">Sphere</option>' +
          '<option value="ground">Ground</option>' +
          '<option value="robot">Robot</option>' +
        '</select>' +
      '</div>'
    );
    let $select = $filter.find('select');
    let $imageList = $('<div class="images"></div>');

    BUILT_IN_IMAGES.forEach(function(image){
      let basename = image.url.split('/').pop();

      let $row = $('<div class="row"></div>');
      $row.addClass(image.type);

      let $descriptionBox = $('<div class="description"></div>');
      let $basename = $('<p class="bold"></p>').text(basename + ' (' + image.type + ')');
      let $description = $('<p></p>').text(image.description);
      $descriptionBox.append($basename);
      $descriptionBox.append($description);

      let $selectBox = $('<div class="select"><button>Select</button></div>');
      let $select = $selectBox.find('button');
      $select.prop('url', image.url);

      $select.click(function(e){
        objectOptions.imageURL = e.target.url;
        self.resetScene(false);
        $dialog.close();
      });

      $row.append($descriptionBox);
      $row.append($selectBox);
      $imageList.append($row);
    });

    $body.append($filter);
    $body.append($imageList);

    $select.change(function(){
      let filter = $select.val();

      $imageList.find('.row').removeClass('hide');
      if (filter != 'any') {
        $imageList.find(':not(.row.' + filter + ')').addClass('hide');
      }
    });

    let $buttons = $(
      '<button type="button" class="cancel btn-light">Cancel</button>'
    );

    let $dialog = dialog('Select Built-In Image', $body, $buttons);

    $buttons.click(function() { $dialog.close(); });
  };

  // Select built in models
  this.selectModel = function(objectOptions) {
    let $body = $('<div class="selectModel"></div>');
    let $filter = $(
      '<div class="filter">Filter by Type: ' +
        '<select>' +
          '<option selected value="any">Any</option>' +
        '</select>' +
      '</div>'
    );
    let $select = $filter.find('select');
    for (category of BUILT_IN_MODELS_CATEGORIES) {
      $select.append('<option>' + category + '</option');
    }
    let $search = $(
      '<div class="search">Search: ' +
        '<input type="text"></input>' +
      '</div>'
    );
    let $searchInput = $search.find('input');

    let $itemList = $('<div class="items"></div>');

    BUILT_IN_MODELS.forEach(function(model){
      let basename = model.url.split('/').pop();

      let $row = $('<div class="row"></div>');
      let category = model.category.replace(/\W/g, '');
      $row.addClass(category);

      let $descriptionBox = $('<div class="description"></div>');
      let $basename = $('<p class="bold"></p>').text(basename);
      $descriptionBox.append($basename);

      let $selectBox = $('<div class="select"><button>Select</button></div>');
      let $select = $selectBox.find('button');
      $select.prop('url', model.url);

      $select.click(function(e){
        objectOptions.modelURL = e.target.url;
        self.resetScene(false);
        $dialog.close();
      });

      $row.append($descriptionBox);
      $row.append($selectBox);
      $itemList.append($row);
    });

    $body.append($filter);
    $body.append($search);
    $body.append($itemList);

    function filterList(){
      let filter = $select.val();
      let search = $searchInput.val().trim().toLowerCase();

      let count = 0;
      $itemList[0].childNodes.forEach(function(item){
        let itemText = item.childNodes[0].textContent.toLowerCase();
        if (
          (filter == 'any' || item.classList.contains(filter.replace(/\W/g, '')))
          && (search == '' || itemText.indexOf(search) != -1)
        ) {
          item.classList.remove('hide');
          count++;
        } else {
          item.classList.add('hide');
        }
      });

      updateSearchCount(count);
    }

    $select.change(filterList);
    $searchInput.on('input', filterList);

    let $buttons = $(
      '<div class="searchCount"></div><button type="button" class="cancel btn-light">Cancel</button>'
    );

    function updateSearchCount(count) {
      $buttons.siblings('.searchCount').text(count + ' models found');
    }

    updateSearchCount($itemList[0].childNodes.length);

    let $dialog = dialog('Select Built-In Image', $body, $buttons);

    $buttons.click(function() { $dialog.close(); });
  };

  // Object drag end
  this.dragEnd = function(event) {
    let selected = self.$objectsList.find('li.selected');
    if (typeof selected[0].object != 'undefined') {
      self.saveHistory();
      let pos = self.pointerDragBehavior.attachedNode.position;
      selected[0].object.position[0] = pos.x;
      selected[0].object.position[1] = pos.z;
      selected[0].object.position[2] = pos.y;
      self.resetScene(false);
    }
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
  this.moveToGround = function(objectOptions) {
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
    let object = li.object;
    self.$settingsArea.empty();

    function getTitle(opt) {
      let $title = $('<div class="configurationTitle"></div>');
      let $toolTip = $('<span> </span><div class="tooltip">?<div class="tooltiptext"></div></div>');
      $title.text(opt.option);

      if (opt.help) {
        $toolTip.find('.tooltiptext').text(opt.help);
        $title.append($toolTip);
      }
      if (opt.helpSide) {
        $toolTip.addClass(opt.helpSide);
      } else {
        $toolTip.addClass('left');
      }

      return $title;
    }

    function genLabel(opt) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"></div>');
      $textBox.text(opt.text);

      $div.append($textBox);

      return $div;
    }

    function genButtons(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $buttonsBox = $('<div class="color"></div>');

      for (let button of opt.buttons) {
        let $button = $('<button></button>');
        $button.text(button.label);
        $button.click(function() {
          self[button.callback](currentOptions);
        });
        $buttonsBox.append($button);
      }

      $div.append($buttonsBox);

      return $div;
    }

    function genColor(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $colorBox = $('<div class="color"><input type="color"><input type="text"></div>');
      let $alphaBox = $('<div class="slider">Opacity: <input type="range"></div>');
      let $color = $colorBox.find('input[type=color]');
      let $text = $colorBox.find('input[type=text]');
      let $alpha = $alphaBox.find('input');
      $alpha.attr('min', 0);
      $alpha.attr('max', 255);
      $alpha.attr('step', 1);
      let currentVal = currentOptions[opt.option];

      function setInputs(currentVal) {
        // Strip hex
        if (currentVal[0] == '#') {
          currentVal = currentVal.slice(1);
        }

        // Convert 3/4 notation to 6/8
        if (currentVal.length < 6) {
          let tmp = '';
          for (let c of currentVal) {
            tmp = c + c;
          }
          currentVal = tmp;
        }

        // Split into color and alpha
        let currentValColor = currentVal.slice(0,6).toLowerCase();
        let currentValAlpha = currentVal.slice(6,8);
        if (currentValAlpha == '') {
          currentValAlpha = 255;
        } else {
          currentValAlpha = parseInt(currentValAlpha, 16);
        }

        $color.val('#' + currentValColor);
        $alpha.val(currentValAlpha);
        $text.val('#' + currentValColor + ('0' + currentValAlpha.toString(16)).slice(-2));
      }

      setInputs(currentVal);

      function setColor() {
        let valColor = $color.val();
        let valAlpha = $alpha.val();
        valAlpha = ('0' + parseInt(valAlpha).toString(16)).slice(-2);

        let val = valColor + valAlpha;
        self.saveHistory();
        currentOptions[opt.option] = val;
        $text.val(val);
        if (opt.reset) {
          self.resetScene(false);
        }
      }

      $color.change(setColor);
      $alpha.change(setColor);
      $text.change(function(){
        let val = $text.val();
        setInputs(val);
        self.saveHistory();
        currentOptions[opt.option] = val;
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($colorBox);
      $div.append($alphaBox);

      return $div;
    }

    function genSliderBox(opt, currentValue, callback) {
      let $sliderBox = $(
        '<div class="slider">' +
          '<input type="range">' +
          '<input type="text">' +
        '</div>'
      );
      let $slider = $sliderBox.find('input[type=range]');
      let $input = $sliderBox.find('input[type=text]');

      $slider.attr('min', opt.min);
      $slider.attr('max', opt.max);
      $slider.attr('step', opt.step);
      $slider.attr('value', currentValue);
      $input.val(currentValue);

      $slider.on('input', function(){
        $input.val($slider.val());
      });
      $slider.on('change', function(){
        self.saveHistory();
        callback(parseFloat($slider.val()));
        if (opt.reset) {
          self.resetScene(false);
        }
      })
      $input.change(function(){
        self.saveHistory();
        callback(parseFloat($input.val()));
        $slider.val($input.val());
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      return $sliderBox;
    }

    function genVectors(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');

      $div.append(getTitle(opt));

      if (currentOptions[opt.option] == null) {
        currentOptions[opt.option] = [0,0,0];
      }

      currentOptions[opt.option].forEach(function(currentOption, i){
        let slider = null;

        slider = genSliderBox(opt, currentOption, function(val) {
          currentOptions[opt.option][i] = val;
        });
        $div.append(slider);
      })

      return $div;
    }

    function genSlider(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');

      $div.append(getTitle(opt));
      $div.append(genSliderBox(opt, currentOptions[opt.option], function(val) {
        currentOptions[opt.option] = val;
      }));

      return $div;
    }

    function genFloatText(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.val(currentVal);

      $input.change(function(){
        let val = parseFloat($input.val())
        if (isNaN(val)) {
          toastMsg('Not a valid number');
        } else {
          self.saveHistory();
          currentOptions[opt.option] = val;
          if (opt.reset) {
            self.resetScene(false);
          }
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genIntText(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.val(currentVal);

      $input.change(function(){
        let val = parseInt($input.val())
        if (isNaN(val)) {
          toastMsg('Not a valid number');
        } else {
          self.saveHistory();
          currentOptions[opt.option] = val;
          if (opt.reset) {
            self.resetScene(false);
          }
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genStrText(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $textBox = $('<div class="text"><input type="text"></div>');
      let $input = $textBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.val(currentVal);

      $input.change(function(){
        self.saveHistory();
        currentOptions[opt.option] = $input.val();
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($textBox);

      return $div;
    }

    function genBoolean(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $checkBox = $('<div class="text"><input type="checkbox"></div>');
      let $input = $checkBox.find('input');
      let currentVal = currentOptions[opt.option];

      $input.prop('checked', currentVal);

      $input.change(function(){
        self.saveHistory();
        currentOptions[opt.option] = $input.prop('checked');
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($checkBox);

      return $div;
    }

    function genSelect(opt, currentOptions) {
      let $div = $('<div class="configuration"></div>');
      let $select = $('<select></select>');
      let currentVal = currentOptions[opt.option];

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
        currentOptions[opt.option] = $select.val();
        if (opt.reset) {
          self.resetScene(false);
        }
      });

      $div.append(getTitle(opt));
      $div.append($select);

      return $div;
    }

    function displayOptionsConfigurations(template) {
      template.optionsConfigurations.forEach(function(optionConfiguration){
        if (optionConfiguration.type == 'label') {
          self.$settingsArea.append(genLabel(optionConfiguration));
        } else if (optionConfiguration.type == 'vectors') {
          self.$settingsArea.append(genVectors(optionConfiguration, object));
        } else if (optionConfiguration.type == 'slider') {
          self.$settingsArea.append(genSlider(optionConfiguration, object));
        } else if (optionConfiguration.type == 'floatText') {
          self.$settingsArea.append(genFloatText(optionConfiguration, object));
        } else if (optionConfiguration.type == 'intText') {
          self.$settingsArea.append(genIntText(optionConfiguration, object));
        } else if (optionConfiguration.type == 'strText') {
          self.$settingsArea.append(genStrText(optionConfiguration, object));
        } else if (optionConfiguration.type == 'boolean') {
          self.$settingsArea.append(genBoolean(optionConfiguration, object));
        } else if (optionConfiguration.type == 'select') {
          self.$settingsArea.append(genSelect(optionConfiguration, object));
        } else if (optionConfiguration.type == 'color') {
          self.$settingsArea.append(genColor(optionConfiguration, object));
        } else if (optionConfiguration.type == 'buttons') {
          self.$settingsArea.append(genButtons(optionConfiguration, object));
        }
      });
    }

    if (name == 'ground') {
      displayOptionsConfigurations(self.groundTemplate);
    } else if (name == 'wall') {
      displayOptionsConfigurations(self.wallTemplate);
    } else if (name == 'timer') {
      displayOptionsConfigurations(self.timerTemplate);
    } else if (name == 'robot') {
      displayOptionsConfigurations(self.robotTemplate);
    } else if (name == 'box') {
      displayOptionsConfigurations(self.boxTemplate);
    } else if (name == 'cylinder') {
      displayOptionsConfigurations(self.cylinderTemplate);
    } else if (name == 'sphere') {
      displayOptionsConfigurations(self.sphereTemplate);
    } else if (name == 'model') {
      displayOptionsConfigurations(self.modelTemplate);
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

    let objectTypes = ['Box', 'Cylinder', 'Sphere', 'Model', 'Compound'];

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
      }

      if (selected.name == 'compound' && $select.val() != 'Compound') {
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
    let VALID_OBJECTS = ['box', 'cylinder', 'sphere', 'model', 'compound'];
    if (VALID_OBJECTS.indexOf($selected[0].name) == -1) {
      toastMsg('Only objects can be cloned');
      return;
    }

    self.saveHistory();
    let object = JSON.parse(JSON.stringify($selected[0].object));
    let parentCompound = self.findParentCompound($selected[0].objectIndex);
    if (parentCompound !== null) {
      parentCompound.objects.push(object);
    } else {
      self.worldOptions.objects.push(object);
    }
    self.resetScene();
  };

  // Find the parent of a child object
  this.findParentCompound = function(objectIndex) {
    let currentIndex = 0;
    let parentCompound = null;
    for (let i=0; i<self.worldOptions.objects.length; i++) {
      if (self.worldOptions.objects[i].type == 'compound') {
        parentCompound = self.worldOptions.objects[i];
        for (let j=0; j<self.worldOptions.objects[i].objects.length; j++) {
          if (currentIndex == objectIndex) {
            return parentCompound;
          }
          currentIndex++;
        }
        parentCompound = null;
      } else {
        currentIndex++;
      }
    }
    return null;
  };

  // Delete selected object
  this.deleteObject = function() {
    let $selected = self.getSelectedComponent();
    let VALID_OBJECTS = ['box', 'cylinder', 'sphere', 'model', 'compound']
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

  // Load world into objectss window
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
      if (object.type == 'compound') {
        let $subList = $('<ul></ul>');
        object.objects.forEach(function(object){
          let $subItem = listObject(object);
          $subItem[0].child = true;
          $subList.append($subItem);
        });
        $item.append($subList);
      } else {
        $item[0].objectIndex = objectIndex++;
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

  // Load robot from json file
  this.loadWorld = function() {
    var hiddenElement = document.createElement('input');
    hiddenElement.type = 'file';
    hiddenElement.accept = 'application/json,.json';
    hiddenElement.dispatchEvent(new MouseEvent('click'));
    hiddenElement.addEventListener('change', function(e){
      var reader = new FileReader();
      reader.onload = function() {
        self.worldOptions = JSON.parse(JSON.stringify(worlds[0].defaultOptions));
        Object.assign(self.worldOptions, JSON.parse(this.result).options);
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
        {html: 'Load from file', line: false, callback: self.loadWorld},
        {html: 'Save to file', line: true, callback: self.saveWorld},
      ];

      menuDropDown(self.$fileMenu, menuItems, {className: 'fileMenuDropDown'});
    }
  };

  // Clicked on tab
  this.tabClicked = function(tabNav) {
  };
}

// Init class

builder.init();
