

const dummyEntityPopulate = function (entities) {
  for (let i = 0; i < 37; i++) {
    let e = NewEntity();
    AddComponent(e, 'ECSIndexComponent', new ECSIndexComponent(i));
    AddComponent(e, 'HullHealthComponent', new HullHealthComponent(30 + (Math.random() * 20), 30));
    AddComponent(e, 'ShieldsComponent', new HullHealthComponent(50 + (Math.random() * 20))); // Shields are "health" but not
    AddComponent(e, 'PositionComponent', new PositionComponent(Math.random() * 30 - 15, Math.random() * 30 - 15));
    AddComponent(e, 'ForwardVelocityComponent', new ForwardVelocityComponent(0.3 + (Math.random() * 3.2)));
    AddComponent(e, 'RotationComponent', new RotationComponent(Math.random() * Math.PI * 2));
    AddComponent(e, 'DexterityComponent', new DexterityComponent(200 + (Math.random() * 50)));
    AddComponent(e, 'MeshComponent', new MeshComponent());
    AddComponent(e, 'AttackStrengthComponent', new AttackStrengthComponent(4));
    AddComponent(e, 'AttackRangeComponent', new AttackRangeComponent(10));
    if (i === 0) {
      AddComponent(e, 'PlayerControlComponent', new PlayerControlComponent());
      AddComponent(e, 'RequestDummy3DAppearanceComponent', new RequestDummy3DAppearanceComponent(0x0044FF));
      AddComponent(e, 'TeamComponent', new TeamComponent('Space Federation'));
      AddComponent(e, 'NameComponent', new NameComponent('Argo Mk. IV'));
      AddComponent(e, 'SuppliesComponent', new SuppliesComponent(100, 50));
    } else {
      AddComponent(e, 'AIControlComponent', new AIControlComponent());
      AddComponent(e, 'RequestDummy3DAppearanceComponent', new RequestDummy3DAppearanceComponent(0xFF3300));
      AddComponent(e, 'TeamComponent', new TeamComponent('G&T Empire'));
      AddComponent(e, 'NameComponent', new NameComponent('L. Dry Battleship'));
    }
    entities.push(e);

    let skipper = NewEntity();
    AddComponent(skipper, 'ShipReferenceComponent', new ShipReferenceComponent(i));
    AddComponent(skipper, 'SkipperComponent', new SkipperComponent());
    AddComponent(skipper, 'DexterityComponent', new DexterityComponent(50));
    if (HasComponent(e, 'PlayerControlComponent')) {
      AddComponent(skipper, 'PlayerControlComponent', new PlayerControlComponent());
    } else {
      AddComponent(skipper, 'AIControlComponent', new AIControlComponent());
    }
    i++;
    AddComponent(skipper, 'ECSIndexComponent', new ECSIndexComponent(i));
    entities.push(skipper);

    let gunner = NewEntity();
    AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
    AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(i - 1));
    AddComponent(gunner, 'DexterityComponent', new DexterityComponent(100));
    if (HasComponent(e, 'PlayerControlComponent')) {
      AddComponent(gunner, 'PlayerControlComponent', new PlayerControlComponent());
    } else {
      AddComponent(gunner, 'AIControlComponent', new AIControlComponent());
    }
    i++;
    AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(i));
    entities.push(gunner);

    let engineer = NewEntity();
    AddComponent(engineer, 'EngineerComponent', new EngineerComponent());
    AddComponent(engineer, 'EngineComponent', new EngineComponent(3.3));
    AddComponent(engineer, 'DexterityComponent', new DexterityComponent(40));
    AddComponent(engineer, 'ShipReferenceComponent', new ShipReferenceComponent(i - 2));
    if (HasComponent(e, 'PlayerControlComponent')) {
      AddComponent(engineer, 'PlayerControlComponent', new PlayerControlComponent());
    } else {
      AddComponent(engineer, 'AIControlComponent', new AIControlComponent());
    }
    i++;
    AddComponent(engineer, 'ECSIndexComponent', new ECSIndexComponent(i));
    entities.push(engineer);

    let shieldOp = NewEntity();
    AddComponent(shieldOp, 'ShieldOperatorComponent', new ShieldOperatorComponent());
    AddComponent(shieldOp, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(shieldOp, 'ShipReferenceComponent', new ShipReferenceComponent(i - 3));
    if (HasComponent(e, 'PlayerControlComponent')) {
      AddComponent(shieldOp, 'PlayerControlComponent', new PlayerControlComponent());
    } else {
      AddComponent(shieldOp, 'AIControlComponent', new AIControlComponent());
    }
    i++;
    AddComponent(shieldOp, 'ECSIndexComponent', new ECSIndexComponent(i));
    entities.push(shieldOp);
  }

  let testPlanet = NewEntity();
  AddComponent(testPlanet, 'PositionComponent', new PositionComponent(0, 3));
  AddComponent(testPlanet, 'PlanetViewDataComponent', new PlanetViewDataComponent(3, 0.3435, 0x1010aa, 0x104499, 0x007710));
  AddComponent(testPlanet, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(4.6));
  AddComponent(testPlanet, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(30))
  AddComponent(testPlanet, 'MeshComponent', new MeshComponent());
  AddComponent(testPlanet, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
  AddComponent(testPlanet, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
  AddComponent(testPlanet, 'NameComponent', new NameComponent('Terra'));
  AddComponent(testPlanet, 'TeamComponent', new TeamComponent('Space Federation'));
  entities.push(testPlanet);

  let p2 = NewEntity();
  AddComponent(p2, 'PositionComponent', new PositionComponent(8, 7));
  AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(1.3, 0.3435, 0x44111, 0x775500, 0xeeaa88));
  AddComponent(p2, 'MeshComponent', new MeshComponent());
  AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
  AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
  AddComponent(p2, 'NameComponent', new NameComponent('Darius II'));
  entities.push(p2);
};


let main = function() {
    // Expose bulletml's builder DSL to the global namespace.
    bulletml.dsl();

    let game = new Phaser.Game({
                        width: GAME_WIDTH,
                        height: GAME_HEIGHT,
                        type : Phaser.WEBGL,
                        pixelArt: true,
                        antialias: false,
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
    game.scene.add('Gameplay', Gameplay, false);

    const payload = {
        entities: []
    };

    // TODO: remove me later and add real ship placement (dummy setup)
    dummyEntityPopulate(payload.entities);

    game.scene.start('Gameplay', payload);
};
