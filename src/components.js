
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

const DexterityComponent = function(value) {
  this.value = value ? value : 1.0;
};

const MeshComponent = function() {
  this.mesh = null;
};

const RequestDummy3DAppearanceComponent = function(hexColor) {
  this.hexColor = hexColor ? hexColor : 0x00FF00;
};
// TODO: add a "request 3d appearance removal" component
// TODO: request/remove for GLTF