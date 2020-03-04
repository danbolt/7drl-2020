// TODO: move these out

const populateWithPlayerEntities = function (entities) {
    // Add the player ship
    let playerShip = NewEntity();
    AddComponent(playerShip, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(playerShip, 'HullHealthComponent', new HullHealthComponent(30 + (Math.random() * 20), 30));
    AddComponent(playerShip, 'ShieldsComponent', new HullHealthComponent(50 + (Math.random() * 20))); // Shields are "health" but not
    AddComponent(playerShip, 'PositionComponent', new PositionComponent(SECTOR_WIDTH - 15, SECTOR_HEIGHT - 15)); // TODO: make this a better start spot
    AddComponent(playerShip, 'ForwardVelocityComponent', new ForwardVelocityComponent(0.3 + (Math.random() * 3.2)));
    AddComponent(playerShip, 'RotationComponent', new RotationComponent((Math.PI) + (Math.PI * 0.25)));
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
    AddComponent(gunner, 'NameComponent', new NameComponent('bryce'));
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

const dummyEnemiesPopulate = function (entities) {
  for (let i = 0; i < 5; i++) {
    let e = NewEntity();
    AddComponent(e, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(e, 'HullHealthComponent', new HullHealthComponent(10));
    AddComponent(e, 'ShieldsComponent', new HullHealthComponent(50 + (Math.random() * 20))); // Shields are "health" but not
    AddComponent(e, 'PositionComponent', new PositionComponent(Math.random() * 30 - 15, Math.random() * 30 - 15));
    AddComponent(e, 'ForwardVelocityComponent', new ForwardVelocityComponent(0.3 + (Math.random() * 3.2)));
    AddComponent(e, 'RotationComponent', new RotationComponent(Math.random() * Math.PI * 2));
    AddComponent(e, 'DexterityComponent', new DexterityComponent(200 + (Math.random() * 50)));
    AddComponent(e, 'MeshComponent', new MeshComponent());
    AddComponent(e, 'AttackStrengthComponent', new AttackStrengthComponent(4));
    AddComponent(e, 'AttackRangeComponent', new AttackRangeComponent(10));
    AddComponent(e, 'AIControlComponent', new AIControlComponent());
    AddComponent(e, 'RequestDummy3DAppearanceComponent', new RequestDummy3DAppearanceComponent(0xFF3300));
    AddComponent(e, 'TeamComponent', new TeamComponent('G&T Empire'));
    AddComponent(e, 'NameComponent', new NameComponent('L. Dry Battleship'));
    entities.push(e);

    let skipper = NewEntity();
    AddComponent(skipper, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 1));
    AddComponent(skipper, 'SkipperComponent', new SkipperComponent());
    AddComponent(skipper, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(skipper, 'AIControlComponent', new AIControlComponent());
    AddComponent(skipper, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(skipper);

    let gunner = NewEntity();
    AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
    AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 2));
    AddComponent(gunner, 'DexterityComponent', new DexterityComponent(100));
    AddComponent(gunner, 'AIControlComponent', new AIControlComponent());
    AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(gunner);

    let engineer = NewEntity();
    AddComponent(engineer, 'EngineerComponent', new EngineerComponent());
    AddComponent(engineer, 'EngineComponent', new EngineComponent(3.3));
    AddComponent(engineer, 'DexterityComponent', new DexterityComponent(40));
    AddComponent(engineer, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 3));
    AddComponent(engineer, 'AIControlComponent', new AIControlComponent());
    AddComponent(engineer, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(engineer);

    let shieldOp = NewEntity();
    AddComponent(shieldOp, 'ShieldOperatorComponent', new ShieldOperatorComponent());
    AddComponent(shieldOp, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(shieldOp, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 4));
    AddComponent(shieldOp, 'AIControlComponent', new AIControlComponent());
    AddComponent(shieldOp, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(shieldOp);
  }
};

const MeshNamesToLoad = [
  'player_ship'
];


const PreloadScreen = function () {
  // body...
};
PreloadScreen.prototype.init = function(payload) {
  //
};
PreloadScreen.prototype.preload = function() {
  MeshNamesToLoad.forEach((meshName) => {
    this.load.binary(meshName, 'asset/model/' + meshName + '.glb');
  });

  this.load.bitmapFont('miniset', 'asset/font/MiniSet.png', 'asset/font/MiniSet.fnt');

  this.load.glsl('planet_vertex', 'asset/shader/planet_vertex.glsl');
  this.load.glsl('planet_fragment', 'asset/shader/planet_fragment.glsl');

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

  this.scene.start('PointsSelectionScreen', {
    pointsToSpend: 4,
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
