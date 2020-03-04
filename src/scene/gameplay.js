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
  this.gameCameraPhi = Math.PI * 0.25;
  this.gameCamera = null;

  this.entities = [];
  this.ROTScheduler = null;
  this.nextTurnReady = true;

  this.currentlyPointingEntity = null;

  this.playerShipUI = null;

  this.lockPanning = false;
};
Gameplay.prototype.init = function (payload) {
  this.entities = payload.entities;
}
Gameplay.prototype.preload = function () {
  //
};
Gameplay.prototype.setupUI = function () {
  const pixelToHullBarRatio = 1.8;

  // Player ship UI (always on)
  this.playerShipUI = this.add.group();

  const sectorInfo = this.add.bitmapText(2, 2, 'miniset', World.getCurrentSector().name, DEFAULT_TEXT_SIZE);

  // TODO: make a better compass
  const compassInfo = this.add.bitmapText(GAME_WIDTH * 0.5, 2, 'miniset', '. . N . .', DEFAULT_TEXT_SIZE);
  let tick = 0;
  const updateCompassInfo = () => {
    tick++
    if (tick > 3) {
      tick = 0;
    } else {
      return;
    }

    const cameraAngle = this.gameCameraTheta;
    const cameraAngle2PiClamped = Phaser.Math.Angle.Normalize(cameraAngle);
    const cameraAngleIndex = ~~((cameraAngle2PiClamped / (Math.PI * 2.001)) * COMPASS_ANGLE_LETTERS.length);
    compassInfo.text = '. . ' + COMPASS_ANGLE_LETTERS[cameraAngleIndex] + ' . .';
  };

  const hullBarBacking = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE), DEFAULT_IMAGE_MAP, 28);
  hullBarBacking.setTint(0x333333);
  hullBarBacking.setOrigin(0);
  hullBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(hullBarBacking);
  const hullBar = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE), DEFAULT_IMAGE_MAP, 28);
  hullBar.setTint(0x00FF00);
  hullBar.setOrigin(0);
  hullBar.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(hullBar);
  let candidateFound = false;
  let lerpHealth = 0;
  const updateHullBar = () => {
    ViewEntities(this.entities, ['HullHealthComponent', 'PlayerControlComponent'], [], function(entity, health, control) {
      hullBarBacking.displayWidth = health.maxHealth * pixelToHullBarRatio;

      lerpHealth = Phaser.Math.Interpolation.SmoothStep(0.3, lerpHealth, health.health);
      hullBar.displayWidth = lerpHealth * pixelToHullBarRatio;
      candidateFound = true;
    });
  };
  const hullText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE), 'miniset', 'Ship Health', DEFAULT_TEXT_SIZE);
  this.playerShipUI.add(hullText);

  const shieldsBarBacking = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 2), DEFAULT_IMAGE_MAP, 28);
  shieldsBarBacking.setTint(0x333333);
  shieldsBarBacking.setOrigin(0);
  shieldsBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(shieldsBarBacking);
  const shieldsBar = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 2), DEFAULT_IMAGE_MAP, 28);
  shieldsBar.setTint(0x36FFFF);
  shieldsBar.setOrigin(0);
  shieldsBar.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(shieldsBar);
  let lerpShields = 0;
  const updateShieldsBar = () => {
    ViewEntities(this.entities, ['ShieldsComponent', 'PlayerControlComponent'], [], function(entity, shields, control) {
      shieldsBarBacking.displayWidth = shields.maxHealth * pixelToHullBarRatio;

      lerpShields = Phaser.Math.Interpolation.SmoothStep(0.3, lerpShields, shields.health);
      shieldsBar.displayWidth = lerpShields * pixelToHullBarRatio;
    });
  };
  const shieldsText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE * 2), 'miniset', 'Shields', DEFAULT_TEXT_SIZE);
  this.playerShipUI.add(shieldsText);

  const suppliesBarBacking = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 3), DEFAULT_IMAGE_MAP, 28);
  suppliesBarBacking.setTint(0x333333);
  suppliesBarBacking.setOrigin(0);
  suppliesBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  suppliesBarBacking.displayWidth = SUPPLIES_BAR_WIDTH;
  this.playerShipUI.add(suppliesBarBacking);
  const suppliesBar = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 3), DEFAULT_IMAGE_MAP, 28);
  suppliesBar.setTint(0xaaaaaa);
  suppliesBar.setOrigin(0);
  suppliesBar.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(suppliesBar);
  let lerpSupplies = 0;
  const updatesuppliesBar = () => {
    ViewEntities(this.entities, ['SuppliesComponent', 'PlayerControlComponent'], [], function(entity, supplies, control) {
      
      lerpSupplies = Phaser.Math.Interpolation.SmoothStep(0.3, lerpSupplies, supplies.value);
      suppliesBar.displayWidth = (lerpSupplies / supplies.max) * SUPPLIES_BAR_WIDTH;
    });
  };
  const suppliesText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE * 3), 'miniset', 'Supplies', DEFAULT_TEXT_SIZE);
  this.playerShipUI.add(suppliesText);

  const updatePlayerShipUI = () => {
    candidateFound = false;
    updateHullBar();
    updateShieldsBar();
    updatesuppliesBar();
    updateCompassInfo();
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
  const targetHullBarBacking = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 0), DEFAULT_IMAGE_MAP, 28);
  targetHullBarBacking.setTint(0x333333);
  targetHullBarBacking.setOrigin(0);
  targetHullBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  this.targetShipUI.add(targetHullBarBacking);
  const targetHullBar = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 0), DEFAULT_IMAGE_MAP, 28);
  targetHullBar.setTint(0x00FF00);
  targetHullBar.setOrigin(0);
  targetHullBar.displayHeight = DEFAULT_TEXT_SIZE;
  this.targetShipUI.add(targetHullBar);
  const targetShieldsBarBacking = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 1), DEFAULT_IMAGE_MAP, 28);
  targetShieldsBarBacking.setTint(0x333333);
  targetShieldsBarBacking.setOrigin(0);
  targetShieldsBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  this.targetShipUI.add(targetShieldsBarBacking);
  const targetShieldsBar = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 1), DEFAULT_IMAGE_MAP, 28);
  targetShieldsBar.setTint(0x36FFFF);
  targetShieldsBar.setOrigin(0);
  targetShieldsBar.displayHeight = DEFAULT_TEXT_SIZE;
  this.targetShipUI.add(targetShieldsBar);
  const updateTargetHullBar = (target) => {
    if (HasComponent(target, 'HullHealthComponent')) {
      const health = GetComponent(target, 'HullHealthComponent');
      targetHullBarBacking.displayWidth = health.maxHealth * pixelToHullBarRatio;
      targetHullBar.displayWidth = health.health * pixelToHullBarRatio;
    } else {
      targetHullBarBacking.setVisible(false);
      targetHullBar.setVisible(false);
    }

    if (HasComponent(target, 'ShieldsComponent')) {
      const health = GetComponent(target, 'ShieldsComponent');
      targetShieldsBarBacking.displayWidth = health.maxHealth * pixelToHullBarRatio;
      targetShieldsBar.displayWidth = health.health * pixelToHullBarRatio;
    } else {
      targetShieldsBarBacking.setVisible(false);
      targetShieldsBar.setVisible(false);
    }
  };

  const targetNameText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE * 2), 'miniset', 'NAME', DEFAULT_TEXT_SIZE);
  this.targetShipUI.add(targetNameText);
  const targetClassText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE * 3), 'miniset', 'CLASS', DEFAULT_TEXT_SIZE);
  this.targetShipUI.add(targetClassText);
  const targetAffiliationText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE * 4), 'miniset', 'NAME OF TEAM', DEFAULT_TEXT_SIZE);
  this.targetShipUI.add(targetAffiliationText);
  const targetAttackRangeText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE * 5), 'miniset', 'ATTACK RANGE', DEFAULT_TEXT_SIZE);
  targetAttackRangeText.tint = 0xFF0000;
  this.targetShipUI.add(targetAttackRangeText);
  const targetAttackPowerText = this.add.bitmapText(2, 2 + (DEFAULT_TEXT_SIZE * 6), 'miniset', 'ATTACK PWR', DEFAULT_TEXT_SIZE);
  targetAttackPowerText.tint = 0xFF5500;
  this.targetShipUI.add(targetAttackPowerText);
  const updateTargetNameAndAffiliation = (target) => {
    if (HasComponent(target, 'NameComponent')) {
      targetNameText.text = GetComponent(target, 'NameComponent').value;
    } else {
      targetNameText.text = '???';
    }

    if (HasComponent(target, 'TeamComponent')) {
      const team = GetComponent(target, 'TeamComponent');
      targetAffiliationText.text = team.value;
    } else {
      targetAffiliationText.text = '(unaffiliated)';
    }

    if (HasComponent(target, 'ClassComponent')) {
      const team = GetComponent(target, 'ClassComponent');
      targetClassText.text = team.value;
    } else {
      targetClassText.text = '(unknown)';
    }

    if (HasComponent(target, 'AttackRangeComponent')) {
      const attackRange = GetComponent(target, 'AttackRangeComponent');
      targetAttackRangeText.text = 'Cannons range: ' + attackRange.value;
    } else {
      targetAttackRangeText.text = '';
    }

    if (HasComponent(target, 'AttackStrengthComponent')) {
      const attackRange = GetComponent(target, 'AttackStrengthComponent');
      targetAttackPowerText.text = 'Cannons Strength: ' + attackRange.value;
    } else {
      targetAttackPowerText.text = '';
    }
  };

  this.targetShipUI.children.iterate((child) => {
    child.x += (GAME_WIDTH - 105);
  });

  const updateTargetShipUI = () => {
    if (this.previousPointingEntity === this.currentlyPointingEntity) {
      return;
    } 

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

  // TODO: make this a graphic
  this.cruiseText = this.add.bitmapText(2, GAME_HEIGHT - 16, 'miniset', 'CRUISE', 16);
  this.cruiseText.setVisible(false);
};
Gameplay.prototype.createPortraitAnimations = function() {
  this.anims.create({
    key: 'bryce',
    frames: [{ key: 'portraits', frame: 0 }, { key: 'portraits', frame: 1 }, { key: 'portraits', frame: 0 }, { key: 'portraits', frame: 1 }, { key: 'portraits', frame: 0 }, { key: 'portraits', frame: 1 }, { key: 'portraits', frame: 0 }, { key: 'portraits', frame: 1 }, { key: 'portraits', frame: 0 }],
    frameRate: 10,
    repeat: 0
  });
};
Gameplay.prototype.create = function () {
  this.exiting = false;

  const dummySeed = 10101;
  ROT.RNG.setSeed(dummySeed);

  this.createPortraitAnimations();

  this.setup3DScene();

  this.gameCameraPos = new Phaser.Math.Vector2();
  this.setupInput();

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

  const tweenCameraToPlayer = (duration) => {
    ViewEntities(this.entities, ['PositionComponent', 'HullHealthComponent', 'PlayerControlComponent'], [], (entity, position, health, control) => {
      let t = this.add.tween({
        targets: this.gameCameraPos,
        x: position.x,
        y: position.y,
        duration: duration,
        easing: Phaser.Math.Easing.Cubic.In
      });
    });
  };
  this.keys.return_cam.on('down', () => {
    tweenCameraToPlayer(150);
  });
  tweenCameraToPlayer(400);

  this.keys.cruise.on('down', () => {
    console.log('cruise');
    if (!(this.cruiseText.visible)) {
      ViewEntities(this.entities, ['SkipperComponent', 'PlayerControlComponent'], ['CruiseControlComponent'], (entity) => {
        AddComponent(entity, 'CruiseControlComponent', new CruiseControlComponent());
      });
      ViewEntities(this.entities, ['EngineerComponent', 'PlayerControlComponent'], ['CruiseControlComponent'], (entity) => {
        AddComponent(entity, 'CruiseControlComponent', new CruiseControlComponent());
      });
      this.cruiseText.setVisible(true);
    } else {
      ViewEntities(this.entities, ['SkipperComponent', 'PlayerControlComponent', 'CruiseControlComponent'], [], (entity) => {
        RemoveComponent(entity, 'CruiseControlComponent');
      });
      ViewEntities(this.entities, ['EngineerComponent', 'PlayerControlComponent', 'CruiseControlComponent'], [], (entity) => {
        RemoveComponent(entity, 'CruiseControlComponent');
      });
      this.cruiseText.setVisible(false);
    }
  });

  this.setupUI();

  // If an entity has a loaded mesh, let's parent it to the current scene from the previous
  ViewEntities(this.entities, ['MeshComponent'], [], (entity, mesh) => {
    if (mesh.mesh === null) {
      return;
    }

    this.three.scene.add(mesh.mesh);
  });

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
  this.cruiseText.destroy();
  this.cruiseText = null;

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

    'return_cam': Phaser.Input.Keyboard.KeyCodes.SPACE,
    'cruise': Phaser.Input.Keyboard.KeyCodes.SHIFT
  };
  this.keys = this.input.keyboard.addKeys(keyConfigObject);
};

