
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
    AddComponent(e, 'DexterityComponent', new DexterityComponent(4));
    AddComponent(e, 'MeshComponent', new MeshComponent());
    AddComponent(e, 'PortraitComponent', new NameComponent('gamilon3'));
    AddComponent(e, 'AttackStrengthComponent', new AttackStrengthComponent(4));
    AddComponent(e, 'AttackRangeComponent', new AttackRangeComponent(10));
    AddComponent(e, 'AIControlComponent', new AIControlComponent());
    AddComponent(e, 'RequestGLTF3DAppearanceComponent', new RequestGLTF3DAppearanceComponent('gamilon_large'));
    AddComponent(e, 'TeamComponent', new TeamComponent('G&T Empire'));
    AddComponent(e, 'NameComponent', new NameComponent('LS ' + names.generate()));
    AddComponent(e, 'ClassComponent', new NameComponent('L. Dry Battleship'));
    entities.push(e);

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
  for (let i = 0; i < MiddleNames.length; i++) {
    this.nameGenerator.observe(MiddleNames[i]);
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
    AddComponent(p2, 'NameComponent', new NameComponent(this.nameGenerator.generate()));
    AddComponent(p2, 'ClassComponent', new NameComponent('Wasteland Planet'));
    sector.entities.push(p2);
  }

  // If we're generating the starting sector, add planet earth
  if (sector.x === this.currentPlayerSector.x && sector.y === this.currentPlayerSector.y) {
    // Generate the earth
    const earth = NewEntity();
    AddComponent(earth, 'PositionComponent', new PositionComponent(10, 10));
    AddComponent(earth, 'PlanetViewDataComponent', new PlanetViewDataComponent(3, 0.3435, 0x1010aa, 0x104499, 0x007710));
    AddComponent(earth, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(7.0));
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

  // TODO: populate sector with other entities
  this.generatePlanetEntitiesForSector(newSector, this.rng);

  dummyEnemiesPopulate(newSector.entities, this.rng, this.nameGenerator);

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



