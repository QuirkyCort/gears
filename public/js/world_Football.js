var world_Football = new function() {
  var self = this;

  this.name = 'football';
  this.shortDescription = 'Football Arena';
  this.longDescription =
    "<p>A 2 on 2 football game! Kick the ball into the opponent's goal, but be careful not to leave your own goal undefended for too long.</p>" +
    "<p>An invisible wall in the center of the field separates the two teams. Grab and kick the ball with the electromagnet.</p>" +
    '<p>You can use this world in single robot mode to prepare your program,  before running it in the arena.</p>';
  //TODO add a cool picture
  this.thumbnail = 'images/worlds/arena.jpg';

  this.options = {};

  this.robotStart = null;
  this.arenaStart = null;
  this.arenaStarts = {
    football: [
      {
        position: new BABYLON.Vector3(0, 0, 58.75),
        rotation: new BABYLON.Vector3(0, 1/2 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(0, 0, 176.25),
        rotation: new BABYLON.Vector3(0, 1/2 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(0, 0, -58.75),
        rotation: new BABYLON.Vector3(0, 1/2 * Math.PI, 0)
      },
      {
        position: new BABYLON.Vector3(0, 0, -176.25),
        rotation: new BABYLON.Vector3(0, 1/2 * Math.PI, 0)
      },
    ]
  };

  this.optionsConfigurations = [
    {
      option: 'timeLimit',
      title: 'Time Limit',
      type: 'checkbox',
      label: 'Stop robots when time is up',
      help: 'Only works in the arena. Stop all robot motors when time is up.'
    },
    {
      option: 'seed',
      title: 'Random Seed',
      type: 'text',
      help: 'Leave this blank to let gears pick its own random seed.'
    },
    {
      option: 'startPos',
      title: 'Starting Position (Single Player Mode)',
      type: 'select',
      options: [
        ['Player 0', '0'],
        ['Player 1', '1'],
        ['Player 2', '2'],
        ['Player 3', '3'],
      ],
      help: 'This option does nothing in Arena mode.'
    },
    {
      option: 'lengthInterior',
      title: 'Length of field (cm)',
      type: 'slider',
      min: '100',
      max: '1000',
      step: '10',
      help: 'Goal to goal distance'
    },
    {
      option: 'widthInterior',
      title: 'Width of field (cm)',
      type: 'slider',
      min: '100',
      max: '1000',
      step: '10',
      help: 'Sideline to sideline distance'
    },
    {
      option: 'widthGoal',
      title: 'Width of goal (cm)',
      type: 'slider',
      min: '10',
      max: '1000',
      step: '10',
    },
    {
      option: 'shotClockDuration',
      title: 'Shot Clock Duration (s)',
      type: 'slider',
      min: '1',
      max: '120',
      step: '1',
    },
    {
      option: 'startBallPosXYZStr',
      title: ' Ball Starting Position (x, y)',
      type: 'text',
      help: 'The starting position of the ball at the beginning of the match and after scoring a goal. Enter using this format "x, y" (without quotes). Default is center of the field  "0, 0".'
    },
    {
      option: 'startBallHeading',
      title: 'Ball Heading (degrees)',
      type: 'slider',
      min: '-180',
      max: '180',
      step: '10',
      help: 'The heading of the ball at the beginning of the match and after scoring a goal.'
    },
    {
      option: 'randomFlipBallHeading',
      title: 'Randomly Flip Ball Heading ',
      type: 'checkbox',
      label: 'Random Flipping',
      help: 'The ball should randomly choose between (heading) and (heading + 180 degrees)'
    },
    {
      option: 'ballSpeedMin',
      title: 'Ball Minimum Speed (cm/s)',
      type: 'slider',
      min: '0',
      max: '300',
      step: '25',
      help: 'The minimum speed of the ball at the beginning of the match and after scoring a goal'
    },
    {
      option: 'ballSpeedRange',
      title: 'Ball Speed Range (cm/s)',
      type: 'slider',
      min: '0',
      max: '300',
      step: '25',
      help: 'The range in speed of the ball at the beginning of the match and after scoring a goal.'
    },
    {
      option: 'ballDampingstr',
      title: 'Ball Damping',
      type: 'text',
      help: 'Amount of damping force slowing a rolling ball down. (float between 0 and 1 inclusive)'
    },
    {
      option: 'ballFrictionStr',
      title: 'Ball Friction',
      type: 'text',
      help: 'Friction coefficient of the ball. Slows a rolling ball down.'
    }

  ];

  this.imagesURL = {
    football: 'textures/maps/Arena/soccerfield.png',
  };

  this.defaultOptions = {
    challenge: 'football',
    image: 'textures/maps/Arena/soccerfield.png',
    length: 400,
    width: 400,
    wall: true,
    wallHeight: 10,
    wallThickness: 5,
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.0,
    wallRestitution: 0.1,
    startPos: '0',
    timeLimit: true,
    seed: null,
    widthInterior: 288,
    lengthInterior: 470,
    widthGoal: 160,
    startBallPos: 'center',
    startBallPosXYZStr: '',
    startBallPosXYZ: [0,0,0],
    startBallHeading: 0,
    randomFlipBallHeading: true,
    ballDampingStr: '',
    ballDamping: 0.01,
    ballFrictionStr: '',
    ballFriction: 0.1,
    ballSpeedMin: 100,
    ballSpeedRange: 50,
    shotClockDuration: 15
  };

  // Set options, including default
  this.setOptions = function(options) {
    let tmpOptions = {};
    Object.assign(tmpOptions, self.defaultOptions);
    Object.assign(tmpOptions, self.options);
    Object.assign(self.options, tmpOptions);

    for (let name in options) {
      if (typeof self.options[name] == 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        self.options[name] = options[name];
      }
    }

    if (self.options.startBallPosXYZStr.trim() != '') {
      let xy = self.options.startBallPosXYZStr.split(',');
      let alt = 0;
      if (xy.length > 2) {
        alt = parseFloat(xy[2]);
      }
      self.options.startBallPosXYZ = [parseFloat(xy[0]), parseFloat(xy[1]), alt];
    }

    if (self.options.ballDampingStr.trim() != '') {
      self.options.ballDamping = parseFloat(self.options.ballDampingStr.trim());
    }
    if (self.options.ballFrictionStr.trim() != '') {
      self.options.ballFriction = parseFloat(self.options.ballFrictionStr.trim());
    }

    self.arenaStart = self.arenaStarts[self.options.challenge];
    self.robotStart = self.arenaStart[parseInt(self.options.startPos)];

    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  // Run on page load
  this.init = function() {
    self.setOptions();
  };

  // Create the scene
  this.load = function (scene) {
    self.setSeed(self.options.seed);

    return new Promise(function(resolve, reject) {
      self.loadFootball(scene);
      resolve();
    });
  };

  // Football map
  this.loadFootball = function(scene) {
    // Set standby game state
    self.game = {
      state: 'standby',
      startTime: null,
      renderTimeout: 0,
      teamA: 0,
      teamB: 0,
      shotClock: 0,
    };

    let fieldWidth = self.options.widthInterior / 0.96;
    let fieldLength = self.options.lengthInterior / 0.94;

    let wH = 20;

    let goalWidth = self.options.widthGoal;
    let sideWidth = fieldWidth * 0.02;
    let backWidth = fieldLength * 0.03;
    let backboardWidth = fieldLength * 0.005;

    // load field
    self.loadImageTile(
      scene,
      self.imagesURL[self.options.challenge],
      [fieldLength, fieldWidth, 10],
      [0, 0, -10]
    );

    let wallMat = new BABYLON.StandardMaterial('wall', scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.47, 0.48, 0.49);
    let walls = [
      [[sideWidth,fieldLength,wH],[(sideWidth - fieldWidth ) * 0.5 ,0,0]],
      [[sideWidth,fieldLength,wH],[(fieldWidth - sideWidth ) * 0.5 ,0,0]],
      [[(fieldWidth - goalWidth) * 0.5,backWidth,wH],[(fieldWidth + goalWidth) * 0.25, (fieldLength - backWidth ) * 0.5 , 0]],
      [[(fieldWidth - goalWidth) * 0.5,backWidth,wH],[-(fieldWidth + goalWidth) * 0.25, (fieldLength - backWidth ) * 0.5 , 0]],
      [[(fieldWidth - goalWidth) * 0.5,backWidth,wH],[(fieldWidth + goalWidth) * 0.25, (fieldLength - backWidth ) * -0.5 , 0]],
      [[(fieldWidth - goalWidth) * 0.5,backWidth,wH],[-(fieldWidth + goalWidth) * 0.25, (fieldLength - backWidth ) * -0.5 , 0]]
    ];
    self.addWalls(scene, wallMat, walls,restitution=1.03);

    let backboards = [
      [[goalWidth, backboardWidth, wH],[0, (fieldLength - backboardWidth ) * -0.5 , 0]],
      [[goalWidth, backboardWidth, wH],[0, (fieldLength - backboardWidth ) * 0.5 , 0]]
    ];

    self.addWalls(scene,wallMat,backboards,restitution=0);

    // load ball
    let ballMat = new BABYLON.StandardMaterial('ball', scene);
    ballMat.diffuseTexture = new BABYLON.Texture('textures/sphere/soccerBall.png');
    self.game.ball = self.addSphere(scene, ballMat, 10, self.options.startBallPosXYZ, magnetic=true);

    //Score zones
    self.game.scoreZones = [];
    function addScoreZone(pos, color, team) {
      let scoreZone = null;
      var faceUV = new Array(6);
      for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
      }
      faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
      scoreZone = self.addBox(scene, ballMat, [goalWidth - 6, backWidth - 2, wH], pos, false, false,false,[0,0,0], faceUV);
      scoreZone.isPickable = false;
      scoreZone.color = color;
      scoreZone.team = team;
      self.game.scoreZones.push(scoreZone);
    }

    addScoreZone([0, (fieldLength - backWidth) * 0.5], 'red', 'A');
    addScoreZone([0, (fieldLength - backWidth) * -0.5], 'red', 'B');


    // invisible fences that keep robots separated
    self.game.borders = [];
    function addBorder(pos,robodirs) {
      let border = null;
      var faceUV = new Array(6);
      for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
      }
      faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
      //border = self.addBox(scene, ballMat, [fieldWidth - 2 * sideWidth, 1 * backWidth, wH], pos, false, false,true,[0,0,0], faceUV);
      border = self.addBox(scene, ballMat, [fieldWidth - 2 * sideWidth, 1 * backWidth, wH], pos, false, false,false,[0,0,0], faceUV);
      border.isPickable = false;
      border.robodirs = robodirs;
      self.game.borders.push(border);
    }

    addBorder([0, 0], [[0,1],[1,1],[2,-1],[3,-1]]);

    // set time limits
    self.game.TIME_LIMIT = 2 * 60 * 1000;

    // Reintroduce the ball at a given position with given velocity
    function foos(pos=[0,0,0],vel =[0,0,0]){
      self.game.ball.position.y = pos[1];
      self.game.ball.position.x = pos[0];
      self.game.ball.position.z = pos[2];

      self.game.ball.physicsImpostor.forceUpdate();

      self.game.ball.physicsImpostor.physicsBody.setDamping(self.options.ballDamping, self.options.ballDamping / 5);
      //self.game.ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,0));
      self.game.ball.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(vel[2]/5,0,-vel[0]/5));
      self.game.ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(vel[0],vel[1],vel[2]));
    }

    function foosRandom(){
      let flipped = self.mulberry32() > 0.5;
      let heading = self.options.startBallHeading * Math.PI / 180;

      if (self.options.randomFlipBallHeading && flipped){
        heading = heading + Math.PI;
      }

      let min_speed = self.options.ballSpeedMin;
      let range = self.options.ballSpeedRange;
      let r_speed = min_speed + self.mulberry32() * range;

      foos(self.options.startBallPosXYZ,
           [r_speed * Math.cos(heading),0, r_speed * Math.sin(heading) ]);
    }

    let firstFoos = true;
    let prevBallZone = 0;

    function getBallZone(){
      let y = self.game.ball.position.z;
      if (Math.abs(y) < 5){
        return 2;
      }
      if (y < 0){
        return 1;
      }
      return 0;
    }

    function resetBall(zone=0){
      if (zone == 0){
        foos([0,0,-0.125 * fieldLength], [0,0,0]);
      }
      else{
        foos([0,0,0.125 * fieldLength], [0,0,0]);
      }
    }

    self.render = function(delta){
      self.renderDefault(delta);

      if (self.game.state == 'started'){
        self.game.scoreZones.forEach(function(scoreZone){
          if (scoreZone.intersectsMesh(self.game.ball,false)){
          //if (scoreZone.intersectsPoint(self.game.ball.absolutePosition)){
            self.game['team' + scoreZone.team] += 1;
            foosRandom();
          }
        });

        if (firstFoos){
          foosRandom();
          firstFoos = false;
        }

        let curBallZone = getBallZone();
        if (curBallZone != prevBallZone){
          prevBallZone = curBallZone;
          self.game.shotClock = 0;
        }
        else {
          self.game.shotClock += delta;
        }

        if (self.game.shotClock > self.options.shotClockDuration * 1000){
          resetBall(curBallZone);
          self.game.shotClock = 0;
        }
        // Ball up for grabs in the middle of the field, no need for shotclock
        if (curBallZone == 2){
          self.game.shotClock = 0;
        }

        for (border of self.game.borders){
          for (robodir of border.robodirs){
            //debugger;
            for (bot of robots){
              let dir = robodir[1];
              let correct_player = bot.player == robodir[0] || (bot.player === 'single' && parseInt(self.options.startPos) == robodir[0]);
              if (bot != null && bot.body != null && correct_player){
                if (border.intersectsMesh(bot.body,false)){
                  bot.body.physicsImpostor.applyImpulse(new BABYLON.Vector3(0,-4000,dir * 15000),
                                                      bot.body.getAbsolutePosition());
                }
              }
            }
          }
        }
      }
    };


    self.drawWorldInfo = self.drawWorldInfoDefault;

    self.buildTwoTeamsShotClockInfoPanel();
    self.drawWorldInfo();
  };
  // set the render function
  this.renderDefault = function(delta) {
    // Run every 200ms
    self.game.renderTimeout += delta;
    if (self.game.renderTimeout > 200) {
      self.game.renderTimeout = 0;
    } else {
      return;
    }

    if (self.game.state == 'started') {
      self.drawWorldInfo();
    }
  };

  // Build Info panel for time only
  this.buildTimeOnlyInfoPanel = function() {
    if (typeof arenaPanel == 'undefined') {
      setTimeout(self.buildFourPlayerInfoPanel, 1000);
      return;
    }

    arenaPanel.showWorldInfoPanel();
    arenaPanel.clearWorldInfoPanel();
    let $info = $(
      '<div class="mono row">' +
        '<div class="center time"></div>' +
        '</div>'
    );
    arenaPanel.drawWorldInfo($info);

    self.infoPanel = {
      $time: $info.find('.time'),
    };
  };

  // Build Info panel for 2 teams with Shotclock
  this.buildTwoTeamsShotClockInfoPanel = function() {

    if (typeof arenaPanel == 'undefined') {
      setTimeout(self.buildTwoTeamsShotClockInfoPanel, 1000);
      return;
    }

    arenaPanel.showWorldInfoPanel();
    arenaPanel.clearWorldInfoPanel();
    let $info = $(
      '<div class="mono row">' +
        '<div class="center time"></div>' +
        '</div>' +
        '<div class="mono row">' +
        '<div class="center shotClock"></div>' +
        '</div>' +
        '<div class="mono row">' +
        '<div class="teamA"></div>' +
        '<div class="teamB"></div>' +
        '</div>'
    );
    arenaPanel.drawWorldInfo($info);

    self.infoPanel = {
      $time: $info.find('.time'),
      $teamA: $info.find('.teamA'),
      $teamB: $info.find('.teamB'),
      $shotClock : $info.find('.shotClock')
    };
    self.infoPanel.$teamA.on('animationend', function() {this.classList.remove('animate')});
    self.infoPanel.$teamB.on('animationend', function() {this.classList.remove('animate')});
  };

  // Set the function for drawing scores
  this.drawWorldInfoDefault = function() {
    if (typeof self.infoPanel == 'undefined') {
      setTimeout(self.drawWorldInfoDefault, 1000);
      return;
    }

    let time = self.game.TIME_LIMIT;
    if (time == Infinity) {
      time = 'Infinite';
    } else {
      if (self.game.startTime != null) {
        time -= (Date.now() - self.game.startTime);
      }
      let sign = '';
      if (time < 0) {
        sign = '-';
        time = -time;
      }
      time = Math.round(time / 1000);
      if (self.options.timeLimit && time <= 0) {
        time = 0;
        if (typeof arenaPanel != 'undefined') {
          arenaPanel.stopSim();
        }
      }

      time = sign + Math.floor(time/60) + ':' + ('0' + time % 60).slice(-2);
    }
    time = 'Time: ' + time;

    let p0 = 'P0: ' + self.game.p0;
    let p1 = 'P1: ' + self.game.p1;
    let p2 = 'P2: ' + self.game.p2;
    let p3 = 'P3: ' + self.game.p3;
    let teamA = 'Team A : ' + self.game.teamA;
    let teamB = self.game.teamB + ' : Team B';
    //let shotClock = 'Shot Clock: ' + self.game.shotClock;
    let shotClock = 'Shot Clock: ' + Math.floor(self.options.shotClockDuration - self.game.shotClock / 1000);
    function updateIfChanged(text, $dom) {
      if (typeof $dom == 'undefined') {
        return;
      }
      if (text != $dom.text()) {
        $dom.text(text);
        $dom.addClass('animate');
      }
    }
    updateIfChanged(time, self.infoPanel.$time);
    updateIfChanged(p0, self.infoPanel.$p0);
    updateIfChanged(p1, self.infoPanel.$p1);
    updateIfChanged(p2, self.infoPanel.$p2);
    updateIfChanged(p3, self.infoPanel.$p3);
    updateIfChanged(teamA, self.infoPanel.$teamA);
    updateIfChanged(teamB, self.infoPanel.$teamB);
    updateIfChanged(shotClock, self.infoPanel.$shotClock);
  };

  // Reset game state
  this.reset = function() {
    setTimeout(function(){
      if (typeof self.game != 'undefined') {
        self.game.state = 'ready';
      }
    }, 500);
  };

  // Called by babylon and filled by individual challenges
  this.render = function(delta) {};

  // Draw world info panel and filled by individual challenges
  this.drawWorldInfo = function() {};

  // startSim
  this.startSim = function() {
    if (typeof self.game != 'undefined') {
      self.game.state = 'started';
      self.game.startTime = Date.now();
    }
  };

  // stop simulator
  this.stopSim = function() {
    if (typeof self.game != 'undefined') {
      self.game.state = 'stopped';
    }
  };

  // Set the random number seed
  this.setSeed = function(seed) {
    if (typeof seed == 'undefined' || seed == null) {
      self.seed = Date.now();
    } else {
      self.seed = parseFloat(seed);
    }
  };

  // Generate random number
  this.mulberry32 = function() {
    var t = self.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    let result = ((t ^ t >>> 14) >>> 0) / 4294967296;
    self.seed = result * 4294967296;
    return result;
  };

  // shuffle array
  this.shuffleArray = function(arr) {
    var i = arr.length, k , temp;      // k is to generate random index and temp is to swap the values
    while(--i > 0){
      k = Math.floor(self.mulberry32() * (i+1));
      temp = arr[k];
      arr[k] = arr[i];
      arr[i] = temp;
    }
    return arr;
  };

  // Load image into tile
  this.loadImageTile = function (scene, imageSrc, size, pos=[0,0,0], physicsOptions=null) {
    var mat = new BABYLON.StandardMaterial('image', scene);
    var texture = new BABYLON.Texture(imageSrc, scene);
    mat.diffuseTexture = texture;
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);

    if (! physicsOptions) {
      physicsOptions = {
        mass: 0,
        friction: self.options.groundFriction,
        restitution: self.options.groundRestitution
      };
    }
    let tile = self.addBox(scene, mat, size, pos, false, physicsOptions, true, [0, Math.PI/2, 0], faceUV);
    tile.receiveShadows = true;

    return tile;
  };

  // Add walls
  this.addWalls = function(scene, wallMat, walls,restitution=null) {
    let meshes = [];

    walls.forEach(function(wall) {
      if (wall[0].length < 3) {
        wall[0].push(20);
      }
      let size = wall[0];

      if (wall[1].length < 3) {
        wall[1].push(0);
      }
      let pos = wall[1];
      if (restitution == null){
        meshes.push(self.addBox(scene, wallMat, size, pos));
      }
      else{
        meshes.push(self.addBox(scene, wallMat, size, pos,false, true, true, [0,0,0], null,restitution));
      }
    });

    return meshes;
  };

  // Add box
  this.addBox = function(scene, material, size, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null,restitution=self.options.wallRestitution) {
    var boxOptions = {
      width: size[0],
      depth: size[1],
      height: size[2],
    };
    if (pos.length < 3) {
      pos.push(0);
    }
    if (faceUV) {
      boxOptions.faceUV = faceUV;
    }

    var box = BABYLON.MeshBuilder.CreateBox('box', boxOptions, scene);
    if (visible) {
      box.material = material;
    } else {
      box.visibility = 0;
    }
    box.position.x = pos[0];
    box.position.y = pos[2] + size[2] / 2;
    box.position.z = pos[1];
    box.rotation.x = rot[0];
    box.rotation.y = rot[1];
    box.rotation.z = rot[2];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      box.isMagnetic = true;
    }

    if (physicsOptions !== false) {
      if (physicsOptions === true) {
        physicsOptions = {
          mass: mass,
          friction: self.options.wallFriction,
          restitution: restitution
        };
      }

      box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box,
        BABYLON.PhysicsImpostor.BoxImpostor,
        physicsOptions,
        scene
      );
      if (magnetic) {
        box.physicsImpostor.physicsBody.setDamping(0.8, 0.8);
      }
    }

    return box;
  };

  this.addSphere = function (scene, material, diam, pos, magnetic=false, physicsOptions=true, visible=true, rot=[0,0,0], faceUV=null) {

    var meshOptions = {
      diameter: diam,
    };
    if (faceUV) {
      meshOptions.faceUV = faceUV;
    }

    var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', meshOptions, scene);
    if (visible) {
      sphere.material = material;
    } else {
      sphere.visibility = 0;
    }

    sphere.material = material;

    sphere.position.x = pos[0];
    sphere.position.y = pos[2];// + size[2] / 2;
    sphere.position.z = pos[1];
    sphere.rotation.x = rot[0];
    sphere.rotation.y = rot[1];
    sphere.rotation.z = rot[2];

    let mass = 0;
    if (magnetic) {
      mass = 10;
      sphere.isMagnetic = true;
    }


    if (physicsOptions !== false) {

      if (physicsOptions === true) {
        physicsOptions = {
          mass: mass,
          friction: self.options.ballFriction,
          restitution: 1.0
        };
      }

      sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
        sphere,
        BABYLON.PhysicsImpostor.SphereImpostor,
        physicsOptions,
        scene
      );

      if (magnetic) {
        sphere.physicsImpostor.physicsBody.setDamping(self.options.ballDamping, self.options.ballDamping);
      }

    }

    return sphere;
  };
};

// Init class
world_Football.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Football);
