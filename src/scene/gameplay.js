let Gameplay = function () {
  this.three = {
    scene: null,
    renderer: null,
    camera: null,
    view: null,
    raycaster: null,
  };

  this.keys = null;

  this.gameCameraPos = new Phaser.Math.Vector2();
  this.gameCameraTheta = 0.0;
  this.gameCamera = null;

  this.entities = [];
  this.ROTScheduler = null;
  this.nextTurnReady = true;

  this.currentlyPointingEntity = null;

  this.playerShipUI = null;

  this.lockPanning = false;
};
Gameplay.prototype.preload = function () {
  // TODO: load these in a preload game state
  this.load.bitmapFont('newsgeek', 'asset/font/newsgeek.png', 'asset/font/newsgeek.fnt');

  this.load.spritesheet(DEFAULT_IMAGE_MAP, 'asset/image/fromJesse.png', { frameWidth: 16, frameHeight: 16 });
};
Gameplay.prototype.setupUI = function () {
  const pixelToHullBarRatio = 1.8;

  // Player ship UI (always on)
  this.playerShipUI = this.add.group();
  const hullBarBacking = this.add.image(2, 2, DEFAULT_IMAGE_MAP, 28);
  hullBarBacking.setTint(0x000000);
  hullBarBacking.setOrigin(0);
  this.playerShipUI.add(hullBarBacking);
  const hullBar = this.add.image(2, 2, DEFAULT_IMAGE_MAP, 28);
  hullBar.setTint(0x00FF00);
  hullBar.setOrigin(0);
  this.playerShipUI.add(hullBar);
  let candidateFound = false;
  const updateHullBar = () => {
    ViewEntities(this.entities, ['HullHealthComponent', 'PlayerControlComponent'], [], function(entity, health, control) {
      hullBarBacking.displayWidth = health.maxHealth * pixelToHullBarRatio;
      hullBar.displayWidth = health.health * pixelToHullBarRatio;
      candidateFound = true;
    });
  };
  const hullText = this.add.bitmapText(2, 2, 'newsgeek', 'Hull Integrity', DEFAULT_TEXT_SIZE);
  this.playerShipUI.add(hullText);

  const updatePlayerShipUI = () => {
    candidateFound = false;
    updateHullBar();
    if (candidateFound === false) {
      this.playerShipUI.children.iterate((child) => {
        child.setVisible(false);
      });
      return;
    }
  };
  this.events.on('update', updatePlayerShipUI);
  this.events.once('shutdown', () => {
    this.events.removeListener('update', updatePlayerShipUI);
  });

  // Mouseover ship UI (sometimes on)
  this.targetShipUI = this.add.group();
  const targetHullBarBacking = this.add.image(2, 2, DEFAULT_IMAGE_MAP, 28);
  targetHullBarBacking.setTint(0x000000);
  targetHullBarBacking.setOrigin(0);
  this.targetShipUI.add(targetHullBarBacking);
  const targetHullBar = this.add.image(2, 2, DEFAULT_IMAGE_MAP, 28);
  targetHullBar.setTint(0x00FF00);
  targetHullBar.setOrigin(0);
  this.targetShipUI.add(targetHullBar);
  const updateTargetHullBar = (target) => {
    if (HasComponent(target, 'HullHealthComponent')) {
      const health = GetComponent(target, 'HullHealthComponent');
      targetHullBarBacking.displayWidth = health.maxHealth * pixelToHullBarRatio;
      targetHullBar.displayWidth = health.health * pixelToHullBarRatio;
    }
  };
  const targetNameText = this.add.bitmapText(2, 32, 'newsgeek', 'NAME', DEFAULT_TEXT_SIZE);
  this.targetShipUI.add(targetNameText);
  const targetAffiliationText = this.add.bitmapText(2, 32 + DEFAULT_TEXT_SIZE, 'newsgeek', 'NAME OF TEAM', DEFAULT_TEXT_SIZE);
  this.targetShipUI.add(targetAffiliationText);
  const updateTargetNameAndAffiliation = (target) => {
    if (HasComponent(target, 'NameComponent')) {
      targetNameText.text = GetComponent(target, 'NameComponent').value;
    }

    if (HasComponent(target, 'TeamComponent')) {
      const team = GetComponent(target, 'TeamComponent');
      targetAffiliationText.text = team.value;
    } else {
      targetAffiliationText.text = '(unaffiliated)';
    }
  };

  this.targetShipUI.children.iterate((child) => {
    child.x += (GAME_WIDTH - 105);
  });

  const updateTargetShipUI = () => {
    if (this.currentlyPointingEntity === null) {
      this.targetShipUI.children.iterate((child) => {
        child.setVisible(false);
      });
      return;
    }

    this.targetShipUI.children.iterate((child) => {
      child.setVisible(true);
    });
    updateTargetHullBar(this.currentlyPointingEntity);
    updateTargetNameAndAffiliation(this.currentlyPointingEntity);
  };
  this.events.on('update', updateTargetShipUI);
  this.events.once('shutdown', () => {
    this.events.removeListener('update', updateTargetShipUI);
  });
};
Gameplay.prototype.create = function () {
  const dummySeed = 10101;
  ROT.RNG.setSeed(dummySeed);

  this.setup3DScene();

  this.gameCameraPos = new Phaser.Math.Vector2();
  this.gameCameraTheta = 0.0;
  this.setupInput();

  // TODO: remove me later and add real ship placement (dummy setup)
  for (let i = 0; i < 30; i++) {
    let e = NewEntity();
    AddComponent(e, 'ECSIndexComponent', new ECSIndexComponent(i));
    AddComponent(e, 'HullHealthComponent', new HullHealthComponent(30 + (Math.random() * 20), 30));
    AddComponent(e, 'PositionComponent', new PositionComponent(Math.random() * 30 - 15, Math.random() * 30 - 15));
    AddComponent(e, 'ForwardVelocityComponent', new ForwardVelocityComponent(0.3 + (Math.random() * 3.2) + (i === 0 ? 3 : 0)));
    AddComponent(e, 'RotationComponent', new RotationComponent(Math.random() * Math.PI * 2));
    AddComponent(e, 'DexterityComponent', new DexterityComponent(200 + (Math.random() * 50)));
    AddComponent(e, 'MeshComponent', new MeshComponent());
    AddComponent(e, 'AttackStrengthComponent', new AttackStrengthComponent(10));
    AddComponent(e, 'AttackRangeComponent', new AttackRangeComponent(10));
    if (i === 0) {
      AddComponent(e, 'PlayerControlComponent', new PlayerControlComponent());
      AddComponent(e, 'RequestDummy3DAppearanceComponent', new RequestDummy3DAppearanceComponent(0x0044FF));
      AddComponent(e, 'TeamComponent', new TeamComponent('Space Federation'));
      AddComponent(e, 'NameComponent', new NameComponent('Argo Mk. IV'));
    } else {
      AddComponent(e, 'AIControlComponent', new AIControlComponent());
      AddComponent(e, 'RequestDummy3DAppearanceComponent', new RequestDummy3DAppearanceComponent(0xFF3300));
      AddComponent(e, 'TeamComponent', new TeamComponent('G&T Empire'));
      AddComponent(e, 'NameComponent', new NameComponent('L. Dry Battleship'));
    }
    this.entities.push(e);

    let skipper = NewEntity();
    AddComponent(skipper, 'ShipReferenceComponent', new ShipReferenceComponent(i));
    AddComponent(skipper, 'SkipperComponent', new SkipperComponent());
    AddComponent(skipper, 'MaxSpeedComponent', new MaxSpeedComponent(8.0));
    AddComponent(skipper, 'DexterityComponent', new DexterityComponent(50));
    if (HasComponent(e, 'PlayerControlComponent')) {
      AddComponent(skipper, 'PlayerControlComponent', new PlayerControlComponent());
    } else {
      AddComponent(skipper, 'AIControlComponent', new AIControlComponent());
    }
    i++;
    AddComponent(skipper, 'ECSIndexComponent', new ECSIndexComponent(i));
    this.entities.push(skipper);

    let gunner = NewEntity();
    AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
    AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(i - 1));
    AddComponent(gunner, 'DexterityComponent', new DexterityComponent(50));
    if (HasComponent(e, 'PlayerControlComponent')) {
      AddComponent(gunner, 'PlayerControlComponent', new PlayerControlComponent());
    } else {
      AddComponent(gunner, 'AIControlComponent', new AIControlComponent());
    }
    i++;
    AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(i));
    this.entities.push(gunner);
  }

  // Add entities with deterity to the turn order
  this.ROTScheduler = new ROT.Scheduler.Speed();
  ViewEntities(this.entities, ['DexterityComponent', 'ECSIndexComponent'], [], (entity, dex, ecsIndex) => {
    this.ROTScheduler.add({
      indComponent: ecsIndex,
      getSpeed: () => { return dex.value; }
    }, true);
  });
  this.nextTurnReady = true;

  this.lockPanning = false;

  this.keys.return_cam.on('down', () => {
    ViewEntities(this.entities, ['PositionComponent', 'HullHealthComponent', 'PlayerControlComponent'], [], (entity, position, health, control) => {
      let t = this.add.tween({
        targets: this.gameCameraPos,
        x: position.x,
        y: position.y,
        duration: 150,
        easing: Phaser.Math.Easing.Cubic.In
      });
    });
    
  });

  this.setupUI();

  this.events.on('shutdown', this.shutdown, this);
};
Gameplay.prototype.update = function () {
  this.updateCameraFromInput();
  this.update3DScene();

  this.updateViewSystems();

  if (this.nextTurnReady) {
    this.doNextTurn();
  }
};
Gameplay.prototype.shutdown = function () {
  this.events.removeListener('shutdown');

  this.entities = [];
  this.ROTScheduler = null;
  this.nextTurnReady = true;

  this.lockPanning = false;

  this.playerShipUI.destroy(true);
  this.playerShipUI = null;

  this.currentlyPointingEntity = null;

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

    'return_cam': Phaser.Input.Keyboard.KeyCodes.SPACE
  };
  this.keys = this.input.keyboard.addKeys(keyConfigObject);
};

