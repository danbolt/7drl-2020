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
  this.ROTScheduler = null;

  this.entities = [];
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

  // TODO: remove me later (dummy setup)
  for (let i = 0; i < 40; i++) {
    let e = NewEntity();
    AddComponent(e, 'ECSIndexComponent', new ECSIndexComponent(i));
    AddComponent(e, 'PositionComponent', new PositionComponent(Math.random() * 30 - 15, Math.random() * 30 - 15));
    AddComponent(e, 'ForwardVelocityComponent', new ForwardVelocityComponent(0.3 + (Math.random() * 3.2)));
    AddComponent(e, 'RotationComponent', new RotationComponent(Math.random() * Math.PI * 2));
    AddComponent(e, 'DexterityComponent', new DexterityComponent(50 + (Math.random() * 50)));
    AddComponent(e, 'MeshComponent', new MeshComponent());
    AddComponent(e, 'RequestDummy3DAppearanceComponent', new RequestDummy3DAppearanceComponent(Math.random() > 0.5 ? 0xFF00FF : 0xFF0000));
    this.entities.push(e);
  }

  // Add entities with deterity to the turn order
  this.ROTScheduler = new ROT.Scheduler.Speed();
  ViewEntities(this.entities, ['DexterityComponent', 'ECSIndexComponent'], [], (entity, dex, ecsIndex) => {
    this.ROTScheduler.add({
      indComponent: ecsIndex,
      getSpeed: () => { return dex.value; }
    }, true);
  });

  // Dummy auto-turn order: fix this later
  this.time.addEvent({
    repeat: 100,
    delay: 500,
    callback: () => {
      const nextTurn = this.ROTScheduler.next();
      console.log('the next turn is ' + nextTurn.indComponent.value + ' with a speed of ' + nextTurn.getSpeed());

      const nextEntity = this.entities[nextTurn.indComponent.value];
      ViewEntities([nextEntity], ['PositionComponent', 'ForwardVelocityComponent', 'RotationComponent'], [], (entity, position, velocity, rotation) => {
        position.x += Math.cos(rotation.value) * velocity.value;
        position.y += Math.sin(rotation.value) * velocity.value;
      });
    }
  });

  this.events.on('shutdown', this.shutdown, this);
};
Gameplay.prototype.update = function () {
  this.updateCameraFromInput();
  this.update3DScene();

  this.updateSystems();
};
Gameplay.prototype.shutdown = function () {
  this.events.removeListener('shutdown');

  this.entities = [];
  this.ROTScheduler = null;

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