Gameplay.prototype.setup3DBackground = function () {
  const vertexInfp = this.cache.shader.get('planet_vertex');
  const vert = vertexInfp.fragmentSrc;

  const fragmentInfo = this.cache.shader.get('planet_fragment');
  const frag = fragmentInfo.fragmentSrc;

  const backgroundGeom = new THREE.IcosahedronBufferGeometry(900, 2);
  const backgroundMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        color1: new THREE.Uniform(new THREE.Color(0x002244)),
        color2: new THREE.Uniform(new THREE.Color(0x112233)),
        color3: new THREE.Uniform(new THREE.Color(0x001133)),
        scaleNoise: new THREE.Uniform(0.008),
        deRes: new THREE.Uniform(0),
        displayShadow: new THREE.Uniform(0)
      }
    });
  const backgroundHolder = new THREE.Group();
  const background = new THREE.Mesh( backgroundGeom, backgroundMaterial);
  backgroundHolder.add(background);
  this.three.scene.add(backgroundHolder);

  const sectorGeom = new THREE.PlaneGeometry( SECTOR_WIDTH, SECTOR_HEIGHT, 1, 1 );
  const sectorMat = new THREE.MeshBasicMaterial( {color: 0x0033FF, wireframe: true } );
  const sectorMesh = new THREE.Mesh( sectorGeom, sectorMat );
  sectorMesh.position.set(SECTOR_WIDTH * 0.5, 0, SECTOR_HEIGHT * 0.5);
  sectorMesh.rotation.x = Math.PI * 0.5;
  this.three.scene.add( sectorMesh );

  // Generate starfield from:
  // https://math.stackexchange.com/a/1585996
  const starVerts = [];
  const starfieldRadius = 200;
  for (var i = 0; i < NUMBER_OF_STARS; i++) {
    let x = (Math.random() * 2 - 1.0) + 0.0001;
    let y = (Math.random() * 2 - 1.0) + 0.0001;
    let z = (Math.random() * 2 - 1.0) + 0.0001;
    const normalizeFactor = 1.0 / Math.sqrt((x*x) + (y*y) + (z*z));
    x *= normalizeFactor * starfieldRadius;
    y *= normalizeFactor * starfieldRadius;
    z *= normalizeFactor * starfieldRadius;
    starVerts.push(x, y, z);
  }
  const starGeom = new THREE.BufferGeometry();
  starGeom.addAttribute( 'position', new THREE.Float32BufferAttribute( starVerts, 3 ) );
  const stars = new THREE.Points(starGeom, STARS_COLOR);
  this.three.scene.add(stars);

  const attackRangeGeometry = new THREE.CircleBufferGeometry(1.0, 12);
  const attackRangeMat = new THREE.MeshBasicMaterial( {color: 0xFF0000, wireframe: true } );
  this.attackRangeMarker = new THREE.Mesh(attackRangeGeometry, attackRangeMat);
  this.attackRangeMarker.rotation.x = Math.PI * 0.5;
  this.attackRangeMarker.visible = false;
  this.three.scene.add(this.attackRangeMarker);

}
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

  this.setup3DBackground();

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

  if (this.keys.cam_turn_right.isDown || this.keys.right.isDown) {
    this.gameCameraTheta += CAMERA_TURN_SPEED;
  }
  if (this.keys.cam_turn_left.isDown || this.keys.left.isDown) {
    this.gameCameraTheta -= CAMERA_TURN_SPEED;
  }

  if (this.keys.up.isDown) {
    this.gameCameraPhi = Math.min(this.gameCameraPhi - CAMERA_TURN_SPEED, Math.PI * 0.45);
  }
  if (this.keys.down.isDown) {
    this.gameCameraPhi = Math.max(this.gameCameraPhi + CAMERA_TURN_SPEED, 0);
  }
};

