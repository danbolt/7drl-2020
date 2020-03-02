
Gameplay.prototype.doNextTurn = function() {
  if (this.nextTurnReady === false) {
    throw new Error('Unable to perform a new turn yet!');
  }

  this.nextTurnReady = false;

  // Set this to false if you don't want to immediately do the next turn (eg: player input, cinematic, etc.)
  let canDoNextTurn = true;

  const nextTurn = this.ROTScheduler.next();
  const nextEntity = [this.entities[nextTurn.indComponent.value]];

  ViewEntities(nextEntity, ['SkipperComponent', 'PlayerControlComponent', 'ShipReferenceComponent'], [], (entity, skipper, playerControl, shipReference) => {
    canDoNextTurn = false;

    const dialogue = {
      question: 'Should we change our course?',
      options: [
        {
          text: '(n)o',
          keyCode: Phaser.Input.Keyboard.KeyCodes.N,
          action: () => {
            // We're keeping course, so we don't need to rotate
            this.nextTurnReady = true;
          }
        },
        {
          text: '(y)es',
          keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
          action: () => {
            const shipEntity = this.entities[shipReference.value];

            this.redirectShip(shipEntity, () => {
              this.nextTurnReady = true;
            });
          }
        }
      ]
    };

    this.showDialogue(dialogue);
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

    if (HasComponent(entity, 'MeshComponent')) {
      const mesh = GetComponent(entity, 'MeshComponent');
      let tween = this.add.tween({
        targets: mesh.mesh.position,
        x: position.x,
        z: position.y,
        duration: DEFAULT_POSITION_TWEEN_DURATION,
        onComplete: () => {
          RemoveComponent(entity, 'PositionTweenComponent');
          tween.stop();
        }
      });

      if (HasComponent(entity, 'PositionTweenComponent')) {
        const positionTween = GetComponent(entity, 'PositionTweenComponent');
        const oldTween = positionTween.value;

        oldTween.stop();

        RemoveComponent(entity, 'PositionTweenComponent');
      }
      AddComponent(entity, 'PositionTweenComponent', new PositionTweenComponent(tween));
    }
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

Gameplay.prototype.showDialogue = function(dialogue) {
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
};

Gameplay.prototype.redirectShip = function(shipEntityToRedirect, onComplete) {
  this.lockPanning = true;

  const shipPostion  = GetComponent(shipEntityToRedirect, 'PositionComponent');
  // Move the camera to our ship
  this.gameCameraPos.x = shipPostion.x;
  this.gameCameraPos.y = shipPostion.y;

  let promptText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.25, 'newsgeek', 'Hold W or D to redirect.\n Press space to confirm.', DEFAULT_TEXT_SIZE);
  promptText.setCenterAlign();

  const shipRotation = GetComponent(shipEntityToRedirect, 'RotationComponent');

  // Create an arrow
  let rotation = shipRotation.value;

  // Poll for keys to rotate the arrow
  const directionArrow = new THREE.ArrowHelper(new THREE.Vector3(1.0, 0.0, 0.0), new THREE.Vector3(shipPostion.x, 0.0, shipPostion.y), 3.2, 0xFF0000, 1.0, 1.0);
  this.three.scene.add(directionArrow);

  const updateArrowDir = (theta) => {
    directionArrow.setDirection(new THREE.Vector3(Math.cos(theta), 0.0, Math.sin(theta)));
  };
  updateArrowDir(rotation);

  const updateArrowPerTick = () => {
    if (this.keys.cam_right.isDown) {
      rotation += CAMERA_TURN_SPEED;
    } else if (this.keys.cam_left.isDown) {
      rotation -= CAMERA_TURN_SPEED;
    }
    updateArrowDir(rotation);
  };
  this.events.addListener('update', updateArrowPerTick, this);

  const confirmKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  const confirmCallback = () => {
    this.events.removeListener('update', updateArrowPerTick, this);
    shipRotation.value = rotation;

    this.lockPanning = false;
    onComplete();

    promptText.destroy();
    this.three.scene.remove(directionArrow);
  };
  confirmKey.once('down', confirmCallback);
};

// Used for lookAt calls without lots of per-frame garbage
const rotationSetViewVector = new THREE.Vector3(0, 1, 0);

Gameplay.prototype.updateViewSystems = function() {
  // If something needs a dummy 3D cube, add it
  ViewEntities(this.entities, ['MeshComponent', 'RequestDummy3DAppearanceComponent'], [], (entity, mesh, request3D) => {
    mesh.mesh = new THREE.Mesh( DUMMY_3D_CUBE_GEOM, new THREE.MeshBasicMaterial( { color: request3D.hexColor } ) );
    this.three.scene.add(mesh.mesh);
  });
  // TODO: add requests for GLTF models
  RemoveComponentFromAllEntities(this.entities, 'RequestDummy3DAppearanceComponent');

  // Update dummy mesh positions
  ViewEntities(this.entities, ['PositionComponent', 'MeshComponent'], ['PositionTweenComponent'], (entity, position, mesh) => {
    mesh.mesh.position.x = position.x;
    mesh.mesh.position.z = position.y;
  });
  // Update dummy mesh rotations
  ViewEntities(this.entities, ['RotationComponent', 'MeshComponent'], [], (entity, rotation, mesh) => {
    mesh.mesh.rotation.set(0, 0, 0);
    mesh.mesh.setRotationFromAxisAngle(rotationSetViewVector, rotation.value);
  });
  ViewEntities(this.entities, ['MeshComponent'], ['RotationComponent'], (entity, mesh) => {
    mesh.mesh.rotation.set(0, 0, 0);
  });
  // TODO: update mesh position/rotation for GLTFs
};
