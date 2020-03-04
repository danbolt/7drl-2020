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
    AddComponent(playerShip, 'DexterityComponent', new DexterityComponent(200 + (Math.random() * 50)));
    AddComponent(playerShip, 'MeshComponent', new MeshComponent());
    AddComponent(playerShip, 'AttackStrengthComponent', new AttackStrengthComponent(4));
    AddComponent(playerShip, 'AttackRangeComponent', new AttackRangeComponent(10));
    AddComponent(playerShip, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(playerShip, 'RequestGLTF3DAppearanceComponent', new RequestGLTF3DAppearanceComponent('player_ship'));
    AddComponent(playerShip, 'TeamComponent', new TeamComponent('Space Federation'));
    AddComponent(playerShip, 'NameComponent', new NameComponent('Arlo Mk. IV'));
    AddComponent(playerShip, 'ClassComponent', new NameComponent('Journeyer Class'));
    AddComponent(playerShip, 'SuppliesComponent', new SuppliesComponent(300, 300));
    entities.push(playerShip);

    // Add the skipper
    let skipper = NewEntity();
    AddComponent(skipper, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 1));
    AddComponent(skipper, 'SkipperComponent', new SkipperComponent());
    AddComponent(skipper, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(skipper, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(skipper, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(skipper, 'NameComponent', new NameComponent('bryce'));
    entities.push(skipper);

    // Add the gunner    
    let gunner = NewEntity();
    AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
    AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 2));
    AddComponent(gunner, 'DexterityComponent', new DexterityComponent(100));
    AddComponent(gunner, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(gunner, 'NameComponent', new NameComponent('jenny'));
    entities.push(gunner);

    // Add the engineer
    let engineer = NewEntity();
    AddComponent(engineer, 'EngineerComponent', new EngineerComponent());
    AddComponent(engineer, 'EngineComponent', new EngineComponent(3.3));
    AddComponent(engineer, 'DexterityComponent', new DexterityComponent(40));
    AddComponent(engineer, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 3));
    AddComponent(engineer, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(engineer, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(engineer, 'NameComponent', new NameComponent('bryce'));
    entities.push(engineer);

    // Add the shields operator
    let shieldOp = NewEntity();
    AddComponent(shieldOp, 'ShieldOperatorComponent', new ShieldOperatorComponent());
    AddComponent(shieldOp, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(shieldOp, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 4));
    AddComponent(shieldOp, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(shieldOp, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(shieldOp, 'NameComponent', new NameComponent('bryce'));
    entities.push(shieldOp);
};

const MeshNamesToLoad = [
  'player_ship',
  'gamilon_medium',
  'gamilon_small'
];

const FirstLoadScreen = function () {
  // body...
};
FirstLoadScreen.prototype.init = function() {
  //
};
FirstLoadScreen.prototype.preload = function() {
  this.load.image('preload', 'asset/image/preload.png');
};
FirstLoadScreen.prototype.create = function() {
  this.add.image(~~(GAME_WIDTH * 0.5), ~~(GAME_HEIGHT * 0.5), 'preload');
};

const PreloadScreen = function () {
  // body...
};
PreloadScreen.prototype.init = function() {
  //
};
PreloadScreen.prototype.preload = function() {
  MeshNamesToLoad.forEach((meshName) => {
    this.load.binary(meshName, 'asset/model/' + meshName + '.glb');
  });

  this.load.bitmapFont('miniset', 'asset/font/MiniSet.png', 'asset/font/MiniSet.fnt');

  this.load.glsl('planet_vertex', 'asset/shader/planet_vertex.glsl');
  this.load.glsl('planet_fragment', 'asset/shader/planet_fragment.glsl');

  this.load.spritesheet('bars', 'asset/image/bars.png', { frameWidth: 128, frameHeight: 8 });
  this.load.spritesheet('window_9slice', 'asset/image/window_9slice.png', { frameWidth: 16, frameHeight: 16 });
  this.load.spritesheet('portraits', 'asset/image/portraits.png', { frameWidth: 32, frameHeight: 32 });

  this.load.spritesheet(DEFAULT_IMAGE_MAP, 'asset/image/fromJesse.png', { frameWidth: 16, frameHeight: 16 });
};
PreloadScreen.prototype.create = function() {
  this.scene.stop('PreloadScreen', {});

  // Create the player entities for worldgen and allocation
  const playerEntities = [];
  populateWithPlayerEntities(playerEntities);
  const playerBasePoints = new DefaultPlayerPointsConfiguration();
  playerBasePoints.applyToShipEntity(playerEntities[0], playerEntities, true);

  this.scene.stop('FirstLoadScreen');
  this.scene.start('PointsSelectionScreen', {
    pointsToSpend: 8,
    existingConfig: playerBasePoints,
    playerEntities: playerEntities,
    shipIndex: 0,
    onComplete: (newConfigWithAllocatedPoints) => {
      // Combine the player-allocated points with the base points.
      const basePointsPlusExtra = CombineTwoPointsConfigurations(playerBasePoints, newConfigWithAllocatedPoints);
      basePointsPlusExtra.applyToShipEntity(playerEntities[0], playerEntities, true);

      // Generate a new campaign
      World = new GameWorld(5, 5, Math.random());
      ROT.RNG.setSeed(World.seed); // We have to set ROT's seed to ours to get deterministic markov names :/
      while (!(World.isGenerated())) {
        World.tickGenerate(playerEntities);
      }

      // Start gameplay in the current sector
      this.scene.start('Gameplay', World.getCurrentSector());
    }
  });

  // Add the shutdown event
  this.events.once('shutdown', this.shutdown, this);
};
PreloadScreen.prototype.shutdown = function() {
  //
};