// Repeatedly used by update3DScene to minimize small allocations
const threeMouseCoordsVector = new THREE.Vector2(0, 0);
const arrayRaycastResults = [];
Gameplay.prototype.update3DScene = function() {
  const cameraHeight = Math.sin(this.gameCameraPhi) * CAMERA_DISTANCE;
  const cameraBackup = Math.cos(this.gameCameraPhi) * CAMERA_DISTANCE;

  this.gameCamera.position.x = this.gameCameraPos.x + (Math.cos(this.gameCameraTheta) * cameraBackup);
  this.gameCamera.position.y = cameraHeight;
  this.gameCamera.position.z = this.gameCameraPos.y + (Math.sin(this.gameCameraTheta) * cameraBackup);
  this.gameCamera.lookAt(this.gameCameraPos.x, 0, this.gameCameraPos.y);

  this.previousPointingEntity = this.currentlyPointingEntity;
  this.currentlyPointingEntity = null;
  const mouseX = this.input.mousePointer.x / GAME_WIDTH;
  const mouseY = 1.0 - (this.input.mousePointer.y / GAME_HEIGHT);
  threeMouseCoordsVector.x = (mouseX * 2.0) - 1.0;
  threeMouseCoordsVector.y = (mouseY * 2.0) - 1.0;
  this.three.raycaster.setFromCamera(threeMouseCoordsVector, this.gameCamera);
  this.three.raycaster.intersectObjects(this.three.scene.children, false, arrayRaycastResults);
  if ((arrayRaycastResults.length > 0) && (arrayRaycastResults[0].object.entityRef !== undefined)) {
    this.currentlyPointingEntity = arrayRaycastResults[0].object.entityRef;

    if (HasComponent(this.currentlyPointingEntity, 'AttackRangeComponent')) {
      const attackRange = GetComponent(this.currentlyPointingEntity, 'AttackRangeComponent').value;

      this.attackRangeMarker.visible = true;
      this.attackRangeMarker.position.set(arrayRaycastResults[0].object.position.x, arrayRaycastResults[0].object.position.y, arrayRaycastResults[0].object.position.z);
      this.attackRangeMarker.scale.set(attackRange, attackRange, 1.0);
    }
  } else {
    this.attackRangeMarker.visible = false;
  }
  // clear out the results
  arrayRaycastResults.length = 0;
};

