
Gameplay.prototype.doNextTurn = function() {
  if (this.nextTurnReady === false) {
    throw new Error('Unable to perform a new turn yet!');
  }

  // Refresh the attack candidates; this is probably O(n^2) and slow; it can probably be done on the my-turn
  RemoveComponentFromAllEntities(this.entities, 'AttackCandidatesComponent');
  ViewEntities(this.entities, ['PositionComponent', 'TeamComponent', 'AttackRangeComponent'], [], (entity, position, team, range) => {
    const candidates = []; 
    const attackRangeSquared = range.getSquaredRange();
    const myTeam = team.value;

    ViewEntities(this.entities, ['PositionComponent', 'TeamComponent', 'HullHealthComponent'], [], (targetEntity, targetPosition, targetTeam, targetHealth) => {
      // Don't attack entities on the same team as us
      if (targetTeam.value === myTeam) {
        return;
      }

      // If it's close enough, we have a target
      const distanceSq = Phaser.Math.Distance.Squared(position.x, position.y, targetPosition.x, targetPosition.y);
      if (distanceSq <= attackRangeSquared) {
        candidates.push(targetEntity);
      }
    });

    if (candidates.length > 0) {
      AddComponent(entity, 'AttackCandidatesComponent', new AttackCandidatesComponent(candidates));
    }
  });

  this.nextTurnReady = false;

  // Set this to false if you don't want to immediately do the next turn (eg: player input, cinematic, etc.)
  let canDoNextTurn = true;

  let nextTurn = this.ROTScheduler.next();
  let nextEntityCandidate = this.entities[nextTurn.indComponent.value];
  while (nextEntityCandidate === undefined) {
    nextTurn = this.ROTScheduler.next();
    nextEntityCandidate = this.entities[nextTurn.indComponent.value];
  }
  const nextEntity = [nextEntityCandidate];

  ViewEntities(nextEntity, ['SkipperComponent', 'PlayerControlComponent', 'ShipReferenceComponent'], [], (entity, skipper, playerControl, shipReference) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }

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
            this.redirectShip(shipEntity, () => {
              this.nextTurnReady = true;
            });
          }
        }
      ]
    };

    this.showDialogue(dialogue);
  });

  ViewEntities(nextEntity, ['GunnerComponent', 'PlayerControlComponent', 'ShipReferenceComponent'], [], (entity, gunner, playerControl, shipReference) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }
    if (!(HasComponent(shipEntity, 'AttackCandidatesComponent'))) {
      return;
    }
    const candidates = GetComponent(shipEntity, 'AttackCandidatesComponent');
    if (candidates.value.length < 1) {
      return;
    }
    canDoNextTurn = false;

    const dialogue = {
      question: ('There ' + (candidates.value.length === 1 ? 'is ' : 'are ') + candidates.value.length + ((candidates.value.length === 1 ? ' enemy' : ' enemies')) + 'within range.\nShould we attack?'),
      options: [
        {
          text: '(0) Don\'t attack anyone',
          keyCode: Phaser.Input.Keyboard.KeyCodes.ZERO,
          action: () => {
            this.nextTurnReady = true;
          }
        }
      ]
    };
    candidates.value.forEach((candidate, i) => {
      const targetName = HasComponent(candidate, 'NameComponent') ? GetComponent(candidate, 'NameComponent').value : '???';
      dialogue.options.push({
        text: '(' + (i + 1) + ') attack ' + targetName,
        keyCode: ENEMY_SELECTION_KEYCODES[i],
        action: () => {
          this.performAttack(shipEntity, candidate);

          this.nextTurnReady = true;
        }
      });
    });

    this.showDialogue(dialogue);
  });

  ViewEntities(nextEntity, ['EngineerComponent', 'PlayerControlComponent', 'ShipReferenceComponent', 'EngineComponent'], [], (entity, engineer, playerControl, shipReference, engine) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }
    canDoNextTurn = false;

    const minMaxSpeedDelta = engine.maxSpeed - engine.minSpeed;
    let numberOfSpeedOptions = 7;
    if (minMaxSpeedDelta < 8) {
      numberOfSpeedOptions = 5;
    }
    if (minMaxSpeedDelta < 4) {
      numberOfSpeedOptions = 3;
    }

    const dialogue = {
      question: 'What speed should we set engines to?',
      options: [
        {
          text: '(0) Keep the same speed',
          keyCode: Phaser.Input.Keyboard.KeyCodes.ZERO,
          action: () => {
            this.nextTurnReady = true;
          }
        }
      ]
    };
    for (let i = 0; i <= numberOfSpeedOptions; i++) {
      const ratio = i / numberOfSpeedOptions;
      const speedValue = engine.minSpeed + (ratio * minMaxSpeedDelta);
      let speedConfigName = '(' + (i+1) + ') ';
      if (speedValue < 0.01) {
        speedConfigName += 'Halt Engines';
      } else {
        speedConfigName += (ratio * 100);
        speedConfigName += '% - '
        speedConfigName += (speedValue.toFixed(1) + ' ' + UNIT_PLURAL);
      }
      const key = ENEMY_SELECTION_KEYCODES[i];
      dialogue.options.push({
        text: speedConfigName,
        keyCode: key,
        action: () => {
          const velocity = GetComponent(shipEntity, 'ForwardVelocityComponent');
          velocity.value = speedValue;
          this.nextTurnReady = true;
        }
      });
    }
    this.showDialogue(dialogue);
  });

  ViewEntities(nextEntity, ['EngineerComponent', 'AIControlComponent', 'ShipReferenceComponent', 'EngineComponent'], [], (entity, engineer, aiControl, shipReference, engine) => {
    //
  });

  ViewEntities(nextEntity, ['GunnerComponent', 'AIControlComponent', 'ShipReferenceComponent'], [], (entity, gunner, aiControl, shipReference) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }
    if (!(HasComponent(shipEntity, 'AttackCandidatesComponent'))) {
      return;
    }
    const candidates = GetComponent(shipEntity, 'AttackCandidatesComponent');
    if (candidates.value.length < 1) {
      return;
    }

    const candidatePick = ~~(ROT.RNG.getUniform() * candidates.value.length);
    this.performAttack(shipEntity, candidates.value[candidatePick]);
  });

  ViewEntities(nextEntity, ['SkipperComponent', 'AIControlComponent', 'ShipReferenceComponent'], [], (entity, skipper, ai, shipRef) => {
    // TODO: make better skipper AI
    const shipIndex = shipRef.value;
    const shipToControl = this.entities[shipIndex];
    if (shipToControl === undefined) {
      return;
    }

    const rotation = GetComponent(shipToControl, 'RotationComponent');
    rotation.value += 0.8;
  });

  ViewEntities(nextEntity, ['AIControlComponent', 'PositionComponent', 'ShipReferenceComponent'], [], (entity, aiControl, position, shipRef) => {
    // TODO: add ai stuff
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
    delay: 100,
    callback: () => {
      this.nextTurnReady = true;
    }
  });

  //  --- Post-turn logic ---

  // Deal with destruction; remove meshes for entities that should be destroyed
  ViewEntities(this.entities, ['DestroyedComponent', 'MeshComponent'], [], (entity, destroyed, mesh) => {
    mesh.mesh.userData = {};
    this.three.scene.remove(mesh.mesh);
    RemoveComponent(entity, 'MeshComponent');
  });

  ViewEntities(this.entities, ['DestroyedComponent', 'PlayerControlComponent', 'HullHealthComponent'], [], (entity, destroyed, playerControl, hullHealthComponent) => {
    const questionText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'newsgeek', 'GAME OVER', 32);
    questionText.setCenterAlign();
    questionText.setOrigin(0.5);
  });

  // Set entities that don't exist anymore to undefined
  for (let i = 0; i < this.entities.length; i++) {
    if (this.entities[i] === undefined) {
      continue;
    }

    if (HasComponent(this.entities[i], 'DestroyedComponent')) {
      this.entities[i] = undefined;
    }
  }
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

  const questionText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.35, 'newsgeek', dialogue.question, DEFAULT_TEXT_SIZE);
  questionText.setCenterAlign();
  questionText.setOrigin(0.5);
  texts.push(questionText);
  for (let i = 0; i < dialogue.options.length; i++) {
    const option = dialogue.options[i];

    let optionText = this.add.bitmapText(GAME_WIDTH * 0.5, (GAME_HEIGHT * 0.35) + DEFAULT_TEXT_SIZE + (DEFAULT_TEXT_SIZE * (i + 1.2)), 'newsgeek', option.text, DEFAULT_TEXT_SIZE);
    optionText.setCenterAlign();
    optionText.setOrigin(0.5);
    texts.push(optionText);

    let key = this.input.keyboard.addKey(option.keyCode);
    key.once('down', () => { removeAllUIAndEvents(); option.action(); });
    keys.push(key);
  }
};

