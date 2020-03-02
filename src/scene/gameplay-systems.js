
Gameplay.prototype.doNextTurn = function() {
  if (this.nextTurnReady === false) {
    throw new Error('Unable to perform a new turn yet!');
  }

  this.nextTurnReady = false;

  // Set this to false if you don't want to immediately do the next turn (eg: player input, cinematic, etc.)
  let canDoNextTurn = true;

  const nextTurn = this.ROTScheduler.next();
  const nextEntity = [this.entities[nextTurn.indComponent.value]];

  ViewEntities(nextEntity, ['SkipperComponent', 'PlayerControlComponent'], [], (entity, skipper, playerControl) => {
    canDoNextTurn = false;

    const dialogue = {
      question: 'Should we keep course?',
      options: [
        {
          text: '(y)es',
          keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
          action: () => {
            // We're keeping course, so we don't need to rotate
            this.nextTurnReady = true;
          }
        },
        {
          text: '(n)o',
          keyCode: Phaser.Input.Keyboard.KeyCodes.N,
          action: () => {
            console.log('WE NEED TO ADD SHIP TURN UI');
          }
        }
      ]
    };

    let texts = [];
    let keys = [];
    const removeAllUIAndEvents = () => {
      keys.forEach((key) => {
        key.removeAllListeners('down');
      });

      texts.forEach((text) => {
        text.destroy();
      });
    };

    const questionText = this.add.bitmapText(16, 16, 'newsgeek', dialogue.question, DEFAULT_TEXT_SIZE);
    texts.push(questionText);
    for (let i = 0; i < dialogue.options.length; i++) {
      const option = dialogue.options[i];

      let optionText = this.add.bitmapText(32, 32 + (DEFAULT_TEXT_SIZE * i), 'newsgeek', option.text, DEFAULT_TEXT_SIZE);
      texts.push(optionText);

      let key = this.input.keyboard.addKey(option.keyCode);
      key.once('down', () => { removeAllUIAndEvents(); option.action(); });
      keys.push(key);
    }
  });

  ViewEntities(nextEntity, ['SkipperComponent', 'AIControlComponent', 'ShipReferenceComponent'], [], (entity, skipper, ai, shipRef) => {
    // TODO: make better skipper AI
    const shipIndex = shipRef.value;
    const shipToControl = this.entities[shipIndex];

    const rotation = GetComponent(shipToControl, 'RotationComponent');
    rotation.value += 0.8;
  });

  ViewEntities(nextEntity, ['AIControlComponent', 'PositionComponent'], [], (entity, aiControl, position) => {
    // TODO: add ai stuff
  });

  ViewEntities(nextEntity, ['PlayerControlComponent', 'PositionComponent'], [], (entity, playerControl, position) => {
    this.gameCameraPos.x = position.x;
    this.gameCameraPos.y = position.y;
  });

  ViewEntities(nextEntity, ['PositionComponent', 'ForwardVelocityComponent', 'RotationComponent'], [], (entity, position, velocity, rotation) => {
    position.x += Math.cos(rotation.value) * velocity.value;
    position.y += Math.sin(rotation.value) * velocity.value;
  });

  // Delay a small amount before starting the next turn
  if (canDoNextTurn)
  this.time.addEvent({
    delay: 405,
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
