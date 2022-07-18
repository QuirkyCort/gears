var world_Football = new function() {
  World_Base.call(this);
  this.parent = {};
  for (p in this) {
    this.parent[p] = this[p];
  }

  var self = this;

  this.name = 'football';
  this.shortDescription = 'Football Arena';
  this.longDescription =
    "<p>A 2 on 2 football game! Kick the ball into the opponent's goal, but be careful not to leave your own goal undefended for too long.</p>" +
    "<p>An invisible wall in the center of the field separates the two teams. Grab and kick the ball with the electromagnet.</p>" +
    '<p>You can use this world in single robot mode to prepare your program before running it in the arena.</p>';
  this.thumbnail = 'images/worlds/football.jpg';

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
      option: 'ballDampingStr',
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

  this.defaultOptions = Object.assign(this.defaultOptions, {
    challenge: 'football',
    imageURL: 'textures/maps/Arena/soccerfield.png?v=7008dcf9',
    wall: true,
    wallHeight: 20,
    wallThickness: 5,
    wallColor: '#6A6A6A',
    groundFriction: 1,
    wallFriction: 0.1,
    groundRestitution: 0.2,
    wallRestitution: 1.0,
    startPos: '0',
    timeLimit: true,
    seed: null,
    widthInterior: 288,
    lengthInterior: 470,
    widthGoal: 160,
    startBallPos: '0',
    startBallPosXYZStr: '',
    startBallPosXYZ: [0,0,5],
    startBallHeading: 0,
    randomFlipBallHeading: true,
    ballDampingStr: '',
    ballDamping: 0.01,
    ballFrictionStr: '',
    ballFriction: 0.1,
    ballSpeedMin: 100,
    ballSpeedRange: 50,
    shotClockDuration: 15,
    arenaStartPosXYZ: [
      [-58.75, 0, 0],
      [-176.25, 0, 0],
      [58.75, 0, 0],
      [176.25, 0, 0]
    ],
    arenaStartRot: [
      90,
      90,
      -90,
      -90
    ]
  });

  // Set options, including default
  this.setOptions = function(options) {
    self.mergeOptionsWithDefault(options);

    if (self.options.startBallPosXYZStr.trim() != '') {
      let xy = self.options.startBallPosXYZStr.split(',');
      let alt = 5;
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

    self.options.startPosXYZ = self.options.arenaStartPosXYZ[parseInt(self.options.startPos)];
    self.options.startRot = self.options.arenaStartRot[parseInt(self.options.startPos)];

    return this.parent.setOptions(options);
  };

  // Run on page load
  this.init = function() {
    Object.assign(self.options, self.defaultOptions);
  };

  // Create the scene
  this.load = function (scene) {
    self.setSeed(self.options.seed);
    self.loadFootball(scene);

    return this.parent.load(scene);
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

    let fieldWidth = self.options.widthInterior;
    let fieldLength = self.options.lengthInterior / 0.98;
    self.processedOptions.groundWidth = fieldWidth;
    self.processedOptions.groundLength = fieldLength;

    let goalWidth = self.options.widthGoal;
    let backWidth = fieldLength * 0.0095;
    let backLength = (fieldWidth - goalWidth) / 2;

    // Empty out the objects first
    self.processedOptions.objects = [];

    // Wall besides goal
    function addWall(x, y) {
      self.processedOptions.objects.push({
        type: 'box',
        position: [x, y, self.processedOptions.wallHeight / 2],
        size: [backWidth, backLength, self.processedOptions.wallHeight],
        color: self.processedOptions.wallColor,
        physicsOptions: {
          mass: 0,
          friction: self.processedOptions.wallFriction,
          restitution: self.processedOptions.wallRestitution,
          group: 1,
          mask: -1
        }
      });
    }
    addWall(fieldLength / 2 - backWidth / 2, fieldWidth / 2 - backLength / 2);
    addWall(fieldLength / 2 - backWidth / 2, -fieldWidth / 2 + backLength / 2);
    addWall(-fieldLength / 2 + backWidth / 2, fieldWidth / 2 - backLength / 2);
    addWall(-fieldLength / 2 + backWidth / 2, -fieldWidth / 2 + backLength / 2);

    // load ball
    self.processedOptions.objects.push({
      type: 'sphere',
      imageURL: 'textures/sphere/soccerBall.png',
      position: self.options.startBallPosXYZ,
      size: [10],
      magnetic: true,
      physicsOptions: {
        mass: 10,
        friction: self.options.ballFriction,
        restitution: 1.0,
        dampLinear: self.options.ballDamping,
        dampAngular: self.options.ballDamping,
        group: 2,
        mask: 1
      },
      callback: function(mesh) {
        self.game.ball = mesh;
        self.game.ball.objectTrackerLabel = 'ball';
        scene.shadowGenerator.addShadowCaster(mesh);
      }
    });


    //Score zones
    self.game.scoreZones = [];
    function addScoreZone(pos, team) {
      self.processedOptions.objects.push({
        type: 'box',
        color: '#a000',
        position: [pos, 0, self.processedOptions.wallHeight / 2],
        size: [backWidth - 2, goalWidth - 6, self.processedOptions.wallHeight],
        physicsOptions: false,
        isPickable: false,
        callback: function(mesh) {
          mesh.team = team;
          self.game.scoreZones.push(mesh);
        }
      });
    }
    addScoreZone((fieldLength - backWidth) * 0.5, 'A');
    addScoreZone((fieldLength - backWidth) * -0.5, 'B');

    // invisible fences that keep robots separated
    self.processedOptions.objects.push({
      type: 'box',
      color: '#00a0',
      position: [0, 0, 20],
      size: [12, fieldWidth, 40],
      physicsOptions: {
        mass: 0,
        friction: 0,
        restitution: 0.1,
        group: 2,
        mask: 1
      },
      laserDetection: 'invisible',
      ultrasonicDetection: 'invisible',
      isPickable: false
    });

    // set time limits
    self.game.TIME_LIMIT = 2 * 60 * 1000;

    // Reintroduce the ball at a given position with given velocity
    function foos(pos=[0,0,0],vel =[0,0,0]){
      self.game.ball.position.y = pos[2];
      self.game.ball.position.x = pos[0];
      self.game.ball.position.z = pos[1];

      self.game.ball.physicsImpostor.forceUpdate();

      self.game.ball.physicsImpostor.physicsBody.setDamping(self.options.ballDamping, self.options.ballDamping);
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
           [r_speed * Math.sin(heading),0, r_speed * Math.cos(heading) ]);
    }

    let firstFoos = true;
    let prevBallZone = 0;

    function getBallZone(){
      let x = self.game.ball.position.x;

      let alt = self.game.ball.position.y;
      if (alt < 0) {
        return 3; // Out of bounds
      }
      if (Math.abs(x) < 5){
        return 2;
      }
      if (x < 0){
        return 1;
      }
      return 0;
    }

    function resetBall(zone=0){
      if (zone == 0){
        foos([-0.125 * fieldLength, 0, 5], [0,0,0]);
      }
      else{
        foos([0.125 * fieldLength, 0, 5], [0,0,0]);
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
        if (curBallZone == 3) {
          foosRandom();
        }

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
};

// Init class
world_Football.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Football);
