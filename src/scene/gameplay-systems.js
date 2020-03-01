Gameplay.prototype.updateSystems = function() {
  // If something needs a dummy 3D cube, add it
  ViewEntities(this.entities, ['MeshComponent', 'RequestDummy3DAppearanceComponent'], [], (entity, mesh, request3D) => {
    mesh.mesh = new THREE.Mesh( DUMMY_3D_CUBE_GEOM, new THREE.MeshBasicMaterial( { color: request3D.hexColor } ) );
    this.three.scene.add(mesh.mesh);
  });
  // TODO: add requests for GLTF models
  RemoveComponentFromAllEntities(this.entities, 'RequestDummy3DAppearanceComponent');

  // Update dummy mesh positions
  ViewEntities(this.entities, ['PositionComponent', 'MeshComponent'], [], (entity, position, mesh) => {
    mesh.mesh.position.x = position.x;
    mesh.mesh.position.z = position.y;
  });
  // Update dummy mesh rotations
  ViewEntities(this.entities, ['RotationComponent', 'MeshComponent'], [], (entity, rotation, mesh) => {
    mesh.mesh.rotation.set(0, rotation.value, 0);
  });
  ViewEntities(this.entities, ['MeshComponent'], ['RotationComponent'], (entity, mesh) => {
    mesh.mesh.rotation.set(0, 0, 0);
  });
  // TODO: update mesh position/rotation for GLTFs
};

