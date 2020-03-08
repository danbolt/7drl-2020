const generateEnemy = function (entities, rng, names, x, y, config, portraitToPick, faction, namePrefix, className, modelName, audioTension, mass, shields, message, messageSound, rndBounty) {
  let e = NewEntity();

  AddComponent(e, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
  AddComponent(e, 'HullHealthComponent', new HullHealthComponent(1));
  AddComponent(e, 'PositionComponent', new PositionComponent(x, y));
  AddComponent(e, 'ForwardVelocityComponent', new ForwardVelocityComponent(1.0));
  AddComponent(e, 'RotationComponent', new RotationComponent(Math.random() * Math.PI * 2));
  AddComponent(e, 'LerpRotationComponent', new LerpRotationComponent(GetComponent(e, 'RotationComponent').value));
  AddComponent(e, 'DexterityComponent', new DexterityComponent(4));
  AddComponent(e, 'MeshComponent', new MeshComponent());
  AddComponent(e, 'PortraitComponent', new NameComponent(portraitToPick));
  AddComponent(e, 'AttackStrengthComponent', new AttackStrengthComponent(4));
  AddComponent(e, 'AttackRangeComponent', new AttackRangeComponent(30));
  AddComponent(e, 'AIControlComponent', new AIControlComponent());
  AddComponent(e, 'RequestGLTF3DAppearanceComponent', new RequestGLTF3DAppearanceComponent(modelName));
  AddComponent(e, 'TeamComponent', new TeamComponent(faction));
  AddComponent(e, 'NameComponent', new NameComponent(namePrefix + ' ' + names.generate()));
  AddComponent(e, 'ClassComponent', new NameComponent(className));
  AddComponent(e, 'MassComponent', new MassComponent(mass));
  AddComponent(e, 'AudioTensionComponent', new AudioTensionComponent(audioTension));
  entities.push(e);

  if (message !== undefined) {
    AddComponent(e, 'MessageOnceInAttackRangeComponent', new MessageOnceInAttackRangeComponent(message, messageSound));
  }

  if (shields !== undefined) {
    AddComponent(e, 'ShieldsComponent', new HullHealthComponent(1)); 
  }

  if (rndBounty !== undefined) {
    AddComponent(e, 'RNDBountyComponent', new RNDBountyComponent(rndBounty));
  }

  let skipper = NewEntity();
  AddComponent(skipper, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 1));
  AddComponent(skipper, 'SkipperComponent', new SkipperComponent());
  AddComponent(skipper, 'DexterityComponent', new DexterityComponent(2));
  AddComponent(skipper, 'AIControlComponent', new AIControlComponent());
  AddComponent(skipper, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
  AddComponent(skipper, 'PortraitComponent', new NameComponent(portraitToPick));
  entities.push(skipper);

  let gunner = NewEntity();
  AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
  AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 2));
  AddComponent(gunner, 'DexterityComponent', new DexterityComponent(2));
  AddComponent(gunner, 'AIControlComponent', new AIControlComponent());
  AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
  AddComponent(gunner, 'PortraitComponent', new NameComponent(portraitToPick));
  entities.push(gunner);

  let engineer = NewEntity();
  AddComponent(engineer, 'EngineerComponent', new EngineerComponent());
  AddComponent(engineer, 'EngineComponent', new EngineComponent(3.3));
  AddComponent(engineer, 'DexterityComponent', new DexterityComponent(2));
  AddComponent(engineer, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 3));
  AddComponent(engineer, 'AIControlComponent', new AIControlComponent());
  AddComponent(engineer, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
  AddComponent(engineer, 'PortraitComponent', new NameComponent(portraitToPick));
  entities.push(engineer);


  if (shields !== undefined) {

    let shieldOp = NewEntity();
    AddComponent(shieldOp, 'ShieldOperatorComponent', new ShieldOperatorComponent());
    AddComponent(shieldOp, 'DexterityComponent', new DexterityComponent(50));
    AddComponent(shieldOp, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 4));
    AddComponent(shieldOp, 'AIControlComponent', new AIControlComponent());
    AddComponent(shieldOp, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(shieldOp, 'NameComponent', new NameComponent(portraitToPick));
    AddComponent(shieldOp, 'PortraitComponent', new NameComponent(portraitToPick));
    entities.push(shieldOp);

    let shieldMesh = NewEntity();
    AddComponent(shieldMesh, 'MeshComponent', new MeshComponent());
    AddComponent(shieldMesh, 'MeshPositionMatchComponent', new MeshPositionMatchComponent(entities.length - 5));
    AddComponent(shieldMesh, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(shieldMesh, 'RequestShield3DAppearanceComponent', new RequestShield3DAppearanceComponent(mass * 2));
    AddComponent(shieldMesh, 'PlanetViewDataComponent', new PlanetViewDataComponent(0.0, 0.3435, 0x44111, 0x775500, 0xeeaa88)); // dummy planet data for that spin
    AddComponent(shieldMesh, 'VisibleIfShieldsUpComponent', new VisibleIfShieldsUpComponent(entities.length - 5));
    entities.push(shieldMesh);
  }

  config.applyToShipEntity(e, entities, true);

  return [e, skipper, gunner, engineer];
};


const generatePopcornEnemy = function (entities, rng, names, x, y, message, messageSound, rndBounty) {
  const portraitToPick = 'gamilon2';

  const result = generateEnemy(entities, rng, names, x, y, new PopcornEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, POPCORN_NAME_PREFIX, POPCORN_CLASS_NAME, 'gamilon_popcorn', 1, 1.05, false, message, messageSound, rndBounty);
  AddComponent(result[0], 'PursueIfInRangeComponent', new PursueIfInRangeComponent(9999));

  return result;
};

const generateWeakEnemy = function (entities, rng, names, x, y, message, messageSound, rndBounty) {
  const portraitToPick = (rng.getUniform() < 0.5) ? 'gamilon3' : 'gamilon2';

  const result = generateEnemy(entities, rng, names, x, y, new WeakEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, WEAK_NAME_PREFIX, WEAK_CLASS_NAME, 'gamilon_small', 1, 1.65, false, message, messageSound, rndBounty);
  AddComponent(result[0], 'PursueIfAttackedComponent', new PursueIfAttackedComponent());

  return result;
};

const generateBattleshipEnemy = function (entities, rng, names, x, y, message, messageSound, rndBounty) {
  const portraitToPick = 'gamilon3';

  const result = generateEnemy(entities, rng, names, x, y, new BattleshipEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, BATTLESHIP_NAME_PREFIX, BATTLESHIP_CLASS_NAME, 'gamilon_medium', 2, 2.3, false, message, messageSound, rndBounty);
  AddComponent(result[0], 'PursueIfInRangeComponent', new PursueIfInRangeComponent(SECTOR_WIDTH * 0.65));

  return result;
};

const generateAltBattleshipEnemy = function (entities, rng, names, x, y, message, messageSound, rndBounty) {
  const portraitToPick = 'gamilon2';

  const result = generateEnemy(entities, rng, names, x, y, new AltBattleshipEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, BATTLESHIP_ALT_NAME_PREFIX, BATTLESHIP_ALT_CLASS_NAME, 'gamilon_medium2', 2, 2, true, message, messageSound, rndBounty);
  AddComponent(result[0], 'PursueIfInRangeComponent', new PursueIfInRangeComponent(SECTOR_WIDTH * 0.65));

  return result;
};

const generateDreadnoughtEnemy = function (entities, rng, names, x, y, message, messageSound, rndBounty) {
  const portraitToPick = 'gamilon1';

  const result = generateEnemy(entities, rng, names, x, y, new DreadnoughtEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, DREADNOUGHT_NAME_PREFIX, DREADNOUGHT_CLASS_NAME, 'gamilon_large', 3, 3.4, true);
  AddComponent(result[0], 'OnlyAttackIfPursuingComponent', new OnlyAttackIfPursuingComponent());
  AddComponent(result[0], 'PursueIfAttackedComponent', new PursueIfAttackedComponent());
  return result;
};

const generateDroneEnemy = function (entities, rng, names, x, y, message, messageSound, rndBounty) {
  const portraitToPick = 'gamilon_mini';

  const result = generateEnemy(entities, rng, names, x, y, new DroneEnemyPointsConfiguration(), portraitToPick, 'Lost ' + ENEMY_PEOPLE_NAME + ' Machines', DRONE_NAME_PREFIX, DRONE_CLASS_NAME, 'gamilon_mini', 1, 0.5, false, message, messageSound, rndBounty);
  AddComponent(result[0], 'PursueIfInRangeComponent', new PursueIfInRangeComponent(9999));

  return result;
};

const generateOldGodEnemy = function (entities, rng, names, x, y, message, messageSound, rndBounty) {
  const result =  generateEnemy(entities, rng, names, x, y, new OldGodEnemyPointsConfiguration(), 'old_god', '???', '', 'Ancient God of Flame', 'old_god', 4, 10.1, false, 'Mortals! You have disgraced this scared place!\nLeave now!', 'gamilon_talk0', 10);
  AddComponent(result[0], 'PursueIfInRangeComponent', new PursueIfInRangeComponent(99999));

  return result;
};

const GameWorld = function (width, height, seed) {
  this.seed = seed ? seed : Math.random();

  this.width = width ? width : DEFAULT_WORLD_SIZE_IN_SECTORS;
  this.height = height ? height : DEFAULT_WORLD_SIZE_IN_SECTORS;

  // Get an RNG and set it with our seed
  this.rng = ROT.RNG.clone();
  this.rng.setSeed(this.seed);

  this.nameGenerator = new ROT.StringGenerator();
  this.placeNameGenerate = new ROT.StringGenerator();
  for (let i = 0; i < MiddleNames.length; i++) {
    this.nameGenerator.observe(MiddleNames[i]);
  }
  for (let i = 0; i< PlanetNames.length; i++) {
    this.placeNameGenerate.observe(PlanetNames[i]);
  }

  this.sectors = [];
  for (let x = 0; x < this.width; x++) {
    this.sectors.push([]);
    for (let y = 0; y < this.height; y++) {
      const newSector = {
        name: 'Sector ' + (x+1) + '-' + (y+1),
        entities: [],
        x: x,
        y: y
      };

      this.sectors[x].push(newSector);
    }
  }
  this.generationIndex = { x: 0, y: 0 };

  this.snoozeSkipper = false;
  this.snoozeGunner = false;
  this.snoozeEngineer = false;
  this.snoozeShields = false;

  this.currentPlayerSector = { x: 0, y: 0 };
  this.iscandarSector = { x: (this.width - 1), y: (this.height - 1) };
};
GameWorld.prototype.isGenerated = function() {
  return (this.generationIndex.x === 0) && (this.generationIndex.y === (this.height));
};

GameWorld.prototype.generateSupplyPlanetEntitiesForSector = function(sector, rng, min) {
  const numberOfPlanetsToGenerate = Math.max(~~(rng.getNormal(3, 4)), min);
  const meanSuppliesPerPlanet = Math.max(rng.getNormal(40, 30), 30);

  for (let i = 0; i < numberOfPlanetsToGenerate; i++) {
    const planetRadius = Math.max(2.0, rng.getNormal(4.0, 2.1));
    const generatedX = Math.min(SECTOR_WIDTH - 10, (Math.max(0, rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.4))));
    const generatedY = Math.min(SECTOR_HEIGHT - 10, (Math.max(0, rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.4))));

    if (rng.getUniform() < 0.15) {
      let p2 = NewEntity();
      AddComponent(p2, 'PositionComponent', new PositionComponent(generatedX, generatedY));
      AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(planetRadius - 1.9, 0.3435, 0x0000e2, lerpColor(0x64AA64, 0xaa33aa, rng.getUniform()), 0x666666));
      AddComponent(p2, 'MeshComponent', new MeshComponent());
      AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
      AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(sector.entities.length));
      AddComponent(p2, 'NameComponent', new NameComponent(this.placeNameGenerate.generate()));
      AddComponent(p2, 'ClassComponent', new NameComponent('City Planet'));
      AddComponent(p2, 'TeamComponent', new TeamComponent('Space Federation'));
      AddComponent(p2, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(planetRadius + 7.0));
      AddComponent(p2, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(50));
      sector.entities.push(p2);
    } else {
      let p2 = NewEntity();
      AddComponent(p2, 'PositionComponent', new PositionComponent(generatedX, generatedY));
      AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(planetRadius, 0.3435, 0x6666FF, lerpColor(0x64AA64, 0x22FF22, rng.getNormal(0.5, 0.5)), 0x0000CC));
      AddComponent(p2, 'MeshComponent', new MeshComponent());
      AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
      AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(sector.entities.length));
      AddComponent(p2, 'NameComponent', new NameComponent(this.placeNameGenerate.generate()));
      AddComponent(p2, 'ClassComponent', new NameComponent('Forest Planet'));
      AddComponent(p2, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(planetRadius + 8.4));
      AddComponent(p2, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(30));
      sector.entities.push(p2);
    }
  }
};

