const PositionComponent = function (x, y) {
  this.x = x ? x : 0;
  this.y = y ? y : x;
};

const RotationComponent = function(rotation) {
  this.value = rotation ? rotation : 0;
}

const MeshComponent = function() {
  this.mesh = null;
};

const RequestDummy3DAppearanceComponent = function() {};
// TODO: add a "request 3d appearance removal" component
// TODO: request/remove for GLTF