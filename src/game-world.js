const generateEnemy = function (entities, rng, names, x, y, config, portraitToPick, faction, namePrefix, className, modelName, audioTension, mass, shields) {
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

  if (shields !== undefined) {
    AddComponent(e, 'ShieldsComponent', new HullHealthComponent(1)); 
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
};


const generatePopcornEnemy = function (entities, rng, names, x, y) {
  const portraitToPick = (rng.getUniform() < 0.1444) ? 'gamilon1' : 'gamilon2';

  generateEnemy(entities, rng, names, x, y, new PopcornEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, POPCORN_NAME_PREFIX, POPCORN_CLASS_NAME, 'gamilon_popcorn', 1, 1.05);
};

const generateWeakEnemy = function (entities, rng, names, x, y) {
  const portraitToPick = (rng.getUniform() < 0.5) ? 'gamilon3' : 'gamilon2';

  generateEnemy(entities, rng, names, x, y, new WeakEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, WEAK_NAME_PREFIX, WEAK_CLASS_NAME, 'gamilon_small', 1, 1.65);
};

const generateBattleshipEnemy = function (entities, rng, names, x, y) {
  const portraitToPick = 'gamilon3';

  generateEnemy(entities, rng, names, x, y, new BattleshipEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, BATTLESHIP_NAME_PREFIX, BATTLESHIP_CLASS_NAME, 'gamilon_medium', 2, 2.3);
};

const generateAltBattleshipEnemy = function (entities, rng, names, x, y) {
  const portraitToPick = 'gamilon2';

  generateEnemy(entities, rng, names, x, y, new AltBattleshipEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, BATTLESHIP_ALT_NAME_PREFIX, BATTLESHIP_ALT_CLASS_NAME, 'gamilon_medium2', 2, 2, true);
};

const generateDreadnoughtEnemy = function (entities, rng, names, x, y) {
  const portraitToPick = 'gamilon1';

  generateEnemy(entities, rng, names, x, y, new DreadnoughtEnemyPointsConfiguration(), portraitToPick, ENEMY_FACTION_NAME, DREADNOUGHT_NAME_PREFIX, DREADNOUGHT_CLASS_NAME, 'gamilon_large', 3, 3.4, true);
};

const generateDroneEnemy = function (entities, rng, names, x, y) {
  const portraitToPick = 'gamilon_mini';

  generateEnemy(entities, rng, names, x, y, new DroneEnemyPointsConfiguration(), portraitToPick, 'Lost ' + ENEMY_PEOPLE_NAME + ' Machines', DRONE_NAME_PREFIX, DRONE_CLASS_NAME, 'gamilon_mini', 1, 0.5, false);
};

const generateOldGodEnemy = function (entities, rng, names, x, y) {
  generateEnemy(entities, rng, names, x, y, new OldGodEnemyPointsConfiguration(), 'old_god', '???', '', 'Ancient God of Flame', 'old_god', 4, 10.1, false);
};


// TODO: real enemies plz
const dummyEnemiesPopulate = function (entities, rng, names) {
  for (let i = 0; i < 5; i++) {
    let e = NewEntity();
    AddComponent(e, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    AddComponent(e, 'HullHealthComponent', new HullHealthComponent(10));
    //AddComponent(e, 'ShieldsComponent', new HullHealthComponent(50 + (Math.random() * 20))); // Shields are "health" but not
    AddComponent(e, 'PositionComponent', new PositionComponent(rng.getNormal(SECTOR_WIDTH * 0.5, SECTOR_WIDTH * 0.14), rng.getNormal(SECTOR_HEIGHT * 0.5, SECTOR_HEIGHT * 0.14)));
    AddComponent(e, 'ForwardVelocityComponent', new ForwardVelocityComponent(0.3 + (Math.random() * 3.2)));
    AddComponent(e, 'RotationComponent', new RotationComponent(Math.random() * Math.PI * 2));
    AddComponent(e, 'LerpRotationComponent', new LerpRotationComponent(GetComponent(e, 'RotationComponent').value));
    AddComponent(e, 'DexterityComponent', new DexterityComponent(4));
    AddComponent(e, 'MeshComponent', new MeshComponent());
    AddComponent(e, 'PortraitComponent', new NameComponent('gamilon3'));
    AddComponent(e, 'AttackStrengthComponent', new AttackStrengthComponent(4));
    AddComponent(e, 'AttackRangeComponent', new AttackRangeComponent(30));
    AddComponent(e, 'AIControlComponent', new AIControlComponent());
    AddComponent(e, 'RequestGLTF3DAppearanceComponent', new RequestGLTF3DAppearanceComponent('gamilon_medium2'));
    AddComponent(e, 'TeamComponent', new TeamComponent('G&T Empire'));
    AddComponent(e, 'NameComponent', new NameComponent('LS ' + names.generate()));
    AddComponent(e, 'ClassComponent', new NameComponent('L. Dry Battleship'));
    AddComponent(e, 'MassComponent', new MassComponent(4.3));
    AddComponent(e, 'RNDBountyComponent', new RNDBountyComponent(3));
    entities.push(e);

    if (i === 0) {
      AddComponent(e, 'MessageOnceInAttackRangeComponent', new MessageOnceInAttackRangeComponent('Hey, you\'re not allowed in here!', 'gamilon_talk3'));
    }

    let skipper = NewEntity();
    AddComponent(skipper, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 1));
    AddComponent(skipper, 'SkipperComponent', new SkipperComponent());
    AddComponent(skipper, 'DexterityComponent', new DexterityComponent(2));
    AddComponent(skipper, 'AIControlComponent', new AIControlComponent());
    AddComponent(skipper, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(skipper);

    let gunner = NewEntity();
    AddComponent(gunner, 'GunnerComponent', new GunnerComponent());
    AddComponent(gunner, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 2));
    AddComponent(gunner, 'DexterityComponent', new DexterityComponent(2));
    AddComponent(gunner, 'AIControlComponent', new AIControlComponent());
    AddComponent(gunner, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(gunner);

    let engineer = NewEntity();
    AddComponent(engineer, 'EngineerComponent', new EngineerComponent());
    AddComponent(engineer, 'EngineComponent', new EngineComponent(3.3));
    AddComponent(engineer, 'DexterityComponent', new DexterityComponent(2));
    AddComponent(engineer, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 3));
    AddComponent(engineer, 'AIControlComponent', new AIControlComponent());
    AddComponent(engineer, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(engineer);

    let shieldOp = NewEntity();
    AddComponent(shieldOp, 'ShieldOperatorComponent', new ShieldOperatorComponent());
    AddComponent(shieldOp, 'DexterityComponent', new DexterityComponent(2));
    AddComponent(shieldOp, 'ShipReferenceComponent', new ShipReferenceComponent(entities.length - 4));
    AddComponent(shieldOp, 'AIControlComponent', new AIControlComponent());
    AddComponent(shieldOp, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
    entities.push(shieldOp);

    if (HasComponent(e, 'ShieldsComponent')) {
      let shieldMesh = NewEntity();
      AddComponent(shieldMesh, 'MeshComponent', new MeshComponent());
      AddComponent(shieldMesh, 'MeshPositionMatchComponent', new MeshPositionMatchComponent(entities.length - 5));
      AddComponent(shieldMesh, 'ECSIndexComponent', new ECSIndexComponent(entities.length));
      AddComponent(shieldMesh, 'RequestShield3DAppearanceComponent', new RequestShield3DAppearanceComponent(4.4));
      AddComponent(shieldMesh, 'PlanetViewDataComponent', new PlanetViewDataComponent(0.0, 0.3435, 0x44111, 0x775500, 0xeeaa88)); // dummy planet data for that spin
      AddComponent(shieldMesh, 'VisibleIfShieldsUpComponent', new VisibleIfShieldsUpComponent(entities.length - 5));
      entities.push(shieldMesh);
    }
  }
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

GameWorld.prototype.generatePlanetEntitiesForSector = function(sector, rng) {
  // TODO: make these more confiurable from the sector
  const minNumberOfPlanets = 2;
  const randomNumberOfPlanets = 5;

  const minPlanetRadius = 1.1;
  const randomPlanetRadius = 2.432;

  if (sector.x === (this.width - 1) && (sector.y === 0)) {
    //
  } else {
    sector.name += ': ' + this.placeNameGenerate.generate();
  }

  const numberOfPlanetsToGenerate = minNumberOfPlanets + (~~(rng.getUniform() * randomNumberOfPlanets));

  for (let i = 0; i < numberOfPlanetsToGenerate; i++) {
    const planetRadius = minPlanetRadius + (rng.getUniform() * randomPlanetRadius)
    const generatedX = 1.0 + (rng.getUniform() * (SECTOR_WIDTH - 2));
    const generatedY = 1.0 + (rng.getUniform() * (SECTOR_HEIGHT - 2));

    let p2 = NewEntity();
    AddComponent(p2, 'PositionComponent', new PositionComponent(generatedX, generatedY));
    AddComponent(p2, 'PlanetViewDataComponent', new PlanetViewDataComponent(planetRadius, 0.3435, 0x44111, 0x775500, 0xeeaa88));
    AddComponent(p2, 'MeshComponent', new MeshComponent());
    AddComponent(p2, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
    AddComponent(p2, 'ECSIndexComponent', new ECSIndexComponent(sector.entities.length));
    AddComponent(p2, 'NameComponent', new NameComponent(this.placeNameGenerate.generate()));
    AddComponent(p2, 'ClassComponent', new NameComponent('Wasteland Planet'));
    sector.entities.push(p2);
  }

  // If we're generating the starting sector, add planet earth
  if (sector.x === this.currentPlayerSector.x && sector.y === this.currentPlayerSector.y) {
    // Generate the earth
    const earth = NewEntity();
    AddComponent(earth, 'PositionComponent', new PositionComponent(10, 10));
    AddComponent(earth, 'PlanetViewDataComponent', new PlanetViewDataComponent(3, 0.3435, 0x1010aa, 0x104499, 0x007710));
    AddComponent(earth, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(8.0));
    AddComponent(earth, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(30));
    AddComponent(earth, 'MeshComponent', new MeshComponent());
    AddComponent(earth, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
    AddComponent(earth, 'ECSIndexComponent', new ECSIndexComponent(sector.entities.length));
    AddComponent(earth, 'NameComponent', new NameComponent('St. Terra'));
    AddComponent(earth, 'ClassComponent', new NameComponent('Homeworld'));
    AddComponent(earth, 'TeamComponent', new TeamComponent('Space Federation'));
    sector.entities.push(earth);
  }

  if (sector.x === this.iscandarSector.x && sector.y === this.iscandarSector.y) {
    // Generate Iscandar
    const nayr = NewEntity();
    AddComponent(nayr, 'PositionComponent', new PositionComponent(10, 10));
    AddComponent(nayr, 'PlanetViewDataComponent', new PlanetViewDataComponent(5.4, 0.987, 0x102099, 0x109999, 0xaacccc));
    AddComponent(nayr, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(12.0));
    AddComponent(nayr, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(30));
    AddComponent(nayr, 'MeshComponent', new MeshComponent());
    AddComponent(nayr, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
    AddComponent(nayr, 'ECSIndexComponent', new ECSIndexComponent(sector.entities.length));
    AddComponent(nayr, 'NameComponent', new NameComponent('Nayr'));
    AddComponent(nayr, 'ClassComponent', new NameComponent('Sacred Planet'));
    AddComponent(nayr, 'TeamComponent', new TeamComponent('Space Federation'));
    AddComponent(nayr, 'PlanetGoalComponent', new PlanetGoalComponent());
    sector.entities.push(nayr);
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


  // TODO: populate sector with more interesting planets
  this.generatePlanetEntitiesForSector(newSector, this.rng);

  // Generate enemy types based on euclidian distance
  const tileDistanceFromStart = Math.abs(this.currentPlayerSector.x - newSector.x) + Math.abs(this.currentPlayerSector.y - newSector.y);
  console.log(newSector.name + ": " + tileDistanceFromStart);

  for (let i = 0; i < 5; i++) {
    const posX = this.rng.getNormal(SECTOR_WIDTH * 0.35, SECTOR_WIDTH * 0.2);
    const posY = this.rng.getNormal(SECTOR_HEIGHT * 0.35, SECTOR_HEIGHT * 0.2);

    //generateDroneEnemy(newSector.entities, this.rng, this.placeNameGenerate, posX, posY);
    generatePopcornEnemy(newSector.entities, this.rng, this.nameGenerator, posX * 1.4, posY * 1.4);
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



