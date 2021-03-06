
// --- GAME LOGIC STUFF ---

/*
 * This will:
 * - always match its index in the Gameplay.entities array
 * - will be removed from all entities on Gameplay scene shutdown
 */
const ECSIndexComponent = function(value) {
  if (value === undefined) {
    throw new Error('ECS index value was undefined');
  }

  if (!Number.isInteger(value)) {
    throw new Error('ECS index value was not an integer');
  }

  if (value < 0) {
    throw new Error('ECS index value was negative');
  }

  this.value = value;
};

const NameComponent = function(value) {
  this.value = value ? value : "???";
}

// Teams are strings; they match on string equality
const TeamComponent = function(value) {
  this.value = value;
};

//If the player is within orbiting range of a planet with this, then the player wins
const PlanetGoalComponent = function() {};

const PositionComponent = function (x, y) {
  this.x = x ? x : 0;
  this.y = y ? y : x;
};

const RotationComponent = function(rotation) {
  this.value = rotation ? rotation : 0;
};

const MassComponent = function(mass) {
  this.value = mass ? mass : 2;
};

const ForwardVelocityComponent = function(velocity) {
  this.value = velocity ? velocity : 0.0;
};

const HullHealthComponent = function(maxHealth, currentHealth) {
  if (!maxHealth) {
    throw new Error('No max health value');
  }

  if (!(typeof maxHealth === "number")) {
    throw new Error('Max health is not a number');
  }

  if (maxHealth <= 0) {
    throw new Error('Max health must be a positive non-zero number');
  }

  this.maxHealth = maxHealth;
  this.health = currentHealth ? currentHealth : this.maxHealth;
};

const DestroyedComponent = function () {};

const DexterityComponent = function(value) {
  this.value = value ? value : 1.0;
};

const ShipReferenceComponent = function (value) {
  if (value === undefined) {
    throw new Error('ECS index value was undefined');
  }

  if (!Number.isInteger(value)) {
    throw new Error('ECS index value was not an integer');
  }

  if (value < 0) {
    throw new Error('ECS index value was negative');
  }

  this.value = value;
};

const GunnerComponent = function () {};
const AttackStrengthComponent = function(value) {
  if (value === undefined) {
    throw new Error('attack strength value was undefined');
  }

  // Clamp attack strength to an integer
  this.value = ~~value;
}
const AttackRangeComponent = function(value) {
  if (value === undefined) {
    throw new Error('attack range value was undefined');
  }

  if (value < 0) {
    throw new Error('attack range value was negative');
  }

  this.value = value;
};
AttackRangeComponent.prototype.getSquaredRange = function() {
  return this.value * this.value;
}

const SkipperComponent = function() {};

const EngineerComponent = function () {};
const EngineComponent = function(maxSpeed) {
  this.minSpeed = 0;
  this.maxSpeed = maxSpeed;
};

const ShieldOperatorComponent = function () {};
const ShieldsUpComponent = function () {};

const SuppliesComponent = function (maxValue, value) {
  if (maxValue === undefined) {
    throw new Error('Max supplies value was undefined');
  }

  if (!Number.isInteger(maxValue)) {
    throw new Error('Max supplies value was not an integer');
  }

  if (maxValue < 0) {
    throw new Error('Max supplies value was negative');
  }

  if (value === undefined) {
    throw new Error('Supplies value was undefined');
  }

  if (!Number.isInteger(value)) {
    throw new Error('Supplies value was not an integer');
  }

  if (value < 0) {
    throw new Error('Supplies value was negative');
  }

  this.max = maxValue ? maxValue : DEFAULT_SUPPLIES;
  this.value = value ? value : this.max;
};

// --- INPUT CONTROL STUFF ---

const PlayerControlComponent = function() {};

// TODO: Various types of AI control
const AIControlComponent = function() {}

const PursueIfAttackedComponent = function() {};

const PursueIfInRangeComponent = function(range) {
  if (range === undefined) {
    throw new Error('range value was undefined');
  }

  if (range < 0) {
    throw new Error('range value was negative');
  }

  this.range = range;
}

const OnlyAttackIfPursuingComponent = function() {};