Gameplay.prototype.setup3DScene = function () {
  this.gameCamera = new THREE.PerspectiveCamera( 70, GAME_WIDTH / GAME_HEIGHT,  0.1, 1000 );
  this.three.camera = this.gameCamera;

  this.three.scene = new THREE.Scene();
  this.three.renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );
  this.three.renderer.autoClear = true;
  this.three.renderer.setClearColor(new THREE.Color(0x330044), 1.0);

  this.three.raycaster = new THREE.Raycaster(undefined, undefined, 0.1, 150);

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
  if (!(this.lockPanning)) {
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
  }

  if (this.keys.cam_turn_right.isDown) {
    this.gameCameraTheta += CAMERA_TURN_SPEED;
  }
  if (this.keys.cam_turn_left.isDown) {
    this.gameCameraTheta -= CAMERA_TURN_SPEED;
  }
};

// Repeatedly used by update3DScene to minimize small allocations
const threeMouseCoordsVector = new THREE.Vector2(0, 0);
const arrayRaycastResults = [];
Gameplay.prototype.update3DScene = function() {
  this.gameCamera.position.x = this.gameCameraPos.x + (Math.cos(this.gameCameraTheta) * CAMERA_DISTANCE);
  this.gameCamera.position.y = CAMERA_DISTANCE;
  this.gameCamera.position.z = this.gameCameraPos.y + (Math.sin(this.gameCameraTheta) * CAMERA_DISTANCE);
  this.gameCamera.lookAt(this.gameCameraPos.x, 0, this.gameCameraPos.y);

  this.currentlyPointingEntity = null;
  const mouseX = this.input.mousePointer.x / GAME_WIDTH;
  const mouseY = 1.0 - (this.input.mousePointer.y / GAME_HEIGHT);
  threeMouseCoordsVector.x = (mouseX * 2.0) - 1.0;
  threeMouseCoordsVector.y = (mouseY * 2.0) - 1.0;
  this.three.raycaster.setFromCamera(threeMouseCoordsVector, this.gameCamera);
  this.three.raycaster.intersectObjects(this.three.scene.children, false, arrayRaycastResults);
  if (arrayRaycastResults.length > 0) {
    if (arrayRaycastResults[0].object.userData.entity !== undefined) {
      this.currentlyPointingEntity = arrayRaycastResults[0].object.userData.entity;
    }
  }
  // clear out the results
  arrayRaycastResults.length = 0;
};

