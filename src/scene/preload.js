// TODO: move these out

const populateWithPlayerEntities = function (entities) {
    // Add the player ship
    let playerShip = NewEntity();
    AddComponent(playerShip, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(playerShip, 'HullHealthComponent', new HullHealthComponent(30 + (Math.random() * 20), 30));
    AddComponent(playerShip, 'ShieldsComponent', new HullHealthComponent(50 + (Math.random() * 20))); // Shields are "health" but not
    AddComponent(playerShip, 'PositionComponent', new PositionComponent(15, 15)); 
    AddComponent(playerShip, 'ForwardVelocityComponent', new ForwardVelocityComponent(4.0));
    AddComponent(playerShip, 'RotationComponent', new RotationComponent(Math.PI * 0.25));
    AddComponent(playerShip, 'LerpRotationComponent', new LerpRotationComponent(GetComponent(playerShip, 'RotationComponent').value));
    AddComponent(playerShip, 'DexterityComponent', new DexterityComponent(200 + (Math.random() * 50)));
    AddComponent(playerShip, 'MeshComponent', new MeshComponent());
    AddComponent(playerShip, 'PortraitComponent', new NameComponent('algo'));
    AddComponent(playerShip, 'AttackStrengthComponent', new AttackStrengthComponent(4));
    AddComponent(playerShip, 'AttackRangeComponent', new AttackRangeComponent(10));
    AddComponent(playerShip, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(playerShip, 'RequestGLTF3DAppearanceComponent', new RequestGLTF3DAppearanceComponent('player_ship'));
    AddComponent(playerShip, 'TeamComponent', new TeamComponent('Space Federation'));
    AddComponent(playerShip, 'NameComponent', new NameComponent('Arlo Mk. IV'));
    AddComponent(playerShip, 'ClassComponent', new NameComponent('Journeyer Class'));
    AddComponent(playerShip, 'SuppliesComponent', new SuppliesComponent(100, 100));
    AddComponent(playerShip, 'AudioTensionComponent', new AudioTensionComponent(0));
    entities.push(playerShip);

    // Add the skipper
    let skipper = NewEntity();
    AddComponent(skipper, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 1));
    AddComponent(skipper, 'SkipperComponent', new SkipperComponent());
    AddComponent(skipper, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(skipper, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(skipper, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(skipper, 'NameComponent', new NameComponent('bryce'));
    AddComponent(skipper, 'PortraitComponent', new NameComponent('bryce'));
    entities.push(skipper);

    // Add the gunner    
    let gunner = NewEntity();
    AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
    AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 2));
    AddComponent(gunner, 'DexterityComponent', new DexterityComponent(100));
    AddComponent(gunner, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(gunner, 'NameComponent', new NameComponent('jenny'));
    AddComponent(gunner, 'PortraitComponent', new NameComponent('jenny'));
    entities.push(gunner);

    // Add the engineer
    let engineer = NewEntity();
    AddComponent(engineer, 'EngineerComponent', new EngineerComponent());
    AddComponent(engineer, 'EngineComponent', new EngineComponent(3.3));
    AddComponent(engineer, 'DexterityComponent', new DexterityComponent(40));
    AddComponent(engineer, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 3));
    AddComponent(engineer, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(engineer, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(engineer, 'NameComponent', new NameComponent('ella'));
    AddComponent(engineer, 'PortraitComponent', new NameComponent('ella'));
    entities.push(engineer);

    // Add the shields operator
    let shieldOp = NewEntity();
    AddComponent(shieldOp, 'ShieldOperatorComponent', new ShieldOperatorComponent());
    AddComponent(shieldOp, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(shieldOp, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 4));
    AddComponent(shieldOp, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(shieldOp, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(shieldOp, 'NameComponent', new NameComponent('paska'));
    AddComponent(shieldOp, 'PortraitComponent', new NameComponent('paska'));
    entities.push(shieldOp);

    if (HasComponent(playerShip, 'ShieldsComponent')) {
      let shieldMesh = NewEntity();
      AddComponent(shieldMesh, 'MeshComponent', new MeshComponent());
      AddComponent(shieldMesh, 'MeshPositionMatchComponent', new MeshPositionMatchComponent(entities.length - 5));
      AddComponent(shieldMesh, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
      AddComponent(shieldMesh, 'RequestShield3DAppearanceComponent', new RequestShield3DAppearanceComponent(3.0));
      AddComponent(shieldMesh, 'PlanetViewDataComponent', new PlanetViewDataComponent(0.0, 0.3435, 0x44111, 0x775500, 0xeeaa88)); // dummy planet data for that spin
      AddComponent(shieldMesh, 'VisibleIfShieldsUpComponent', new VisibleIfShieldsUpComponent(entities.length - 5));
      entities.push(shieldMesh);
    }
};

const PreloadScreen = function () {
  // body...
};
PreloadScreen.prototype.init = function() {
  //
};
PreloadScreen.prototype.preload = function() {
  BGMSounds.forEach((bgmName) => {
      this.load.audio(bgmName, ['asset/bgm/' + bgmName +'.mp3', 'asset/bgm/' + bgmName + '.wav']);
  });

  SFXSoundNames.forEach((sfxName) => {
    this.load.audio(sfxName, ['asset/sfx/' + sfxName + '.wav']);
  });

  MeshNamesToLoad.forEach((meshName) => {
    this.load.binary(meshName, 'asset/model/' + meshName + '.glb');
  });

  this.load.image('splash_bg', 'asset/image/splash_bg.png');

  this.load.bitmapFont('miniset', 'asset/font/MiniSet.png', 'asset/font/MiniSet.fnt');
  this.load.bitmapFont('century', 'asset/font/century_0.png', 'asset/font/century.fnt');

  this.load.glsl('planet_vertex', 'asset/shader/planet_vertex.glsl');
  this.load.glsl('planet_fragment', 'asset/shader/planet_fragment.glsl');

  this.load.atlas({
    key: 'cruise_lock_button',
    textureURL: 'asset/image/cruise_lock_button.png',
    atlasURL: 'asset/image/cruise_lock_button.json'
  });
  this.load.spritesheet('bars', 'asset/image/bars.png', { frameWidth: 128, frameHeight: 8 });
  this.load.spritesheet('window_9slice', 'asset/image/window_9slice.png', { frameWidth: 16, frameHeight: 16 });
  this.load.spritesheet('portraits', 'asset/image/portraits.png', { frameWidth: 32, frameHeight: 32 });

  this.load.spritesheet(DEFAULT_IMAGE_MAP, 'asset/image/fromJesse.png', { frameWidth: 16, frameHeight: 16 });
};
PreloadScreen.prototype.create = function() {
  this.scene.stop('FirstLoadScreen', {});

  BGMSounds.forEach((sound) => {
    const soundObject = this.sound.add(sound, { volume: MAX_VOLUME, loop: true });
    soundObject.play();
    BGMSingletons.push(soundObject);
  });

  for (let i = 0; i < SFXSoundNames.length; i++) {
    const soundName = SFXSoundNames[i];
    const sfxObject = this.sound.add(soundName, { volume: 0.15, loop: false });
    SFXSingletons[soundName] = sfxObject;
  }

  for (let i = 0; i < BGMSingletons.length; i++) {
    BGMSingletons[i].volume = 0;
  }

  this.scene.start('TitleScreen');

  // Add the shutdown event
  this.events.once('shutdown', this.shutdown, this);
};
PreloadScreen.prototype.shutdown = function() {
  //
};