Gameplay.prototype.performAttack = function(attackingEntity, defendingEntity) {
  const attackPower = HasComponent(attackingEntity, 'AttackStrengthComponent') ? GetComponent(attackingEntity, 'AttackStrengthComponent').value : 0;

  // TODO: add shields into damage calculation
  const shieldPower = 0;

  const damage = Math.max(0, attackPower - shieldPower);

  const defenderHealthData = GetComponent(defendingEntity, 'HullHealthComponent');
  defenderHealthData.health -= damage;

  if (defenderHealthData.health <= 0) {
    AddComponent(defendingEntity, 'DestroyedComponent', new DestroyedComponent());
  }
};

Gameplay.prototype.redirectShip = function(shipEntityToRedirect, onComplete) {
  this.lockPanning = true;

  const shipPostion  = GetComponent(shipEntityToRedirect, 'PositionComponent');

  // Move the camera to our ship
  let t = this.add.tween({
    targets: this.gameCameraPos,
    x: shipPostion.x,
    y: shipPostion.y,
    duration: 300,
    easing: Phaser.Math.Easing.Cubic.In
  });

  let promptText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.25, 'newsgeek', 'Hold A or D to redirect.\n Press enter to confirm.', DEFAULT_TEXT_SIZE);
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

  const confirmKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
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
    mesh.mesh.userData.entity = entity;
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
  // TODO: update mesh position/rotation for GLTFs
};