const AggroComponent = function(targetIndex, range) {
  if (targetIndex === undefined) {
    throw new Error('Targetindex value was undefined');
  }

  if (!Number.isInteger(targetIndex)) {
    throw new Error('Targetindex value was not an integer');
  }

  if (targetIndex < 0) {
    throw new Error('Targetindex value was negative');
  }

  if (range === undefined) {
    throw new Error('range value was undefined');
  }

  if (range < 0) {
    throw new Error('range value was negative');
  }


  this.targetIndex = targetIndex;
  this.range = range;
}

const AttackCandidatesComponent = function(value) {
  if (!((Array.isArray(value)) || (value === undefined))) {
    throw new Error('attack candidates was not an array or undefined');
  }
  this.value = value ? value : [];
};

const OrbitNotificationComponent = function() {};

const PlanetSuppliesComponent = function(value) {
  if (value === undefined) {
    throw new Error('ECS index value was undefined');
  }

  if (value < 0) {
    throw new Error('ECS index value was negative');
  }

  this.value = value;
};

const PlanetOrbitableComponent = function(range) {
  if (range === undefined) {
    throw new Error('Planet orbit range was undefined');
  }

  if (range < 0) {
    throw new Error('Planet orbit range was negative');
  }

  this.dockRange = range;
};

const ShipInOrbitRangeOfPlanetComponent = function(value) {
  if (value === undefined) {
    throw new Error('ECS index value was undefined');
  }

  if (!Number.isInteger(value)) {
    throw new Error('ECS index value was not an integer');
  }

  if (value < 0) {
    throw new Error('ECS index value was negative');
  }
  
  this.planetIndex = value;
};

const ShipOrbitingPlanetComponent = function(value) {
  if (value === undefined) {
    throw new Error('ECS index value was undefined');
  }

  if (!Number.isInteger(value)) {
    throw new Error('ECS index value was not an integer');
  }

  if (value < 0) {
    throw new Error('ECS index value was negative');
  }

  this.planetIndex = value;
};

const MessageOnceInAttackRangeComponent = function(value, soundKey) {
  if (value === undefined) {
    throw new Error('Message value was undefined');
  }

  this.value = value;
  this.sound = soundKey;
};

const RNDBountyComponent = function(value) {
  if (value === undefined) {
    throw new Error('R&D bounty value was undefined');
  }

  if (!Number.isInteger(value)) {
    throw new Error('R&D bounty value was not an integer');
  }

  if (value < 0) {
    throw new Error('R&D bounty value was negative');
  }

  this.value = value ? value : 0;
}

// --- RENDERING STUFF ---

const MeshComponent = function(mesh) {
  this.mesh = mesh ? mesh : null;
};

const RequestPlanetAppearanceComponent = function(radius, colors, noiseSeed) { };

const MeshPositionMatchComponent = function(matchIndex) {
  this.matchIndex = matchIndex;
};

const VisibleIfShieldsUpComponent = function(index) {
  this.index = index;
}

const RequestDummy3DAppearanceComponent = function(hexColor) {
  this.hexColor = hexColor ? hexColor : 0x00FF00;
};

const RequestShield3DAppearanceComponent = function(radius) {
  this.radius = radius ? radius : 2.0;
};

const RequestGLTF3DAppearanceComponent = function(meshName) {
  this.meshName = meshName;
};

const PositionTweenComponent = function(value) {
  if (value === undefined) {
    throw new Error('Position tween value was undefined');
  }

  this.value = value;
};

const LerpRotationComponent = function(value) {
    if (value === undefined) {
    throw new Error('Lerp rotation value was undefined');
  }

  this.value = value ? value : 0;
};

const RotationTweenComponent = function(value) {
  if (value === undefined) {
    throw new Error('Rotation tween value was undefined');
  }

  this.value = value;
};

const AudioTensionComponent = function(value) {
  if (value === undefined) {
    throw new Error('Audio tension value was undefined');
  }

  if (!Number.isInteger(value)) {
    throw new Error('Audio tension value was not an integer');
  }

  if (value < 0) {
    throw new Error('Audio tension value was negative');
  }

  if (value >= BGMSounds.length) {
    throw new Error('Audio tension value too big: ' + value);
  }

  this.value = value;
};

const MuteAudioTensionComponent = function() {};


const PlanetViewDataComponent = function(radius, rotationSpeed, color1, color2, color3) {
  this.radius = radius;
  this.rotationSpeed = rotationSpeed; 
  this.color1 = new THREE.Color(color1);
  this.color2 = new THREE.Color(color2);
  this.color3 = new THREE.Color(color3);
};