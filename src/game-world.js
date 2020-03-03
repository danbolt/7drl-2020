const GameWorld = function (width, height, seed) {
  this.seed = seed ? seed : Math.random();

  this.width = width ? width : DEFAULT_WORLD_SIZE_IN_SECTORS;
  this.height = height ? height : DEFAULT_WORLD_SIZE_IN_SECTORS;

  // Get an RNG and set it with our seed
  this.rng = ROT.RNG.clone();
  this.rng.setSeed(this.seed);

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

  this.currentPlayerSector = { x: 1, y: (this.height - 2) };
  this.iscandarSector = { x: (this.width - 2), y: 1 };
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
    AddComponent(p2, 'NameComponent', new NameComponent('planet with radius ' + planetRadius));
    sector.entities.push(p2);
  }

  // If we're generating the starting sector, add planet earth
  if (sector.x === this.currentPlayerSector.x && sector.y === this.currentPlayerSector.y) {
    let testPlanet = NewEntity();
    AddComponent(testPlanet, 'PositionComponent', new PositionComponent(20, 5));
    AddComponent(testPlanet, 'PlanetViewDataComponent', new PlanetViewDataComponent(3, 0.3435, 0x1010aa, 0x104499, 0x007710));
    AddComponent(testPlanet, 'PlanetOrbitableComponent', new PlanetOrbitableComponent(4.6));
    AddComponent(testPlanet, 'PlanetSuppliesComponent', new PlanetSuppliesComponent(30))
    AddComponent(testPlanet, 'MeshComponent', new MeshComponent());
    AddComponent(testPlanet, 'RequestPlanetAppearanceComponent', new RequestPlanetAppearanceComponent());
    AddComponent(testPlanet, 'ECSIndexComponent', new ECSIndexComponent(sector.entities.length));
    AddComponent(testPlanet, 'NameComponent', new NameComponent('Terra'));
    AddComponent(testPlanet, 'TeamComponent', new TeamComponent('Space Federation'));
    sector.entities.push(testPlanet);
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



