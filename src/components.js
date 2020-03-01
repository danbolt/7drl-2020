
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

const PositionComponent = function (x, y) {
  this.x = x ? x : 0;
  this.y = y ? y : x;
};

const RotationComponent = function(rotation) {
  this.value = rotation ? rotation : 0;
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
}

const DexterityComponent = function(value) {
  this.value = value ? value : 1.0;
};

// --- INPUT CONTROL STUFF ---
const PlayerControlComponent = function() {};

// TODO: Various types of AI control
const AIControlComponent = function() {}

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

const SkipperComponent = function() {};
const MaxSpeedComponent = function(speed) {
  this.speed = speed ? speed : 0.0;
};

// --- RENDERING STUFF ---
const MeshComponent = function() {
  this.mesh = null;
};

const RequestDummy3DAppearanceComponent = function(hexColor) {
  this.hexColor = hexColor ? hexColor : 0x00FF00;
};
// TODO: add a "request 3d appearance removal" component
// TODO: request/remove for GLTF