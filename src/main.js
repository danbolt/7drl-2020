
const populateWithPlayerEntities = function (entities) {
    // Add the player ship
    let playerShip = NewEntity();
    AddComponent(playerShip, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(playerShip, 'HullHealthComponent', new HullHealthComponent(30 + (Math.random() * 20), 30));
    AddComponent(playerShip, 'ShieldsComponent', new HullHealthComponent(50 + (Math.random() * 20))); // Shields are "health" but not
    AddComponent(playerShip, 'PositionComponent', new PositionComponent(SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.5)); // TODO: make this a better start spot
    AddComponent(playerShip, 'ForwardVelocityComponent', new ForwardVelocityComponent(0.3 + (Math.random() * 3.2)));
    AddComponent(playerShip, 'RotationComponent', new RotationComponent(Math.random() * Math.PI * 2));
    AddComponent(playerShip, 'DexterityComponent', new DexterityComponent(200 + (Math.random() * 50)));
    AddComponent(playerShip, 'MeshComponent', new MeshComponent());
    AddComponent(playerShip, 'AttackStrengthComponent', new AttackStrengthComponent(4));
    AddComponent(playerShip, 'AttackRangeComponent', new AttackRangeComponent(10));
    AddComponent(playerShip, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(playerShip, 'RequestDummy3DAppearanceComponent', new RequestDummy3DAppearanceComponent(0x0044FF));
    AddComponent(playerShip, 'TeamComponent', new TeamComponent('Space Federation'));
    AddComponent(playerShip, 'NameComponent', new NameComponent('Argo Mk. IV'));
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
    entities.push(skipper);

    // Add the gunner    
    let gunner = NewEntity();
    AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
    AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 2));
    AddComponent(gunner, 'DexterityComponent', new DexterityComponent(100));
    AddComponent(gunner, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(gunner);

    // Add the engineer
    let engineer = NewEntity();
    AddComponent(engineer, 'EngineerComponent', new EngineerComponent());
    AddComponent(engineer, 'EngineComponent', new EngineComponent(3.3));
    AddComponent(engineer, 'DexterityComponent', new DexterityComponent(40));
    AddComponent(engineer, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 3));
    AddComponent(engineer, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(engineer, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(engineer);

    // Add the shields operator
    let shieldOp = NewEntity();
    AddComponent(shieldOp, 'ShieldOperatorComponent', new ShieldOperatorComponent());
    AddComponent(shieldOp, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(shieldOp, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 4));
    AddComponent(shieldOp, 'PlayerControlComponent', new PlayerControlComponent());
    AddComponent(shieldOp, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
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

let main = function() {
    // Expose bulletml's builder DSL to the global namespace.
    bulletml.dsl();

    let game = new Phaser.Game({
                        width: GAME_WIDTH,
                        height: GAME_HEIGHT,
                        type : Phaser.WEBGL,
                        pixelArt: true,
                        antialias: true,
                        scaleMode: Phaser.Scale.ScaleModes.FIT,
                        autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                        roundPixels: true,
                        input: {
                            gamepad: true
                        },
                        physics: {
                            default: 'arcade',
                            arcade: {
                                gravity: { y: 0 },
                                debug: false
                            }
                        },
                     });
    game.scene.add('PointsSelectionScreen', PointsSelectionScreen, false);
    game.scene.add('Gameplay', Gameplay, false);

    // Create the player entities
    const playerEntities = [];
    populateWithPlayerEntities(playerEntities);
    const playerBasePoints = new DefaultPlayerPointsConfiguration();
    playerBasePoints.applyToShipEntity(playerEntities[0], playerEntities);


    // Generate a new campaign
    World = new GameWorld(5, 5, Math.random());
    while (!(World.isGenerated())) {
      World.tickGenerate(playerEntities);
    }

    // Start gameplay in the current sector
    game.scene.start('Gameplay', World.getCurrentSector());
};
