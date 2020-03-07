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
  this.gameCameraTheta = (Math.PI * 0.25) + Math.PI + 1;
  this.gameCameraPhi = Math.PI * 0.25;
  this.gameCamera = null;

  this.entities = [];
  this.ROTScheduler = null;
  this.nextTurnReady = true;
  this.nextTurnQueue = [];

  this.currentlyPointingEntity = null;

  this.playerShipUI = null;

  this.explosions = [];

  this.lockPanning = false;
  this.lockRotating = false;
};
Gameplay.prototype.init = function (payload) {
  this.entities = payload.entities;
}
Gameplay.prototype.preload = function () {
  //
};
Gameplay.prototype.updateTurnOrder = function() {
  for (let i = 0; i < TURNS_TO_DISPLAY; i++) { 
    const p = this.turnOrderSprites[i];
    if (i === 0) {
      let t = this.add.tween({
        targets: p,
        x: p.x - 34,
        duration: 70
      });

      continue;
    }

    let t = this.add.tween({
      targets: p,
      y: p.y - 28,
      duration: 60
    });
  }

  this.time.addEvent({
    delay: 100,
    callback: () => {
      for (let i = 0; i < TURNS_TO_DISPLAY; i++) {
        const nextEntity = this.nextTurnQueue[i][0];
        const p = this.turnOrderSprites[i];
        if (HasComponent(nextEntity, 'PortraitComponent')) {
          p.setFrame(PortraitFrames[GetComponent(nextEntity, 'PortraitComponent').value].value);
        } else {
          p.setFrame(63);
        }
        p.x = 0;
        p.y = i * 28;
      }
    }
  })
  
};
Gameplay.prototype.setupUI = function () {
  const pixelToHullBarRatio = 2.0;

  // Player ship UI (always on)
  this.playerShipUI = this.add.group();

  this.add.bitmapText(2, 48 - DEFAULT_TEXT_SIZE, 'miniset', 'NEXT', DEFAULT_TEXT_SIZE);
  this.turnOrder = this.add.container();
  this.turnOrder.x = 2;
  this.turnOrder.y = 48;
  this.turnOrder.scaleX = 0.75;
  this.turnOrder.scaleY = 0.75;
  this.turnOrderSprites = [];
  for (let i = 0; i < TURNS_TO_DISPLAY; i++) {
    const p = this.add.sprite(0, i * 28, 'portraits', 0);
    p.setOrigin(0);
    this.turnOrderSprites.push(p);
    this.turnOrder.add(p);
  }

  // TODO: make a better compass
  const compassInfo = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT - (DEFAULT_TEXT_SIZE * 2) - 2, 'miniset', '. . N . .', DEFAULT_TEXT_SIZE);
  compassInfo.setOrigin(0.5, 0);
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

  const sectorInfo = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT - DEFAULT_TEXT_SIZE - 2, 'miniset', World.getCurrentSector().name, DEFAULT_TEXT_SIZE);
  sectorInfo.setOrigin(0.5, 0);

  const orbitBarBacking = this.add.image(0, (DEFAULT_TEXT_SIZE), DEFAULT_IMAGE_MAP, 28);
  orbitBarBacking.setTint(0xaa3300);
  orbitBarBacking.setOrigin(0);
  orbitBarBacking.displayWidth = GAME_WIDTH;
  orbitBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  const orbitText = this.add.tileSprite(0, (DEFAULT_TEXT_SIZE), GAME_WIDTH, DEFAULT_TEXT_SIZE, 'bars', 3);
  orbitText.setOrigin(0);
  orbitText.tint = 0xFF0000;
  orbitText.blendMode = Phaser.BlendModes.ADD;
  const shiftOrbitText = () => {
    orbitBarBacking.visible = false;
    orbitText.visible = false;
    ViewEntities(this.entities, ['HullHealthComponent', 'PlayerControlComponent', 'ShipOrbitingPlanetComponent'], [], function(entity, health, control) {
      orbitBarBacking.visible = true;
      orbitText.visible = true;
    });
    orbitText.tilePositionX = ((orbitText.tilePositionX + 0.20254));
  };
  this.events.on('update', shiftOrbitText);
  this.events.once('shutdown', () => {
    this.events.removeListener('update', shiftOrbitText);
  });

  const hullBarBacking = this.add.image(0, (DEFAULT_TEXT_SIZE), DEFAULT_IMAGE_MAP, 28);
  hullBarBacking.setTint(0x251111);
  hullBarBacking.setOrigin(0);
  hullBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(hullBarBacking);
  const hullBar = this.add.image(0, (DEFAULT_TEXT_SIZE), DEFAULT_IMAGE_MAP, 28);
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
  const hullText = this.add.image(0, (DEFAULT_TEXT_SIZE), 'bars', 1);
  hullText.setOrigin(0);
  hullText.blendMode = Phaser.BlendModes.ERASE;
  this.playerShipUI.add(hullText);

  const shieldsBarBacking = this.add.image(0, (DEFAULT_TEXT_SIZE * 2), DEFAULT_IMAGE_MAP, 28);
  shieldsBarBacking.setTint(0x251111);
  shieldsBarBacking.setOrigin(0);
  shieldsBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(shieldsBarBacking);
  const shieldsBar = this.add.image(0, (DEFAULT_TEXT_SIZE * 2), DEFAULT_IMAGE_MAP, 28);
  shieldsBar.setTint(0x36FFFF);
  shieldsBar.setOrigin(0);
  shieldsBar.displayHeight = DEFAULT_TEXT_SIZE;
  this.playerShipUI.add(shieldsBar);
  const shieldsText = this.add.image(0, (DEFAULT_TEXT_SIZE * 2), 'bars', 2);
  shieldsText.setOrigin(0);
  shieldsText.blendMode = Phaser.BlendModes.ERASE;
  this.playerShipUI.add(shieldsText);
  let lerpShields = 0;
  const updateShieldsBar = () => {
    ViewEntities(this.entities, ['ShieldsComponent', 'PlayerControlComponent'], [], (entity, shields, control) => {
      shieldsBarBacking.displayWidth = shields.maxHealth * pixelToHullBarRatio;

      lerpShields = Phaser.Math.Interpolation.SmoothStep(0.3, lerpShields, shields.health);
      shieldsBar.displayWidth = lerpShields * pixelToHullBarRatio;
      shieldsBar.displayHeight = DEFAULT_TEXT_SIZE;

      const hasShieldsUp = HasComponent(entity, 'ShieldsUpComponent');
      const flashVal = ((Math.sin(this.time.now * 0.01) * 0.5) + 0.5);
      if (hasShieldsUp) {
        shieldsBar.displayWidth += flashVal * 2.0;
        shieldsBar.displayHeight += flashVal * 2.0;
        shieldsText.displayHeight = shieldsBar.displayHeight;
        shieldsText.scaleX = shieldsText.scaleY;
      } else {
        shieldsText.scaleX = 1.0;
        shieldsText.scaleY = 1.0;
      }
      shieldsBar.setTint(hasShieldsUp ? lerpColor(0xDDFFFF, 0x10FFFF, flashVal) : 0x36FFFF);
    });
  };

  const suppliesBarBacking = this.add.image(0, 0, DEFAULT_IMAGE_MAP, 28);
  suppliesBarBacking.setTint(0x251111);
  suppliesBarBacking.setOrigin(0);
  suppliesBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  suppliesBarBacking.displayWidth = SUPPLIES_BAR_WIDTH;
  this.playerShipUI.add(suppliesBarBacking);
  const suppliesBar = this.add.image(0, 0, DEFAULT_IMAGE_MAP, 28);
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
  const suppliesText = this.add.image(GAME_WIDTH * 0.5, 0, 'bars', 0);
  suppliesText.setOrigin(0.5, 0);
  suppliesText.blendMode = Phaser.BlendModes.ERASE;
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
  targetHullBarBacking.setTint(0x251111);
  targetHullBarBacking.setOrigin(0);
  targetHullBarBacking.displayWidth = 96;
  targetHullBarBacking.displayHeight = DEFAULT_TEXT_SIZE;
  this.targetShipUI.add(targetHullBarBacking);
  const targetHullBar = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 0), DEFAULT_IMAGE_MAP, 28);
  targetHullBar.setTint(0x00FF00);
  targetHullBar.setOrigin(0);
  targetHullBar.displayHeight = DEFAULT_TEXT_SIZE;
  this.targetShipUI.add(targetHullBar);
  const targetShieldsBarBacking = this.add.image(2, 2 + (DEFAULT_TEXT_SIZE * 1), DEFAULT_IMAGE_MAP, 28);
  targetShieldsBarBacking.setTint(0x251111);
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
      targetHullBarBacking.displayWidth = 96;
      targetHullBar.displayWidth = health.health / health.maxHealth * 96;
    } else {
      targetHullBarBacking.setVisible(false);
      targetHullBar.setVisible(false);
    }

    if (HasComponent(target, 'ShieldsComponent')) {
      const health = GetComponent(target, 'ShieldsComponent');
      targetShieldsBarBacking.displayWidth = 96;
      targetShieldsBar.displayWidth = health.health / health.maxHealth * 96;
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

  const targetPortrait = this.add.sprite(-32, DEFAULT_TEXT_SIZE + 8, 'portraits', 0);
  targetPortrait.setOrigin(0);
  this.targetShipUI.add(targetPortrait);

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

    if (HasComponent(target, 'PortraitComponent') && PortraitFrames[GetComponent(target, 'PortraitComponent').value]) {
      const portraitData = GetComponent(target, 'PortraitComponent');
      const frameIndex = PortraitFrames[portraitData.value].value;
      targetPortrait.setFrame(frameIndex);

      targetPortrait.setVisible(true);
    } else {
      targetPortrait.setVisible(false);
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
  this.cruiseSprites = this.add.container(18, GAME_HEIGHT - 24);
  this.cruiseSprites.scaleX = 0.75;
  this.cruiseSprites.scaleY = 0.75;
  const skipperSprite = this.add.sprite(0, 0, 'portraits', 0);
  this.cruiseSprites.add(skipperSprite)
  const gunnerSprite = this.add.sprite(64 - 16, 0, 'portraits', 2);
  this.cruiseSprites.add(gunnerSprite)
  const engineerSprite = this.add.sprite(128 - 32, 0, 'portraits', 6);
  this.cruiseSprites.add(engineerSprite)
  const shieldSprite = this.add.sprite(192 - 50, 0, 'portraits', 4);
  this.cruiseSprites.add(shieldSprite)
  this.skipperCruiseGraphic = this.add.image(0, 0, 'cruise_lock_button', "awake");
  this.skipperCruiseGraphic.setInteractive();
  this.skipperCruiseGraphic.on('pointerdown', () => {
    World.snoozeSkipper = !World.snoozeSkipper;
  });
  this.skipperCruiseGraphic2 = this.add.sprite(8 + 0, -8, 'cruise_lock_butto8', "z1");
  this.skipperCruiseGraphic2.anims.play('snooze');
  this.cruiseSprites.add(this.skipperCruiseGraphic);
  this.cruiseSprites.add(this.skipperCruiseGraphic2);
  let noticeKey = this.add.bitmapText(0 + 13, 8, 'miniset', '[Z]', DEFAULT_TEXT_SIZE);
  noticeKey.scaleX = 2;
  noticeKey.scaleY = 2;
  noticeKey.setCenterAlign();
  noticeKey.setOrigin(0.5, 0);
  this.cruiseSprites.add(noticeKey);
  this.gunnerCruiseGraphic = this.add.image(64 - 16, 0, 'cruise_lock_button', "awake");
  this.gunnerCruiseGraphic.setInteractive();
  this.gunnerCruiseGraphic.on('pointerdown', () => {
    World.snoozeGunner = !World.snoozeGunner;
  });
  this.gunnerCruiseGraphic2 = this.add.sprite(8 + 64 - 16, -8, 'cruise_lock_button', "z1");
  this.gunnerCruiseGraphic2.anims.play('snooze');
  this.cruiseSprites.add(this.gunnerCruiseGraphic);
  this.cruiseSprites.add(this.gunnerCruiseGraphic2);
  noticeKey = this.add.bitmapText(64 - 16 + 13, 8, 'miniset', '[X]', DEFAULT_TEXT_SIZE);
  noticeKey.scaleX = 2;
  noticeKey.scaleY = 2;
  noticeKey.setCenterAlign();
  noticeKey.setOrigin(0.5, 0);
  this.cruiseSprites.add(noticeKey);
  this.engineerCruiseGraphic = this.add.image(128 - 32, 0, 'cruise_lock_button', "awake");
  this.engineerCruiseGraphic.setInteractive();
  this.engineerCruiseGraphic.on('pointerdown', () => {
    World.snoozeEngineer = !World.snoozeEngineer;
  });
  this.engineerCruiseGraphic2 = this.add.sprite(8 + 128 - 32, -8, 'cruise_lock_button', "z1");
  this.engineerCruiseGraphic2.anims.play('snooze');
  this.cruiseSprites.add(this.engineerCruiseGraphic);
  this.cruiseSprites.add(this.engineerCruiseGraphic2);
  noticeKey = this.add.bitmapText(128 - 32 + 13, 8, 'miniset', '[C]', DEFAULT_TEXT_SIZE);
  noticeKey.scaleX = 2;
  noticeKey.scaleY = 2;
  noticeKey.setCenterAlign();
  noticeKey.setOrigin(0.5, 0);
  this.cruiseSprites.add(noticeKey);
  this.shieldsCruiseGraphic = this.add.image(192 - 50, 0, 'cruise_lock_button', "awake");
  this.shieldsCruiseGraphic.setInteractive();
  this.shieldsCruiseGraphic.on('pointerdown', () => {
    World.snoozeShields = !World.snoozeShields;
  });
  this.shieldsCruiseGraphic2 = this.add.sprite(8 + 192 - 50, -8, 'cruise_lock_button', "z1");
  this.shieldsCruiseGraphic2.anims.play('snooze');
  this.cruiseSprites.add(this.shieldsCruiseGraphic);
  this.cruiseSprites.add(this.shieldsCruiseGraphic2);
  noticeKey = this.add.bitmapText(192 - 50 + 13, 8, 'miniset', '[V]', DEFAULT_TEXT_SIZE);
  noticeKey.scaleX = 2;
  noticeKey.scaleY = 2;
  noticeKey.setCenterAlign();
  noticeKey.setOrigin(0.5, 0);
  this.cruiseSprites.add(noticeKey);
};
const PortraitFrames = {};
Gameplay.prototype.createPortraitAnimations = function() {
  const generate = (name, a, b, repeat) => {
    this.anims.create({
      key: name,
      frames: [{ key: 'portraits', frame: a }, { key: 'portraits', frame: b }, { key: 'portraits', frame: a }, { key: 'portraits', frame: b }, { key: 'portraits', frame: a }, { key: 'portraits', frame: b }, { key: 'portraits', frame: a }, { key: 'portraits', frame: b }, { key: 'portraits', frame: a }],
      frameRate: 10,
      repeat: repeat
    });

    PortraitFrames[name] = { value: a };
  };

  generate('bryce', 0, 1, 0);
  generate('jenny', 2, 3, 0);
  generate('paska', 4, 5, 0);
  generate('ella', 6, 7, 0);
  generate('gamilon1', 8, 9, 0);
  generate('gamilon2', 10, 11, 0);
  generate('old_god', 12, 13, -1);
  generate('gamilon_mini', 14, 15, 0);
  generate('gamilon3', 16, 17, 0);
  generate('algo', 32, 33, 0);

  this.anims.create({
    key: 'snooze',
    frames: [ { key: 'cruise_lock_button', frame: 'z1'}, { key: 'cruise_lock_button', frame: 'z2'} ],
    frameRate: 2,
    repeat: -1
  })
};
Gameplay.prototype.create = function () {
  this.exiting = false;

  this.cameras.cameras[0].fadeIn(1000);

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
  this.nextTurnQueue = [];
  for (let i = 0; i < TURNS_TO_DISPLAY; i++) {
    let nextTurn = this.ROTScheduler.next();
    let nextEntityCandidate = this.entities[nextTurn.indComponent.value];
    while (nextEntityCandidate === undefined) {
      nextTurn = this.ROTScheduler.next();
      nextEntityCandidate = this.entities[nextTurn.indComponent.value];
    }
    const nextEntity = [nextEntityCandidate];
    this.nextTurnQueue.push(nextEntity);
  }

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

  const flipSkipper = () => { World.snoozeSkipper = !(World.snoozeSkipper); };
  this.keys.cruiseSkipper.on('down', flipSkipper);
  this.events.once('shutdown', () => { this.keys.cruiseSkipper.removeListener(flipSkipper); });
  const flipGunner = () => { World.snoozeGunner = !(World.snoozeGunner); };
  this.keys.cruiseGunner.on('down', flipGunner);
  this.events.once('shutdown', () => { this.keys.cruiseGunner.removeListener(flipGunner); });
  const flipEngineer = () => { World.snoozeEngineer = !(World.snoozeEngineer); };
  this.keys.cruiseEngineer.on('down', flipEngineer);
  this.events.once('shutdown', () => { this.keys.cruiseEngineer.removeListener(flipEngineer); });
  const flipShields = () => { World.snoozeShields = !(World.snoozeShields); };
  this.keys.cruiseShields.on('down', flipShields);
  this.events.once('shutdown', () => { this.keys.cruiseShields.removeListener(flipShields); });


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

  this.skipperCruiseGraphic.setFrame( World.snoozeSkipper ? 'sleep' : 'awake' );
  this.gunnerCruiseGraphic.setFrame( World.snoozeGunner ? 'sleep' : 'awake' );
  this.engineerCruiseGraphic.setFrame( World.snoozeEngineer ? 'sleep' : 'awake' );
  this.shieldsCruiseGraphic.setFrame( World.snoozeShields ? 'sleep' : 'awake' );
  this.skipperCruiseGraphic2.setVisible(World.snoozeSkipper);
  this.gunnerCruiseGraphic2.setVisible(World.snoozeGunner);
  this.engineerCruiseGraphic2.setVisible(World.snoozeEngineer);
  this.shieldsCruiseGraphic2.setVisible(World.snoozeShields);

  if (this.nextTurnReady) {
    this.doNextTurn();

    // push a new to the queue
    let nextTurn = this.ROTScheduler.next();
    let nextEntityCandidate = this.entities[nextTurn.indComponent.value];
    while (nextEntityCandidate === undefined) {
      nextTurn = this.ROTScheduler.next();
      nextEntityCandidate = this.entities[nextTurn.indComponent.value];
    }
    const nextEntity = [nextEntityCandidate];
    this.nextTurnQueue.push(nextEntity);
    this.updateTurnOrder();
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

    'return_cam': Phaser.Input.Keyboard.KeyCodes.SPACE,
    'hide_box': Phaser.Input.Keyboard.KeyCodes.SHIFT,

    'cruiseSkipper': Phaser.Input.Keyboard.KeyCodes.Z,
    'cruiseGunner': Phaser.Input.Keyboard.KeyCodes.X,
    'cruiseEngineer': Phaser.Input.Keyboard.KeyCodes.C,
    'cruiseShields': Phaser.Input.Keyboard.KeyCodes.V,
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
        color1: new THREE.Uniform(new THREE.Color(World.getCurrentSector().colorA)),
        color2: new THREE.Uniform(new THREE.Color(World.getCurrentSector().colorB)),
        color3: new THREE.Uniform(new THREE.Color(World.getCurrentSector().colorC)),
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

  this.explosions = [];
  this.currentExplosionIndex = 0;
  const explosionGeom = new THREE.SphereBufferGeometry( 1, 5, 4 );
  const explosionMats = [ new THREE.MeshBasicMaterial( {color: 0xFF0000} ), new THREE.MeshBasicMaterial( {color: 0xFFAA00} ) ]; 
  for (let i = 0; i < EXPLOSION_BUFFER_COUNT; i++) {
    const m = new THREE.Mesh(explosionGeom, explosionMats[i % explosionMats.length]);
    m.position.set(i, -99999999, 0);
    this.explosions.push(m);
    this.three.scene.add(m);
  }

  this.lasers = [];
  this.currentLaserIndex = 0;
  const laserMaterial = new THREE.LineBasicMaterial({ linewidth: 4, color: 0xCFCF00 });
  const laserPoints = [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1) ];
  const laserGeom = new THREE.BufferGeometry().setFromPoints( laserPoints );
  for (let i = 0; i < LASER_BUFFER_COUNT; i++) {
    const laser = new THREE.Line( laserGeom, laserMaterial );
    laser.visible = false;
    this.lasers.push(laser);
    this.three.scene.add(laser);
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

  if (!(this.lockRotating)) {
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