const StartingSectorColor = {
  colorA: 0x002244,
  colorB: 0x112233,
  colorC: 0x001133, 
}

const IscandarSectorColor = {
  colorA: 0x043444,
  colorB: 0x11554A,
  colorC: 0x221166,
}

const SoutheastSectorColor = {
  colorA: 0x307200,
  colorB: 0x113321,
  colorC: 0x2C3711, 
}

const NorthwestSectorColor = {
  colorA: 0x134444,
  colorB: 0x112121,
  colorC: 0x001111, 
}

const OldGodSectorColor = {
  colorA: 0x441111,
  colorB: 0x342211,
  colorC: 0x331102, 
}

const GamilonHomeworldSectorColor = {
  colorA: 0x110000,
  colorB: 0x222222,
  colorC: 0x440000, 
}

// This must be called multiple times until isGenerated returns true
GameWorld.prototype.tickGenerate = function (playerEntities) {
  if (this.isGenerated()) {
    throw new Error('Tried to generate more world but we\'re done. Check with `isGenerated` before calling this.')
  }

  const newSector = this.sectors[this.generationIndex.x][this.generationIndex.y];
  if (newSector.entities.length > 0) {
    throw new Error('Sector already had entities in it. This is likely a programmer error.');
  }
  // Always have the player entities be the first in the listing for the sector
  for (let i = 0; i < playerEntities.length; i++) {
    newSector.entities.push(playerEntities[i]);
  }

  if (newSector.x === (this.width - 1) && (newSector.y === 0)) {
    // ignore naming hell; it's fine
  } else if ((newSector.x === this.iscandarSector.x) && (newSector.y === this.iscandarSector.y)) {
    newSector.name = 'Nayr Principality';
  } else if ((newSector.x < 2) && (newSector.y > 2)) {
    newSector.name = newSector.name + ': Rogue autonomous machine space'
  } else {
    newSector.name = newSector.name + ': ' + this.placeNameGenerate.generate();
  }

  if (newSector.x === (this.width - 1) && (newSector.y === 0)) {
    newSector.colorA = OldGodSectorColor.colorA;
    newSector.colorB = OldGodSectorColor.colorB;
    newSector.colorC = OldGodSectorColor.colorC;

    newSector.name = 'Jathul';
  } else {
    const w = (this.width - 1);
    const h = (this.height - 1);

    const xInterp = newSector.x / w; // Subtract 1 to cover the entire space
    const yInterp = newSector.y / h;
    
    const lerpXTopA = lerpColor(StartingSectorColor.colorA, NorthwestSectorColor.colorA, xInterp);
    const lerpXBottomA = lerpColor(SoutheastSectorColor.colorA, IscandarSectorColor.colorA, xInterp);
    newSector.colorA = lerpColor(lerpXTopA, lerpXBottomA, yInterp);

    const lerpXTopB = lerpColor(StartingSectorColor.colorB, NorthwestSectorColor.colorB, xInterp);
    const lerpXBottomB = lerpColor(SoutheastSectorColor.colorB, IscandarSectorColor.colorB, xInterp);
    newSector.colorB = lerpColor(lerpXTopB, lerpXBottomB, yInterp);

    const lerpXTopC = lerpColor(StartingSectorColor.colorC, NorthwestSectorColor.colorC, xInterp);
    const lerpXBottomC = lerpColor(SoutheastSectorColor.colorC, IscandarSectorColor.colorC, xInterp);
    newSector.colorC = lerpColor(lerpXTopC, lerpXBottomC, yInterp);
  }

  // Generate enemy types based on taxicab distance
  const tileDistanceFromStart = Math.abs(this.currentPlayerSector.x - newSector.x) + Math.abs(this.currentPlayerSector.y - newSector.y);

  // Switch-check for various sectors
  if ((newSector.x === this.currentPlayerSector.x) && (newSector.y === this.currentPlayerSector.y)) {
    
    // If we're at earth, don't generate any enemies

    const earth = NewEntity();
    AddComponent(earth, 'PositionComponent', new PositionComponent(10, 10));
    AddComponent(earth, 'PlanetViewDataComponent', new PlanetViewDataComponent(3, 0.3435, 0x1010aa, 0x104499, 0x007710));
    AddComponent(earth, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(8.0));
    AddComponent(earth, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(30));
    AddComponent(earth, 'MeshComponent', new MeshComponent());
    AddComponent(earth, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
    AddComponent(earth, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
    AddComponent(earth, 'NameComponent', new NameComponent('St. Terra'));
    AddComponent(earth, 'ClassComponent', new NameComponent('Homeworld'));
    AddComponent(earth, 'TeamComponent', new TeamComponent('Space Federation'));
    newSector.entities.push(earth);


    // asteroid belt for looks
    for (let i = 0; i < 32; i++) {
      if (i >= 14 && i <= 20) {
        continue;
      }
      const r = this.rng.getNormal(Math.sqrt((SECTOR_WIDTH * SECTOR_WIDTH) + (SECTOR_HEIGHT * SECTOR_HEIGHT)) * 0.5, 25);

      const planetRadius = this.rng.getNormal(1.2, 0.4);
      const generatedX = r * Math.cos(i / 16 * Math.PI * 0.25);
      const generatedY = r * Math.sin(i / 16 * Math.PI * 0.25);

      let p2 = NewEntity();
      AddComponent(p2, 'PositionComponent', new PositionComponent(generatedX, generatedY));
      AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(planetRadius, 0.3435, 0x44111, 0x775500, 0xeeaa88));
      AddComponent(p2, 'MeshComponent', new MeshComponent());
      AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
      AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
      AddComponent(p2, 'ClassComponent', new NameComponent('Asteroid'));
      newSector.entities.push(p2);
    }
  } else if ((newSector.x === this.iscandarSector.x) && (newSector.y === this.iscandarSector.y)) {
    
    // If we're at iscandar, don't generate any enemies

    const nayr = NewEntity();
    AddComponent(nayr, 'PositionComponent', new PositionComponent(100, 100));
    AddComponent(nayr, 'PlanetViewDataComponent', new PlanetViewDataComponent(5.4, 0.987, 0x102099, 0x109999, 0xaacccc));
    AddComponent(nayr, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(12.0));
    AddComponent(nayr, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(30));
    AddComponent(nayr, 'MeshComponent', new MeshComponent());
    AddComponent(nayr, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
    AddComponent(nayr, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
    AddComponent(nayr, 'NameComponent', new NameComponent('Nayr'));
    AddComponent(nayr, 'ClassComponent', new NameComponent('Sacred Planet'));
    AddComponent(nayr, 'TeamComponent', new TeamComponent('Space Federation'));
    AddComponent(nayr, 'PlanetGoalComponent', new PlanetGoalComponent());
    newSector.entities.push(nayr);

    for (let i = 0; i < 32; i++) {
      if (i >= 14 && i <= 20) {
        continue;
      }
      const r = this.rng.getNormal(30, 20);

      const planetRadius = this.rng.getNormal(1.2, 0.4);
      const generatedX = r * Math.cos(i / 16 * Math.PI * 2) + 100;
      const generatedY = r * Math.sin(i / 16 * Math.PI * 2) + 100;

      let p2 = NewEntity();
      AddComponent(p2, 'PositionComponent', new PositionComponent(generatedX, generatedY));
      AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(planetRadius, 0.3435, 0x44111, 0x775500, 0xeeaa88));
      AddComponent(p2, 'MeshComponent', new MeshComponent());
      AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
      AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
      AddComponent(p2, 'ClassComponent', new NameComponent('Asteroid'));
      newSector.entities.push(p2);
    }
  } else if ((newSector.x === (this.width - 1)) && (newSector.y === 0)) {
    
    // If we're in the far northeast, generate the old god

    const names = ['Einhader', 'Ignis', 'Lutha', 'Yarrow', 'Ren', 'Zeal'];
    for (let i = 0; i < 6; i++) {
      const refuge = NewEntity();
      AddComponent(refuge, 'PositionComponent', new PositionComponent(SECTOR_WIDTH * 0.5 + ( 60 * Math.cos((i / 6) * Math.PI * 2)), SECTOR_HEIGHT * 0.5 + ( 60 * Math.sin((i / 6) * Math.PI * 2))));
      AddComponent(refuge, 'PlanetViewDataComponent', new PlanetViewDataComponent(5.4, 0.987, lerpColor(0xAA0000, 0x444444, (i / 6)), lerpColor(0x444444, 0x000000, (i / 6)), lerpColor(0x373737, 0x111111, (i / 6))));
      AddComponent(refuge, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(12.0));
      AddComponent(refuge, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(90));
      AddComponent(refuge, 'MeshComponent', new MeshComponent());
      AddComponent(refuge, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
      AddComponent(refuge, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
      AddComponent(refuge, 'NameComponent', new NameComponent(names[i]));
      AddComponent(refuge, 'ClassComponent', new NameComponent('Ancient World'));
      newSector.entities.push(refuge);
    }
    generateOldGodEnemy(newSector.entities, this.rng, this.nameGenerator, SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.5);

  } else if ((newSector.x < 2) && (newSector.y > 2)) {
    
    // If we're in the southwest, generate the drones

    for (let i = 0; i < 10; i++) {
      const bounty = ((this.rng.getUniform() < 0.5) ? 1 : undefined);
      const message = i === 0 ? ('WARNING WARNING NO REFUGE\nDESIST OR BE DESTROYED') : undefined;
      const messageSound = i === 0 ? 'gamilon_talk2' : undefined;
      const posX = this.rng.getNormal(SECTOR_WIDTH * 0.55, SECTOR_WIDTH * 0.3);
      const posY = this.rng.getNormal(SECTOR_HEIGHT * 0.55, SECTOR_HEIGHT * 0.4);
      generateDroneEnemy(newSector.entities, this.rng, this.placeNameGenerate, posX, posY, message, messageSound, bounty);
    }
    // If we're "deep", then add an extra drone
    if (tileDistanceFromStart > 3) {
      generateDroneEnemy(newSector.entities, this.rng, this.placeNameGenerate, SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.5);
    }

    this.generateSupplyPlanetEntitiesForSector(newSector, this.rng, ~~((this.rng.getUniform() * 3) + 3));

    // TODO: if we have time, generate "the machine core" that destroys all ingame drones if destroyed
  } else {
    this.generateSupplyPlanetEntitiesForSector(newSector, this.rng, 3);

    // add some cosmetic asteroids
    const asteroidCount = ~~(this.rng.getUniform() * tileDistanceFromStart);
    for (let i = 0; i < asteroidCount; i++) {
      const planetRadius = this.rng.getNormal(1.03, 0.51423);
      const generatedX = this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.5);
      const generatedY = this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.5);

      let p2 = NewEntity();
      AddComponent(p2, 'PositionComponent', new PositionComponent(generatedX, generatedY));
      AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(planetRadius, 0.3435, 0x44111, lerpColor(0x664344, 0x77777F, this.rng.getUniform()), 0xeeaa88));
      AddComponent(p2, 'MeshComponent', new MeshComponent());
      AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
      AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
      AddComponent(p2, 'ClassComponent', new NameComponent('Asteroid'));
      newSector.entities.push(p2);
    }

    // if none of the other situations hold true, then generate normal enemies
    if (tileDistanceFromStart <= 2) {
      

      // If we're pretty close to the start, then generating simple enemies is best
      for (let i = 0; i < ((tileDistanceFromStart <= 1) ? 7 : 10); i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        generatePopcornEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY);
      }
      if (tileDistanceFromStart <= 1) {
        generatePopcornEnemy(newSector.entities, this.rng, this.nameGenerator, SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.20, 'Halt! All transit is forbidden!', 'gamilon_talk3');
        generatePopcornEnemy(newSector.entities, this.rng, this.nameGenerator, SECTOR_WIDTH * 0.20, SECTOR_HEIGHT * 0.2, 'Intruder! Intruder alert!', 'gamilon_talk3');
      }

      // TODO: planets for easy sectors
    } else if (tileDistanceFromStart <= 3) {
      

      // The next difficulty spike is learning to raise shields; the "weak" enemy has a strong attack
      for (let i = 0; i < 9; i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        if (this.rng.getUniform() < 0.33) {
          generateWeakEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY, undefined, undefined, ~~(this.rng.getUniform() * 2 + 1));
        }
      }
      generateWeakEnemy(newSector.entities, this.rng, this.nameGenerator, SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.32, 'Continue further and be destroyed!', 'gamilon_talk3', 1);

      for (let i = 0; i < 5; i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        generatePopcornEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY);
      }

      // TODO: planets for weak sectors
    } else if (tileDistanceFromStart <= 4) {
      

      // Battleships are kind of just there. They exist to provide an interesting challenge
      // be sure to add planets (free content and difficulty balancing!)
      for (let i = 0; i < 7; i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));
        generateBattleshipEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY, undefined, undefined, 2);
      }
      for (let i = 0; i < ~~(this.rng.getUniform() * 4 + 3); i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        generateWeakEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY);
      }
      generateBattleshipEnemy(newSector.entities, this.rng, this.nameGenerator, SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.32, 'For the empire!!', 'gamilon_talk1', 3);
      for (let i = 0; i < 4; i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        generatePopcornEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY);
      }

      // TODO: planets for weak sectors
    } else if (tileDistanceFromStart <= 6) {
      

      for (let i = 0; i < 8 + ~~(this.rng.getUniform() * 2); i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        if (this.rng.getUniform() < 0.4) {
          generateBattleshipEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY, undefined, undefined, 2);
        } else {
          generateAltBattleshipEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY, undefined, undefined, 2);
        }
      }
      generatePopcornEnemy(newSector.entities, this.rng, this.nameGenerator, 40, 40, 'gahhh! please don\'t kill me!', 'gamilon_talk2');
      for (let i = 0; i < 5; i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        generateWeakEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY, undefined, undefined);
      }
    } else if (tileDistanceFromStart <= 7) {
      

      // Dreadnoughts represent the strongest(?) enemy. There aren't many and they're a force to be reckoned with
      // We place dreadnoughts in odd places
      if (newSector.x === (this.width - 1)) {
        generateDreadnoughtEnemy(newSector.entities, this.rng, this.placeNameGenerate, SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.25, undefined, undefined, 1);
      } else if (newSector.y === (this.height - 1)) {
        generateDreadnoughtEnemy(newSector.entities, this.rng, this.placeNameGenerate, SECTOR_WIDTH * 0.25, SECTOR_HEIGHT * 0.5, undefined, undefined, 1);
      }

      for (let i = 0; i < 5; i++) {
        const posX = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.3)));
        const posY = Math.max(10, Math.min(SECTOR_WIDTH - 10, this.rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.3)));

        if (this.rng.getUniform() < 0.4563) {
          generateBattleshipEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY, undefined, undefined, 1);
        } else {
          generateAltBattleshipEnemy(newSector.entities, this.rng, this.nameGenerator, posX, posY, undefined, undefined, 1);
        }
      }
      generateWeakEnemy(newSector.entities, this.rng, this.nameGenerator, SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.5);
    }
  }

  // Generate the gamilon homeworld if we're near iscandar
  if ((newSector.x === (this.iscandarSector.x - 1)) && (newSector.y === (this.iscandarSector.y - 1)) ) {
    const gamHomeworld = NewEntity();
    AddComponent(gamHomeworld, 'PositionComponent', new PositionComponent(SECTOR_WIDTH - 10, SECTOR_HEIGHT - 10));
    AddComponent(gamHomeworld, 'PlanetViewDataComponent', new PlanetViewDataComponent(5, 0.3435, 0x110011, 0x871F00, 0x553D00));
    AddComponent(gamHomeworld, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(8.0));
    AddComponent(gamHomeworld, 'MeshComponent', new MeshComponent());
    AddComponent(gamHomeworld, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
    AddComponent(gamHomeworld, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
    AddComponent(gamHomeworld, 'NameComponent', new NameComponent('Lohrahgus'));
    AddComponent(gamHomeworld, 'ClassComponent', new NameComponent(ENEMY_PEOPLE_NAME + ' Homeworld'));
    AddComponent(gamHomeworld, 'TeamComponent', new TeamComponent(ENEMY_FACTION_NAME));
    newSector.entities.push(gamHomeworld);

    newSector.colorA = GamilonHomeworldSectorColor.colorA;
    newSector.colorB = GamilonHomeworldSectorColor.colorB;
    newSector.colorC = GamilonHomeworldSectorColor.colorC;

    generateDreadnoughtEnemy(newSector.entities, this.rng, this.placeNameGenerate, SECTOR_WIDTH - 18, SECTOR_HEIGHT - 50, undefined, undefined, 3);
    generateDreadnoughtEnemy(newSector.entities, this.rng, this.placeNameGenerate, SECTOR_WIDTH - 50, SECTOR_HEIGHT - 18, undefined, undefined, 3);
    generateDreadnoughtEnemy(newSector.entities, this.rng, this.placeNameGenerate, SECTOR_WIDTH - 18, SECTOR_HEIGHT - 18, 'Federation scum!\nYou won\'t go any further!', 'gamilon_talk0', 8);

    for (let i = 0; i < 10; i++) {
      const planetRadius = this.rng.getNormal(3.4, 1.0);
      const generatedX = SECTOR_WIDTH - ((SECTOR_WIDTH * this.rng.getNormal(0.7, 0.3)) * Math.cos(i / 10 * Math.PI * 0.4 + (Math.PI * 0.05)));
      const generatedY = SECTOR_HEIGHT - ((SECTOR_HEIGHT * this.rng.getNormal(0.7, 0.3)) * Math.sin(i / 10 * Math.PI * 0.4 + (Math.PI * 0.05)));

      let p2 = NewEntity();
      AddComponent(p2, 'PositionComponent', new PositionComponent(generatedX, generatedY));
      AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(planetRadius, 0.3435, 0x44111, 0xDD331F, 0xeeaa88));
      AddComponent(p2, 'MeshComponent', new MeshComponent());
      AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
      AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(newSector.entities.length));
      AddComponent(p2, 'NameComponent', new NameComponent(this.placeNameGenerate.generate()));
      AddComponent(p2, 'ClassComponent', new NameComponent('Power Refinery'));
      AddComponent(p2, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(planetRadius + 6.0));
      AddComponent(p2, 'TeamComponent', new TeamComponent(ENEMY_FACTION_NAME));
      newSector.entities.push(p2);
    }
  }

  // Move to the next generation index
  this.generationIndex.x++;
  if (this.generationIndex.x === this.width) {
    this.generationIndex.x = 0;
    this.generationIndex.y++;
  }
};

GameWorld.prototype.getCurrentSector = function () {
  if (!this.isGenerated()) {
    throw new Error('Please generate the world first.')
  }

  return this.sectors[this.currentPlayerSector.x][this.currentPlayerSector.y];
};

// This will be reassigned as the game generates
let World = new GameWorld(5, 5, 0.4);



