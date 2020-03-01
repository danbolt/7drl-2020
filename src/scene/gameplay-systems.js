
Gameplay.prototype.doNextTurn = function() {
  if (this.nextTurnReady === false) {
    throw new Error('Unable to perform a new turn yet!');
  }

  this.nextTurnReady = false;

  const nextTurn = this.ROTScheduler.next();
  console.log('the next turn is ' + nextTurn.indComponent.value + ' with a speed of ' + nextTurn.getSpeed());

  const nextEntity = [this.entities[nextTurn.indComponent.value]];

  ViewEntities(nextEntity, ['PlayerControlComponent', 'PositionComponent'], [], (entity, playerControl, position) => {
    this.gameCameraPos.x = position.x;
    this.gameCameraPos.y = position.y;
  });

  ViewEntities(nextEntity, ['AIControlComponent', 'PositionComponent'], [], (entity, aiControl, position) => {
    // TODO: add ai stuff
  });

  ViewEntities(nextEntity, ['PositionComponent', 'ForwardVelocityComponent', 'RotationComponent'], [], (entity, position, velocity, rotation) => {
    position.x += Math.cos(rotation.value) * velocity.value;
    position.y += Math.sin(rotation.value) * velocity.value;
  });


  // Delay a small amount before starting the next turn
  this.time.addEvent({
    delay: 500,
    callback: () => {
      this.nextTurnReady = true;
    }
  });
};


Gameplay.prototype.updateViewSystems = function() {
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
