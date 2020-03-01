let Gameplay = function () {
  this.three = {
    scene: null,
    renderer: null,
    camera: null,
    view: null,
  };

  this.keys = null;

  this.gameCameraPos = new Phaser.Math.Vector2();
  this.gameCameraTheta = 0.0;
  this.gameCamera = null;
};
Gameplay.prototype.preload = function () {
  this.load.spritesheet(DEFAULT_IMAGE_MAP, 'asset/image/fromJesse.png', { frameWidth: 16, frameHeight: 16 });

  this.load.image(DEFAULT_IMAGE_SPRITE, 'asset/image/fromJesse.png');
};
Gameplay.prototype.create = function () {
  this.setup3DScene();

  this.gameCameraPos = new Phaser.Math.Vector2();
  this.gameCameraTheta = 0.0;
  this.setupInput();

  this.events.on('shutdown', this.shutdown, this);
};
Gameplay.prototype.update = function () {
  this.updateCameraFromInput();
  this.update3DScene();
};
Gameplay.prototype.shutdown = function () {
  this.events.removeListener('shutdown');

  this.teardown3DScene();
};

Gameplay.prototype.setupInput = function () {
  const keyConfigObject = {
    'cam_right': Phaser.Input.Keyboard.KeyCodes.D,
    'cam_left': Phaser.Input.Keyboard.KeyCodes.A,
    'cam_up': Phaser.Input.Keyboard.KeyCodes.W,
    'cam_down': Phaser.Input.Keyboard.KeyCodes.S,
    'cam_turn_right': Phaser.Input.Keyboard.KeyCodes.E,
    'cam_turn_left': Phaser.Input.Keyboard.KeyCodes.Q,

    'right': Phaser.Input.Keyboard.KeyCodes.RIGHT,
    'left': Phaser.Input.Keyboard.KeyCodes.LEFT,
    'down': Phaser.Input.Keyboard.KeyCodes.DOWN,
    'up': Phaser.Input.Keyboard.KeyCodes.UP,
  };
  this.keys = this.input.keyboard.addKeys(keyConfigObject);
};

Gameplay.prototype.setup3DScene = function () {
  this.gameCamera = new THREE.PerspectiveCamera( 70, GAME_WIDTH / GAME_HEIGHT,  0.1, 1000 );
  this.three.camera = this.gameCamera;

  this.three.scene = new THREE.Scene();
  this.three.renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );
  this.three.renderer.autoClear = true;
  this.three.renderer.setClearColor(new THREE.Color(0x330044), 1.0)

  this.three.view = this.add.extern();
  const that = this;
  this.three.view.render = function (prenderer, pcamera, pcalcMatrix) {
    that.three.renderer.state.reset();
    that.three.renderer.render(that.three.scene, that.three.camera);
  }

  let debugWallGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
  let debugWallMaterial = new THREE.MeshBasicMaterial( { color: 0x00FF00 } );
  let debugWallMesh = new THREE.Mesh( debugWallGeometry, debugWallMaterial );
  this.three.scene.add(debugWallMesh);

};
Gameplay.prototype.teardown3DScene = function () {
  //
};

Gameplay.prototype.updateCameraFromInput = function () {
  if (this.keys.cam_right.isDown) {
    this.gameCameraPos.x += CAMERA_PAN_SPEED * Math.cos(this.gameCameraTheta - (Math.PI * 0.5));
    this.gameCameraPos.y += CAMERA_PAN_SPEED * Math.sin(this.gameCameraTheta - (Math.PI * 0.5));
  } else if (this.keys.cam_left.isDown) {
    this.gameCameraPos.x -= CAMERA_PAN_SPEED * Math.cos(this.gameCameraTheta - (Math.PI * 0.5));
    this.gameCameraPos.y -= CAMERA_PAN_SPEED * Math.sin(this.gameCameraTheta - (Math.PI * 0.5));
  } 
  if (this.keys.cam_down.isDown) {
    this.gameCameraPos.x += CAMERA_PAN_SPEED * Math.cos(this.gameCameraTheta - (Math.PI * 0.0));
    this.gameCameraPos.y += CAMERA_PAN_SPEED * Math.sin(this.gameCameraTheta - (Math.PI * 0.0));
  } else if (this.keys.cam_up.isDown) {
    this.gameCameraPos.x -= CAMERA_PAN_SPEED * Math.cos(this.gameCameraTheta - (Math.PI * 0.0));
    this.gameCameraPos.y -= CAMERA_PAN_SPEED * Math.sin(this.gameCameraTheta - (Math.PI * 0.0));
  } 

  if (this.keys.cam_turn_right.isDown) {
    this.gameCameraTheta += CAMERA_TURN_SPEED;
  }
  if (this.keys.cam_turn_left.isDown) {
    this.gameCameraTheta -= CAMERA_TURN_SPEED;
  }
};
Gameplay.prototype.update3DScene = function() {
  this.gameCamera.position.x = this.gameCameraPos.x + (Math.cos(this.gameCameraTheta) * CAMERA_DISTANCE);
  this.gameCamera.position.y = CAMERA_DISTANCE;
  this.gameCamera.position.z = this.gameCameraPos.y + (Math.sin(this.gameCameraTheta) * CAMERA_DISTANCE);
  this.gameCamera.lookAt(this.gameCameraPos.x, 0, this.gameCameraPos.y);
};