
Gameplay.prototype.doNextTurn = function(nextEntity) {
  if (this.nextTurnReady === false) {
    throw new Error('Unable to perform a new turn yet!');
  }

  if (this.exiting) {
    return;
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

  // Update if users are in range of planets
  ViewEntities(this.entities, ['PositionComponent', 'PlanetOrbitableComponent', 'ECSIndexComponent'], [], (entity, position, orbitable, index) => {
    const squaredRange = orbitable.dockRange * orbitable.dockRange;
    const isAVictoryPlanet = HasComponent(entity, 'PlanetGoalComponent');

    // Find ships within orbit range
    ViewEntities(this.entities, ['PositionComponent', 'HullHealthComponent'], ['ShipOrbitingPlanetComponent', 'ShipInOrbitRangeOfPlanetComponent'], (shipEntity, shipPosition) => {
      const distToPlanetSqared = Phaser.Math.Distance.Squared(position.x, position.y, shipPosition.x, shipPosition.y);
      if (distToPlanetSqared <= squaredRange) {
        AddComponent(shipEntity, 'ShipInOrbitRangeOfPlanetComponent', new ShipInOrbitRangeOfPlanetComponent(index.value));
        AddComponent(shipEntity, 'OrbitNotificationComponent', new OrbitNotificationComponent());

        // If the player is in orbit range of a planet with
        if (isAVictoryPlanet && HasComponent(shipEntity, 'PlayerControlComponent')) {
          this.scene.stop('Gameplay');
          // TODO: Add a victory screen
        }
      }
    });
  });

  // Remove orbit information for planets that are out of range
  ViewEntities(this.entities, ['PositionComponent', 'ShipInOrbitRangeOfPlanetComponent'], [], (entity, position, inOrbitRange) => {
    const planet = this.entities[inOrbitRange.planetIndex];
    if (!HasComponent(planet, 'PlanetOrbitableComponent')) {
      console.warn('planet ' + inOrbitRange.planetIndex  + ' isn\'t orbitatble now?');
      RemoveComponent(entity, 'ShipInOrbitRangeOfPlanetComponent');
      return;
    }

    const planetOrbitInfo = GetComponent(planet, 'PlanetOrbitableComponent');
    const planetOrbitRangeSquared = planetOrbitInfo.dockRange * planetOrbitInfo.dockRange;
    const planetPosition = GetComponent(planet, 'PositionComponent');
    const distToPlanetSqared = Phaser.Math.Distance.Squared(position.x, position.y, planetPosition.x, planetPosition.y);
    if (distToPlanetSqared > planetOrbitRangeSquared) {
      RemoveComponent(entity, 'ShipInOrbitRangeOfPlanetComponent');

      if (HasComponent(entity, 'OrbitNotificationComponent')) {
        RemoveComponent(entity, 'OrbitNotificationComponent');
      }
    }
  });

  this.nextTurnReady = false;

  // Set this to false if you don't want to immediately do the next turn (eg: player input, cinematic, etc.)
  let canDoNextTurn = true;

  // Deplete supplies
  ViewEntities(nextEntity, ['HullHealthComponent', 'SuppliesComponent'], [], (entity, hullHealth, supplies) => {
    supplies.value = Math.max(supplies.value - SUPPLIES_DEPLETION_PER_SHIP_TURN, 0);

    // If we have enough supplies to continue, we're done here
    if (supplies.value >= 1) {
      return;
    }

    // If we're out of supplies, then "destroy the ship"
    AddComponent(entity, 'DestroyedComponent', new DestroyedComponent());
  });

  // Turning logic
  ViewEntities(nextEntity, ['SkipperComponent', 'PlayerControlComponent', 'ShipReferenceComponent'], [], (entity, skipper, playerControl, shipReference) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }

    if (World.snoozeSkipper) {
      return;
    }

    const skipperName = HasComponent(entity, 'NameComponent') ? GetComponent(entity, 'NameComponent').value : undefined;

    // We're going to have the skipper do "something"
    canDoNextTurn = false;


    const hasArrivedAtPlanet = HasComponent(shipEntity, 'OrbitNotificationComponent');
    const inOrbitAlready = HasComponent(shipEntity, 'ShipOrbitingPlanetComponent');
    if (inOrbitAlready) {
      const planetOrbitIndex = GetComponent(shipEntity, 'ShipInOrbitRangeOfPlanetComponent').planetIndex;
      const planetEntity = this.entities[planetOrbitIndex];
      const planetName = HasComponent(planetEntity, 'NameComponent') ? GetComponent(planetEntity, 'NameComponent').value : '???';

      const departDialogue = {
        question: 'Should we depart from planet ' + planetName + '?',
        portrait: skipperName,
        options: [
          {
            text: '[n] No',
            keyCode: Phaser.Input.Keyboard.KeyCodes.N,
            action: () => {
              // We're keeping course, so we don't need to rotate
              this.nextTurnReady = true;
            }
          },
          {
            text: '[y] Yes',
            keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
            action: () => {
              // Undock the ship
              const orbitInfo = RemoveComponent(shipEntity, 'ShipOrbitingPlanetComponent');

              // Begin movement
              const velocity = GetComponent(shipEntity, 'ForwardVelocityComponent');

              // Find the ship's engineer and set speed to 75%
              let foundEngineer = false;
              ViewEntities(this.entities, ['EngineerComponent', 'EngineComponent', 'ShipReferenceComponent'], [], (entity, engineer, engine, engineerShipRef) => {
                // If this isn't the same ship, don't do anything
                if (engineerShipRef.value !== shipReference.value) {
                  return;
                }


                velocity.value = engine.minSpeed + ((engine.maxSpeed - engine.minSpeed) * 0.75);
                foundEngineer = true;
              });
              if (!foundEngineer) {
                throw new Error('unable to find engineer!!');
              }


              this.nextTurnReady = true;
            }
          }
        ]
      };

      // If the planet has supplies, give them to the player
      if (HasComponent(planetEntity, 'PlanetSuppliesComponent')) {
        const planetSupplies = GetComponent(planetEntity, 'PlanetSuppliesComponent');
        const suppliesBonusQuantity = planetSupplies.value;
        RemoveComponent(planetEntity, 'PlanetSuppliesComponent');
        const notifySuppliesDialogue = {
          question: 'We were able to find some supplies on planet ' + planetName + '!',
          portrait: skipperName,
          options: [
            {
              text: '[y] Yay!',
              keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
              action: () => {
                this.time.addEvent({
                  delay: 32,
                  callback: () => {
                    const supplies = GetComponent(shipEntity, 'SuppliesComponent');
                    supplies.value = Math.min(supplies.value + suppliesBonusQuantity, supplies.max);
                    this.showDialogue(departDialogue, true);
                  }
                })
              }
            }
          ]
        };
        SFXSingletons['get_bonus'].play();
        this.showDialogue(notifySuppliesDialogue, true);

        // TODO: play a congratulatory sound effect
      } else {
        this.showDialogue(departDialogue, true);
      }
    } else if (hasArrivedAtPlanet) {
      RemoveComponent(shipEntity, 'OrbitNotificationComponent');
      const planetOrbitIndex = GetComponent(shipEntity, 'ShipInOrbitRangeOfPlanetComponent').planetIndex;
      const planetEntity = this.entities[planetOrbitIndex];
      const planetName = HasComponent(planetEntity, 'NameComponent') ? GetComponent(planetEntity, 'NameComponent').value : '???';

      const dialogue = {
        question: 'We\'re in range of planet ' + planetName + '\n' + 'Should we orbit for repairs and defense?',
        portrait: skipperName,
        options: [
            {
              text: '[n] No',
              keyCode: Phaser.Input.Keyboard.KeyCodes.N,
              action: () => {
                // We're keeping course, so we don't need to rotate
                this.nextTurnReady = true;
              }
            },
            {
              text: '[y] Yes',
              keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
              action: () => {
                // Dock the ship
                const orbitInfo = AddComponent(shipEntity, 'ShipOrbitingPlanetComponent', new ShipOrbitingPlanetComponent(planetOrbitIndex));
                orbitInfo.planetIndex = planetOrbitIndex;

                // Stop all movement
                const velocity = GetComponent(shipEntity, 'ForwardVelocityComponent');
                velocity.value = 0;

                this.nextTurnReady = true;
              }
            }
          ]
        };

        this.showDialogue(dialogue, true);
    } else {
      // Normal skipper check
      const dialogue = {
        question: 'Should we change our course?',
        portrait: skipperName,
        options: [
          {
            text: '[n] No',
            keyCode: Phaser.Input.Keyboard.KeyCodes.N,
            action: () => {
              // We're keeping course, so we don't need to rotate
              this.nextTurnReady = true;
            }
          },
          {
            text: '[y] Yes',
            keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
            action: () => {
              this.redirectShip(shipEntity, () => {
                this.nextTurnReady = true;
              });
            }
          }
        ]
      };

      this.showDialogue(dialogue, true);
    }
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

    if (World.snoozeGunner) {
      return;
    }

    canDoNextTurn = false;


    const gunnerName = HasComponent(entity, 'NameComponent') ? GetComponent(entity, 'NameComponent').value : undefined;

    const dialogue = {
      question: ('There ' + (candidates.value.length === 1 ? 'is ' : 'are ') + candidates.value.length + ((candidates.value.length === 1 ? ' enemy' : ' enemies')) + ' within range.\nShould we attack?'),
      portrait: gunnerName,
      options: [
        {
          text: '(0) Don\'t attack anyone',
          
          keyCode: Phaser.Input.Keyboard.KeyCodes.ZERO,
          action: () => {
            SFXSingletons['select_n'].play();
            this.nextTurnReady = true;
          }
        }
      ]
    };
    candidates.value.forEach((candidate, i) => {
      // Not the best gameplay fix, but we should avoid a crash if there are more targets than keys available
      if (i >= ENEMY_SELECTION_KEYCODES.length) {
        return;
      }
      const targetName = HasComponent(candidate, 'NameComponent') ? GetComponent(candidate, 'NameComponent').value : '???';
      dialogue.options.push({
        text: '[' + (i + 1) + '] attack ' + targetName,
        portrait: gunnerName,
        keyCode: ENEMY_SELECTION_KEYCODES[i],
        action: () => {
          SFXSingletons['select_y'].play();
          this.performAttack(shipEntity, candidate, () => { this.nextTurnReady = true; });
        }
      });
    });

    this.showDialogue(dialogue, true);
  });

  ViewEntities(nextEntity, ['EngineerComponent', 'PlayerControlComponent', 'ShipReferenceComponent', 'EngineComponent'], [], (entity, engineer, playerControl, shipReference, engine) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }

    if (World.snoozeEngineer) {
      return;
    }

    // If the ship is orbiting, the engines are halted
    if (HasComponent(shipEntity, 'ShipOrbitingPlanetComponent')) {
      const velocity = GetComponent(shipEntity, 'ForwardVelocityComponent');
      velocity.value = 0;
      return;
    }

    const engineerName = HasComponent(entity, 'NameComponent') ? GetComponent(entity, 'NameComponent').value : undefined;

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
      question: 'What speed should we set the engines to?',
      portrait: engineerName,
      options: [
        {
          text: '(0) Keep the same speed',
          keyCode: Phaser.Input.Keyboard.KeyCodes.ZERO,
          action: () => {
            SFXSingletons['select_n'].play();
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
        speedConfigName += ~~(ratio * 100);
        speedConfigName += '% - '
        speedConfigName += (speedValue.toFixed(2) + ' ' + UNIT_PLURAL);
      }
      const key = ENEMY_SELECTION_KEYCODES[i];
      dialogue.options.push({
        text: speedConfigName,
        keyCode: key,
        action: () => {
          SFXSingletons['select_y'].play();
          const velocity = GetComponent(shipEntity, 'ForwardVelocityComponent');
          velocity.value = speedValue;
          this.nextTurnReady = true;
        }
      });
    }
    this.showDialogue(dialogue, true);
  });

  ViewEntities(nextEntity, ['ShieldOperatorComponent', 'PlayerControlComponent', 'ShipReferenceComponent'], [], (entity, shieldOperator, playerControl, shipReference) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }

    if (World.snoozeShields) {
      return;
    }

    const areShieldsAlreadyRaised = HasComponent(shipEntity, 'ShieldsUpComponent');

    const shieldOpName = HasComponent(entity, 'NameComponent') ? GetComponent(entity, 'NameComponent').value : undefined;

    canDoNextTurn = false;


    if (!areShieldsAlreadyRaised) {
        const dialogue = {
          question: 'Should we raise the shields?',
          portrait: shieldOpName,
          options: [
            {
              text: '[n] No',
              keyCode: Phaser.Input.Keyboard.KeyCodes.N,
              action: () => {
                this.nextTurnReady = true;
              }
            },
            {
              text: '[y] Yes',
              keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
              action: () => {
                AddComponent(shipEntity, 'ShieldsUpComponent', new ShieldsUpComponent());
                this.nextTurnReady = true;
              }
            }
          ]
        };
    
        this.showDialogue(dialogue, true);
      } else {
        const dialogue = {
          question: 'Should we lower the shields to let them recharge?',
          portrait: shieldOpName,
          options: [
            {
              text: '[n] No',
              keyCode: Phaser.Input.Keyboard.KeyCodes.N,
              action: () => {
                this.nextTurnReady = true;
              }
            },
            {
              text: '[y] Yes',
              keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
              action: () => {
                RemoveComponent(shipEntity, 'ShieldsUpComponent');
                this.nextTurnReady = true;
              }
            }
          ]
        };
    
        this.showDialogue(dialogue, true);
      }
  });

  // If your target is outside of your aggro range, remove it
  ViewEntities(nextEntity, ['PositionComponent', 'AggroComponent'], [], (entity, position, aggro) => {
    const targetEntity = this.entities[aggro.targetIndex];
    if (targetEntity === undefined) {
      return
    }
    const targetPosition = GetComponent(targetEntity, 'PositionComponent');
    const distance = Phaser.Math.Distance.Squared(position.x, position.y, targetPosition.x, targetPosition.y);
    const aggroRangeSquared = aggro.range * aggro.range;
    if (distance > aggroRangeSquared) {
      
      RemoveComponent(entity, 'AggroComponent')
    }
  });

  ViewEntities(nextEntity, ['PositionComponent', 'PursueIfInRangeComponent', 'AIControlComponent', 'TeamComponent', 'HullHealthComponent'], ['AggroComponent', 'DestroyedComponent'], (entity, position, pursueIf, aiControl, myTeam) => {
    const pursueRangeSquared = pursueIf.range * pursueIf.range;
    let candidate = null
    ViewEntities(this.entities, ['PositionComponent', 'HullHealthComponent', 'TeamComponent'], [], (potentialTarget, potentialTargetPosition, potentialTargetHealth, potentialTargetTeam) => {
      if (potentialTargetTeam.value === myTeam.value) {
        return;
      }

      const distanceSq = Phaser.Math.Distance.Squared(position.x, position.y, potentialTargetPosition.x, potentialTargetPosition.y);
      if (distanceSq <= pursueRangeSquared) {
          candidate = potentialTarget;
      }
    });
    if (candidate !== null) {
      const candidateIndex = GetComponent(candidate, 'ECSIndexComponent').value;
      AddComponent(entity, 'AggroComponent', new AggroComponent(candidateIndex, pursueIf.range));
      
    }
  });

  // Update AI ship crew to match aggro
  ViewEntities(nextEntity, ['ShipReferenceComponent', 'AIControlComponent'], [], (entity, shipReference, aiControl) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }

    if (HasComponent(shipEntity, 'AggroComponent')) {
      const aiAggro = GetComponent(shipEntity, 'AggroComponent');
      AddComponent(entity, 'AggroComponent', aiAggro);
    } else {
      if (HasComponent(entity, 'AggroComponent')) {
        RemoveComponent(entity, 'AggroComponent');
      }
    }
  });

  // If you're not targeting anything, you can dawdle
  ViewEntities(nextEntity, ['EngineerComponent', 'AIControlComponent', 'ShipReferenceComponent', 'EngineComponent'], ['AggroComponent'], (entity, engineer, aiControl, shipReference, engine) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }

    // TODO: make AI engineers set engines intelligently
    const velocity = GetComponent(shipEntity, 'ForwardVelocityComponent');
    velocity.value = 0;
  });

  // If you've found a target, move towards them
  ViewEntities(nextEntity, ['EngineerComponent', 'AIControlComponent', 'ShipReferenceComponent', 'EngineComponent', 'AggroComponent'], [], (entity, engineer, aiControl, shipReference, engine, aggro) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }
    const shipPostion = GetComponent(shipEntity, 'PositionComponent');

    const targetEntity = this.entities[aggro.targetIndex];
    if (targetEntity === undefined) {
      RemoveComponent(entity, 'AggroComponent');
      return;
    }
    const targetPosition = GetComponent(targetEntity, 'PositionComponent');
    const distance = Phaser.Math.Distance.Between(targetPosition.x, targetPosition.y, shipPostion.x, shipPostion.y);
    const speedToGo = engine.maxSpeed

    
    const velocity = GetComponent(shipEntity, 'ForwardVelocityComponent');
    velocity.value = speedToGo;
  });

  ViewEntities(nextEntity, ['GunnerComponent', 'AIControlComponent', 'ShipReferenceComponent'], ['OnlyAttackIfPursuingComponent', 'AggroComponent'], (entity, gunner, aiControl, shipReference) => {
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

    const candidatePick = ~~(ROT.RNG.getUniform() * candidates.value.length);
    this.performAttack(shipEntity, candidates.value[candidatePick], () => { this.nextTurnReady = true; });
  });

  ViewEntities(nextEntity, ['GunnerComponent', 'AIControlComponent', 'ShipReferenceComponent', 'AggroComponent'], [], (entity, gunner, aiControl, shipReference, aggro) => {
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

    candidates.value.forEach((candidate) => {
      if (!HasComponent(candidate, 'ECSIndexComponent')) {
        return;
      }
      const candidateIndex = GetComponent(candidate, 'ECSIndexComponent').value;
      if (candidateIndex !== aggro.targetIndex) {
        return;
      }

      
      canDoNextTurn = false;
      this.performAttack(shipEntity, candidate, () => { this.nextTurnReady = true; });
    });
  });

  // Dawdle
  ViewEntities(nextEntity, ['SkipperComponent', 'AIControlComponent', 'ShipReferenceComponent'], ['AggroComponent'], (entity, skipper, ai, shipRef) => {
    // TODO: make better skipper AI
    const shipIndex = shipRef.value;
    const shipToControl = this.entities[shipIndex];
    if (shipToControl === undefined) {
      return;
    }

    // Don't bother trying to orbit
    if (HasComponent(shipToControl, 'OrbitNotificationComponent')) {
      RemoveComponent(shipToControl, 'OrbitNotificationComponent');
    }

    const rotation = GetComponent(shipToControl, 'RotationComponent');
    rotation.value += 0.8;
  });

  // Pursue
  ViewEntities(nextEntity, ['SkipperComponent', 'AIControlComponent', 'ShipReferenceComponent', 'AggroComponent'], [], (entity, skipper, ai, shipRef, aggro) => {
    // TODO: make better skipper AI
    const shipIndex = shipRef.value;
    const shipToControl = this.entities[shipIndex];
    if (shipToControl === undefined) {
      return;
    }
    const shipPostion = GetComponent(shipToControl, 'PositionComponent');

    const targetEntity = this.entities[aggro.targetIndex];
    if (targetEntity === undefined) {
      RemoveComponent(entity, 'AggroComponent');
      return;
    }
    const targetPosition = GetComponent(targetEntity, 'PositionComponent');

    // Don't bother trying to orbit
    if (HasComponent(shipToControl, 'OrbitNotificationComponent')) {
      RemoveComponent(shipToControl, 'OrbitNotificationComponent');
    }

    if (HasComponent(entity, 'MessageOnceInAttackRangeComponent')) {
      canDoNextTurn = false;

      const message = GetComponent(entity, 'MessageOnceInAttackRangeComponent').value;
      const dialogue = {
        question: message,
        portrait: (HasComponent(shipToControl, 'PortraitComponent') ? GetComponent(shipToControl, 'PortraitComponent').value : undefined),
        options: [
          {
            text: '[y] OK',
            keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
            action: () => {
              this.time.addEvent({
                delay: 32,
                callback: () => {
                  this.nextTurnReady = true;
                }
              })
            }
          }
        ]
      };
      this.showDialogue(dialogue);

      const sound = GetComponent(entity, 'MessageOnceInAttackRangeComponent').sound;
      if (sound) {
        SFXSingletons[sound].play();
      }
      RemoveComponent(entity, 'MessageOnceInAttackRangeComponent');
    }

    const rotation = GetComponent(shipToControl, 'RotationComponent');
    rotation.value = Math.atan2(targetPosition.y - shipPostion.y, targetPosition.x - shipPostion.x);
  });

  ViewEntities(nextEntity, ['ShieldOperatorComponent', 'AIControlComponent', 'ShipReferenceComponent'], [], (entity, shieldOperator, playerControl, shipReference) => {
    const shipEntity = this.entities[shipReference.value];
    if (shipEntity === undefined) {
      return;
    }
    const areShieldsAlreadyRaised = HasComponent(shipEntity, 'ShieldsUpComponent');
    if (areShieldsAlreadyRaised) {
      if (!HasComponent(entity, 'AggroComponent')) {
        RemoveComponent(shipEntity, 'ShieldsUpComponent');
      }
      return;
    }

    // TODO: Make interesting shields AI 
    if (HasComponent(entity, 'AggroComponent')) {
      AddComponent(shipEntity, 'ShieldsUpComponent', new ShieldsUpComponent());
    }
  });

  ViewEntities(nextEntity, ['AIControlComponent', 'PositionComponent', 'ShipReferenceComponent'], [], (entity, aiControl, position, shipRef) => {
    // TODO: add ai stuff
  });

  ViewEntities(nextEntity, ['PositionComponent', 'ShipOrbitingPlanetComponent', 'RotationComponent'], [], (entity, position, orbiting, rotation) => {
    // TODO Make nice rotation animation
  });

  ViewEntities(nextEntity, ['PositionComponent', 'ForwardVelocityComponent', 'RotationComponent'], ['ShipOrbitingPlanetComponent'], (entity, position, velocity, rotation) => {
    position.x += Math.cos(rotation.value) * velocity.value;
    position.y += Math.sin(rotation.value) * velocity.value;

    let skipTween = false;
    if (HasComponent(entity, 'MessageOnceInAttackRangeComponent') && HasComponent(entity, 'AttackCandidatesComponent') && HasComponent(entity, 'AIControlComponent')) {
      let foundTarget = false;
      GetComponent(entity, 'AttackCandidatesComponent').value.forEach((candidate) => {
        if (HasComponent(candidate, 'PlayerControlComponent')) {
          foundTarget = true;
        }
      });

      if (foundTarget) {
        skipTween = true;
        canDoNextTurn = false;

        const message = GetComponent(entity, 'MessageOnceInAttackRangeComponent').value;
        const dialogue = {
          question: message,
          portrait: (HasComponent(entity, 'PortraitComponent') ? GetComponent(entity, 'PortraitComponent').value : undefined),
          options: [
            {
              text: '[y] OK',
              keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
              action: () => {
                this.time.addEvent({
                  delay: 32,
                  callback: () => {
                    this.nextTurnReady = true;
                  }
                })
              }
            }
          ]
        };
        this.showDialogue(dialogue);

        const sound = GetComponent(entity, 'MessageOnceInAttackRangeComponent').sound;
        if (sound) {
          SFXSingletons[sound].play();
        }
        RemoveComponent(entity, 'MessageOnceInAttackRangeComponent');
      }
    }

    const distToCameraSquared = Phaser.Math.Distance.Squared(position.x, position.y, this.gameCameraPos.x, this.gameCameraPos.y);

    if ((!skipTween) && ( distToCameraSquared < CAMERA_DIST_TWEEN_SNAP_SQUARED ) && HasComponent(entity, 'MeshComponent') && (GetComponent(entity, 'MeshComponent').mesh !== null)) {
      const mesh = GetComponent(entity, 'MeshComponent');

      const lineGeom  = new THREE.BufferGeometry().setFromPoints( [mesh.mesh.position, new THREE.Vector3(position.x, 0, position.y)] );
      const pathLine = new THREE.Line(lineGeom, PATH_LINE_COLOR);
      this.three.scene.add(pathLine);

      let tween = this.add.tween({
        targets: mesh.mesh.position,
        x: Math.max(0, Math.min(position.x, SECTOR_WIDTH)),
        z: Math.max(0, Math.min(position.y, SECTOR_HEIGHT)),
        duration: 150 * velocity.value,
        onComplete: () => {
          this.nextTurnReady = true;
          RemoveComponent(entity, 'PositionTweenComponent');
          tween.stop();
          this.three.scene.remove(pathLine);
        }
      });

      if (HasComponent(entity, 'PositionTweenComponent')) {
        throw new Error('attempted to tween a mesh twice! this shouldn\'t happen');
      }
      AddComponent(entity, 'PositionTweenComponent', new PositionTweenComponent(tween));
      canDoNextTurn = false;

    }
  });

  ViewEntities(nextEntity, ['PositionComponent', 'ShipOrbitingPlanetComponent', 'RotationComponent', 'MeshComponent'], [], (entity, position, orbiting, rotation, mesh) => {
    const orbitIndex = orbiting.planetIndex;
    const planet = this.entities[orbitIndex];
    const planetPosition = GetComponent(planet, 'PositionComponent');
    const planetOrbitRadius = GetComponent(planet, 'PlanetOrbitableComponent').dockRange;
    const planetPhysicalRadius = GetComponent(planet, 'PlanetViewDataComponent').radius;

    const currentRotationToPlanet = Math.atan2(position.y - planetPosition.y, position.x - planetPosition.x);
    const nextRotationToPlanet = currentRotationToPlanet + ORBIT_ROTATION_PER_TURN;
    const targetRadius = (planetPhysicalRadius + planetOrbitRadius) * 0.5;
    const targetPositionX = planetPosition.x + (Math.cos(nextRotationToPlanet) * targetRadius);
    const targetPositionY = planetPosition.y + (Math.sin(nextRotationToPlanet) * targetRadius);

    position.x = targetPositionX;
    position.y = targetPositionY;

    rotation.value = (nextRotationToPlanet + (Math.PI * 0.5));

    canDoNextTurn = false;

    let tween = this.add.tween({
      targets: mesh.mesh.position,
      x: Math.max(0, Math.min(position.x, SECTOR_WIDTH)),
      z: Math.max(0, Math.min(position.y, SECTOR_HEIGHT)),
      duration: 630,
      onComplete: () => {
        this.nextTurnReady = true;
        RemoveComponent(entity, 'PositionTweenComponent');
        tween.stop();
      }
    });

    if (HasComponent(entity, 'PositionTweenComponent')) {
      RemoveComponent(entity, 'PositionTweenComponent')
    }
    AddComponent(entity, 'PositionTweenComponent', new PositionTweenComponent(tween));
  });

  // Ensure AI entities don't go off the sector
  ViewEntities(nextEntity, ['PositionComponent', 'RotationComponent', 'ForwardVelocityComponent'], ['PlayerControlComponent'], (entity, position, rotation, velocity) => {
    const err = 0.001;

    let flipped = false;

    if (position.x < 0) {
      position.x = err;
      flipped = true;
    } else if (position.x > SECTOR_WIDTH) {
      position.x = SECTOR_WIDTH - err;
      flipped = true;
    }

    if (position.y < 0) {
      position.y = err;
      flipped = true;
    } else if (position.y > SECTOR_HEIGHT) {
      position.y = SECTOR_HEIGHT - err;
      flipped = true;
    }

    if (flipped) {
      velocity.value += Math.PI;
    }
  });

  // If the player is in the corners of the world, don't let them leave the map
  ViewEntities(nextEntity, ['PositionComponent', 'RotationComponent', 'PlayerControlComponent'], [], (entity, position, rotation) => {
    const err = 0.001;

    let flipped = false;

    const currentSector = World.getCurrentSector();

    if ((position.x < 0) && (currentSector.x === 0)) {
      position.x = err;
      flipped = true;
    } else if ((position.x > SECTOR_WIDTH) && (currentSector.x === (World.width - 1))) {
      position.x = SECTOR_WIDTH - err;
      flipped = true;
    }

    if ((position.y < 0) && (currentSector.y === 0)) {
      position.y = err;
      flipped = true;
    } else if ((position.y > SECTOR_HEIGHT) && (currentSector.y === (World.height - 1))) {
      position.y = SECTOR_HEIGHT - err;
      flipped = true;
    }

    if (flipped) {
      rotation.value += Math.PI;
    }
  });

  // Deal with destruction; remove meshes for entities that should be destroyed
  ViewEntities(this.entities, ['DestroyedComponent', 'MeshComponent'], [], (entity, destroyed, mesh) => {
    // Wait until a mesh is loaded
    if (mesh.mesh === null) {
      return;
    }

    // If we run out of supplies, don't bother removing the mesh from the scene, since it didn't blow up.
    if (HasComponent(entity, 'SuppliesComponent') && (GetComponent(entity, 'SuppliesComponent').value < 1)) {
      const supplies = GetComponent(entity, 'SuppliesComponent');
      if (supplies.value < 1) {
        if (HasComponent(entity, 'PositionTweenComponent')) {
          const positionTween = GetComponent(entity, 'PositionTweenComponent');

          positionTween.value.stop();
          RemoveComponent(entity, 'PositionTweenComponent');

          let t = this.add.tween({
            targets: mesh.mesh.rotation,
            x: 0.6932 * (Math.random() < 0.5 ? 1 : -1),
            duration: 21876
          });
        }

        return;
      }
    } else {
      delete mesh.mesh.entityRef;
      this.three.scene.remove(mesh.mesh);
    }
    
    RemoveComponent(entity, 'MeshComponent');
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

  // Update depleting shields
  ViewEntities(this.entities, ['ShieldsComponent', 'ShieldsUpComponent'], [], (entity, shields) => {
    shields.health = shields.health - SHIELD_DEPLETE_RATE;

    // TODO: add notification that shields depleted
    if (shields.health <= 0) {
      shields.health = 0;
      RemoveComponent(entity, 'ShieldsUpComponent');
    }
  });

  // Update recharching shields
  ViewEntities(this.entities, ['ShieldsComponent'], ['ShieldsUpComponent'], (entity, shields) => {
    shields.health = Math.min(shields.health + SHIELD_REGEN_RATE, shields.maxHealth);
  });

  // Update repairing ships in orbit
  ViewEntities(this.entities, ['ShipOrbitingPlanetComponent', 'HullHealthComponent'], [], (entity, orbiting, hull) => {
    let engineerDexterity = FALLBACK_ENGINEER_DEXTERITY;

    // Find the highest dex of an engineer that matches this ship
    ViewEntities(this.entities, ['EngineerComponent', 'DexterityComponent', 'ShipReferenceComponent'], [], (entity, dex, shipRef) => {
      const shipCandidate = this.entities[shipRef.value];
      if (shipCandidate === undefined) {
        return;
      }
      if (shipCandidate !== entity) {
        return;
      }

      engineerDexterity = Math.max(engineerDexterity, dex.value);
    });
    hull.health = Math.min(hull.health + (PLANET_REPAIR_RATIO * engineerDexterity), hull.maxHealth);
  });

  ViewEntities(this.entities, ['DestroyedComponent', 'PlayerControlComponent', 'HullHealthComponent'], [], (entity, destroyed, playerControl, hullHealthComponent) => {
    const questionText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'century', 'GAME OVER', 32);
    questionText.setCenterAlign();
    questionText.setOrigin(0.5);
    this.time.addEvent({
      delay: 400,
      callback: () => { SFXSingletons['game_over'].play(); }
    });

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const questionText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.75, 'miniset', 'press space to go back to the title screen', DEFAULT_TEXT_SIZE);
        questionText.setCenterAlign();
        questionText.setOrigin(0.5);

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('down', () => {
          for (let i = 0; i < BGMSingletons.length; i++) {
            BGMSingletons[i].volume = 0;
          }
          this.scene.start('CDRomScreen');
        });
      }
    })

    if (HasComponent(entity, 'SuppliesComponent')) {
      const supplies = GetComponent(entity, 'SuppliesComponent');
      if (supplies.value < 1) {
        questionText.text = 'GAME OVER\nOut of Supplies';
      }
    }
  });

  let maxVolumeFound = -1;
  ViewEntities(this.entities, ['AudioTensionComponent'], ['MuteAudioTensionComponent'], (entity, audio) => {
    maxVolumeFound = Math.max(audio.value, maxVolumeFound);
  });
  for (let i = 0; i < BGMSingletons.length; i++) {
    const highEnough = i <= maxVolumeFound;
    BGMSingletons[i].volume = Phaser.Math.Interpolation.SmoothStep(0.1, BGMSingletons[i].volume, highEnough ? MAX_VOLUME : 0);
  }

  // Set entities that don't exist anymore to undefined
  for (let i = 0; i < this.entities.length; i++) {
    if (this.entities[i] === undefined) {
      continue;
    }

    if (HasComponent(this.entities[i], 'DestroyedComponent')) {
      this.entities[i] = undefined;
    }
  }

  // If we've survived this far and the player has moved outside the sector,
  // then begin the gameplay again in the next sector
  if (!(this.exiting)) {
    ViewEntities(this.entities, ['PositionComponent', 'PlayerControlComponent', 'HullHealthComponent', 'ForwardVelocityComponent'], [], (entity, position, playerControl, hullHealth, velocity) => {
      if ((position.x < 0) || (position.x > SECTOR_WIDTH) || (position.y < 0) || (position.y > SECTOR_HEIGHT)) {
        this.exiting = true;

        const err = 0.001;

        this.cameras.cameras[0].fade(4500);
        this.time.addEvent({
          delay: 5000,
          callback: () => {
            const oldSector = { x: World.currentPlayerSector.x, y: World.currentPlayerSector.y };
            // Update the player to be in the correct sector and have the correct relative position
            if (position.x < 0) {
              position.x = SECTOR_WIDTH - err;
              position.y = SECTOR_HEIGHT * 0.5;
              World.currentPlayerSector.x--;
            } else if (position.x > SECTOR_WIDTH) {
              position.x = err;
              position.y = SECTOR_HEIGHT * 0.5;
              World.currentPlayerSector.x++;
            } else if (position.y < 0) {
              position.x = SECTOR_WIDTH * 0.5;
              position.y = SECTOR_HEIGHT - err;
              World.currentPlayerSector.y--;
            } else if (position.y > SECTOR_HEIGHT) {
              position.x = SECTOR_WIDTH * 0.5;
              position.y = err;
              World.currentPlayerSector.y++;
            } else {
              throw new Error('Player exited but is outside the bounds of the sector. This shouldn\t happen');
            }

            // Remove all temp components
            RemoveComponentFromAllEntities(this.entities, 'ShipInOrbitRangeOfPlanetComponent');
            RemoveComponentFromAllEntities(this.entities, 'AggroComponent');

            // Go to the next sector
            this.scene.start('WorldMapScreen', {
              previousPlayerSector: oldSector
            });
          }
        })
      }
    });
  }
};

Gameplay.prototype.showDialogue = function(dialogue, hideBG) {
  let texts = [];
  let keys = [];

  const backing = PointsSelectionScreen.prototype.create9Slice.call(this, GAME_WIDTH * 0.25, GAME_HEIGHT * 0.2 + (dialogue.portrait ? -16 : 0), GAME_WIDTH * 0.5, GAME_HEIGHT  * 0.4 + ((dialogue.options.length - 2) * DEFAULT_TEXT_SIZE) +  + (dialogue.portrait ? 16 : 0));
  backing.scaleY = 0;
  const t = this.add.tween({
    targets: backing,
    scaleY: 1.0,
    duration: 300,
    easing: Phaser.Math.Easing.Cubic.In
  });

  if (!hideBG) {
    if (this.keys.hide_box) {
      this.keys.hide_box.once('down', () => { backing.visible = false; }); 
      const hideText = this.add.bitmapText(4,  GAME_HEIGHT  * 0.4 + ((dialogue.options.length - 2) * DEFAULT_TEXT_SIZE) - (DEFAULT_TEXT_SIZE + 4) + (dialogue.portrait ? 16 : 0), 'miniset', 'Press [shift] to hide this box', DEFAULT_TEXT_SIZE);
      backing.add(hideText);
    }
  } else {
    backing.visible = false;
  }

  let portrait = null;

  const removeAllUIAndEvents = () => {
    keys.forEach((key) => {
      key.removeAllListeners('down');
    });

    texts.forEach((text) => {
      text.destroy();
    });

    if (portrait !== null) {
      portrait.destroy();
    }

    const t = this.add.tween({
      targets: backing,
      scaleY: 0.0,
      duration: 200,
      easing: Phaser.Math.Easing.Cubic.In,
      onComplete: () => { backing.destroy(); }
    })
  };

  if (dialogue.portrait) {
    portrait = this.add.sprite(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.2 + 8, 'portraits', frames[0]);
    portrait.anims.load(dialogue.portrait);
    portrait.anims.play(dialogue.portrait);
  }

  const questionText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.35, 'miniset', dialogue.question, DEFAULT_TEXT_SIZE);
  questionText.setCenterAlign();
  questionText.setOrigin(0.5);
  texts.push(questionText);
  for (let i = 0; i < dialogue.options.length; i++) {
    const option = dialogue.options[i];

    let optionText = this.add.bitmapText(GAME_WIDTH * 0.5, (GAME_HEIGHT * 0.35) + DEFAULT_TEXT_SIZE + (DEFAULT_TEXT_SIZE * (i + 1.2)), 'miniset', option.text, DEFAULT_TEXT_SIZE);
    optionText.setCenterAlign();
    optionText.setOrigin(0.5);
    texts.push(optionText);

    let key = this.input.keyboard.addKey(option.keyCode);
    key.once('down', () => {
      if (option.keyCode === Phaser.Input.Keyboard.KeyCodes.Y) {
        SFXSingletons['select_y'].play();
      } else if (option.keyCode === Phaser.Input.Keyboard.KeyCodes.N) {
        SFXSingletons['select_n'].play();
      }
      removeAllUIAndEvents(); option.action();
    });
    keys.push(key);
  }
};

const LaserSounds = ['laser0', 'laser1', 'laser2'];
const HitSounds = ['hit0', 'hit1', 'hit2'];
const ExplosionSounds = ['explosion0', 'explosion1', 'explosion2'];

Gameplay.prototype.performAttack = function(attackingEntity, defendingEntity, onComplete) {
  const hasRNDDrop = (HasComponent(defendingEntity, 'RNDBountyComponent') && HasComponent(attackingEntity, 'PlayerControlComponent'));

  let attackPower = HasComponent(attackingEntity, 'AttackStrengthComponent') ? GetComponent(attackingEntity, 'AttackStrengthComponent').value : 0;
  let damage = attackPower;

  // If you get attacked and want to hit back, you can use this for aggro range
  if (HasComponent(defendingEntity, 'PursueIfAttackedComponent')) {
    AddComponent(defendingEntity, 'AggroComponent', new AggroComponent(GetComponent(attackingEntity, 'ECSIndexComponent').value, 99999));
  }

  // TODO: add shields into damage calculation
  if (HasComponent(defendingEntity, 'ShieldsComponent') && HasComponent(defendingEntity, 'ShieldsUpComponent')) {
    const shields = GetComponent(defendingEntity, 'ShieldsComponent');
    if (shields.health >= (attackPower * SHIELD_BUFFER_RATIO)) {
      shields.health -= (attackPower * SHIELD_BUFFER_RATIO);
      damage = 0;
    } else {
      damage -= shields.health;
      shields.health = 0;
    }
  }

  const defenderHealthData = GetComponent(defendingEntity, 'HullHealthComponent');
  defenderHealthData.health -= damage;

  const attackingEntityPosition = GetComponent(attackingEntity, 'PositionComponent');
  const defendingEntityPosition = GetComponent(defendingEntity, 'PositionComponent');
  const numberOfLasersToFire = Math.max(1, Math.ceil(attackPower * 0.08));
  const numberOfExplosions = Math.ceil(damage * 0.6);
  // Make an explosion for each laser hit
  for (let i = 0; i < numberOfExplosions; i++) {
    const m = this.explosions[this.currentExplosionIndex];
    this.currentExplosionIndex = (this.currentExplosionIndex + 1) % this.explosions.length;

    m.position.set(defendingEntityPosition.x + ROT.RNG.getNormal(0, 1.5), 0.5 + (Math.random() * 1.01), defendingEntityPosition.y + ROT.RNG.getNormal(0, 1.5));
    m.scale.set(0.0001, 0.0001, 0.0001);
    const t = this.add.tween({
      targets: m.scale,
      x: 0.432,
      y: 0.432,
      z: 0.432,
      yoyo: true,
      duration: 50 + (ROT.RNG.getNormal(100, 90)),
      ease: 'Power2',
      delay: (460 + ~~(Math.random() * 500)),
      onStart: () => { SFXSingletons[HitSounds[~~(Math.random() * HitSounds.length)]].play(); },
      onComplete: () => { m.position.set(0, -99999, 0); }
    });
  }

  for (let i = 0; i < numberOfLasersToFire; i++) {
    const nextLaser = this.lasers[this.currentLaserIndex];
    this.currentLaserIndex = (this.currentLaserIndex + 1) % this.lasers.length;

    nextLaser.position.set(attackingEntityPosition.x+ ((Math.random() * 2) - 1.0), 1.5, attackingEntityPosition.y + ((Math.random() * 2) - 1.0));
    const targetX = defendingEntityPosition.x + ((Math.random() * 2) - 1.0);
    const targetY = (Math.random() * 2.0) - 0.5;
    const targetZ = defendingEntityPosition.y + ((Math.random() * 2) - 1.0);
    nextLaser.lookAt(targetX, targetY, targetZ);
    const ind = i;

    let t = this.add.tween({
      targets: nextLaser.position,
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: (400),
      delay: (i * 152),
      easing: Phaser.Math.Easing.Cubic.Out,
      onStart: () => {
        if (ind % 2 === 0) {
          SFXSingletons[LaserSounds[~~(LaserSounds.length * Math.random())]].play();
        }
        nextLaser.visible = true;
      },
      onComplete: () => {
        nextLaser.visible = false;
        if (ind === (numberOfLasersToFire - 1)) {
          this.time.addEvent({
            delay: (221 + ~~(Math.random() * 30)),
            callback: () => {
              if (!hasRNDDrop || (!(defenderHealthData.health <= 0))) {
                onComplete();
                return;
              }

              const bounty = GetComponent(defendingEntity, 'RNDBountyComponent').value;
              RemoveComponent(defendingEntity, 'RNDBountyComponent');
              const enemyShipName = GetComponent(defendingEntity, 'NameComponent').value;
              const skipperPortrait = 'bryce'; // TODO: make this data-driven

              const congratsDialog = {
                question: enemyShipName + ' dropped special technology!\nWe can add ' + bounty + ' R&D Units to our ship!',
                portrait: skipperPortrait,
                options: [{
                  text: '[y] Spend Points',
                  keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
                  action: () => {
                    this.lockRotating = true;
                    this.scene.launch('PointsSelectionScreen', {
                      pointsToSpend: bounty,
                      existingConfig: World.currentConfig,
                      playerEntities: this.entities,
                      shipIndex: GetComponent(attackingEntity, 'ECSIndexComponent').value,
                      onComplete: (newConfigWithAllocatedPoints) => {
                        const basePointsPlusExtra = CombineTwoPointsConfigurations(World.currentConfig, newConfigWithAllocatedPoints);
                        basePointsPlusExtra.applyToShipEntity(attackingEntity, this.entities, true);
                        World.currentConfig = basePointsPlusExtra;

                        this.lockRotating = false;
                        onComplete();
                      }
                    });
                  }
                },
                {
                  text: '[n] Skip',
                  keyCode: Phaser.Input.Keyboard.KeyCodes.N,
                  action: () => {
                    onComplete();
                  }
                }]
              };


              SFXSingletons['get_bonus'].play();
              this.showDialogue(congratsDialog, true);
            }
          });
        }
      }
    });
  }

  if (defenderHealthData.health <= 0) {
    const explosionMass = HasComponent(defendingEntity, 'MassComponent') ? GetComponent(defendingEntity, 'MassComponent').value : 2;
    for (let i = 0; i < 3; i++) {
      const m = this.explosions[this.currentExplosionIndex];
      this.currentExplosionIndex = (this.currentExplosionIndex + 1) % this.explosions.length;

      m.position.set(defendingEntityPosition.x + (Math.random() * 1.5 - 0.75) + (explosionMass * 0.5), 0 + (Math.random() * 0.76 - 0.3412), defendingEntityPosition.y + (Math.random() * 1.5 - 0.75 + (explosionMass * 0.5)));
      m.scale.set(0.001, 0.001, 0.001);
      const t = this.add.tween({
        targets: m.scale,
        x: explosionMass,
        y: explosionMass,
        z: explosionMass,
        yoyo: true,
        duration: 500,
        ease: 'Power2',
        delay: (i * 167)
      });
    }

    if (HasComponent(defendingEntity, 'MeshComponent')) {
      const mesh = GetComponent(defendingEntity, 'MeshComponent');
      if (mesh.mesh !== null) {
        mesh.mesh.visible = false;
      }
    }
    SFXSingletons[ExplosionSounds[~~(Math.random() * ExplosionSounds.length)]].play();
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

  let promptText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.25, 'miniset', 'Hold A or D to redirect.\n Press enter to confirm.', DEFAULT_TEXT_SIZE);
  promptText.setCenterAlign();

  const shipRotation = GetComponent(shipEntityToRedirect, 'RotationComponent');

  // Create an arrow
  let rotation = shipRotation.value;

  // Poll for keys to rotate the arrow
  const directionArrow = new THREE.ArrowHelper(new THREE.Vector3(1.0, 0.0, 0.0), new THREE.Vector3(shipPostion.x, 0.0, shipPostion.y), 5.2, 0xFF0000, 1.0, 1.0);
  this.three.scene.add(directionArrow);

  const updateArrowDir = (theta) => {
    directionArrow.setDirection(new THREE.Vector3(Math.cos(theta), 0.0, Math.sin(theta)));
  };
  updateArrowDir(rotation);

  const updateArrowPerTick = () => {
    if (this.keys.cam_right.isDown) {
      rotation -= CAMERA_TURN_SPEED;
    } else if (this.keys.cam_left.isDown) {
      rotation += CAMERA_TURN_SPEED;
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
const rotationSetViewVector = new THREE.Vector3(0, 0, 0);

const loader = new THREE.GLTFLoader();
Gameplay.prototype.updateViewSystems = function() {
  // If something needs a dummy 3D cube, add it
  ViewEntities(this.entities, ['MeshComponent', 'RequestDummy3DAppearanceComponent'], [], (entity, mesh, request3D) => {
    mesh.mesh = new THREE.Mesh( DUMMY_3D_CUBE_GEOM, new THREE.MeshBasicMaterial( { color: request3D.hexColor } ) );
    mesh.mesh.entityRef = entity;
    this.three.scene.add(mesh.mesh);
  });
  RemoveComponentFromAllEntities(this.entities, 'RequestDummy3DAppearanceComponent');

  ViewEntities(this.entities, ['MeshComponent', 'RequestShield3DAppearanceComponent'], [], (entity, mesh, request3D) => {
    mesh.mesh = new THREE.Mesh( SHIELDS_GEOM, SHIELDS_MAT );
    mesh.mesh.scale.set(request3D.radius, request3D.radius, request3D.radius);
    mesh.mesh.entityRef = entity;
    this.three.scene.add(mesh.mesh);
  });
  RemoveComponentFromAllEntities(this.entities, 'RequestShield3DAppearanceComponent');

  ViewEntities(this.entities, ['MeshComponent', 'RequestGLTF3DAppearanceComponent'], [], (entity, mesh, request3D) => {
    const gltfBinary = this.cache.binary.get(request3D.meshName);
    loader.parse(gltfBinary, 'asset/model/', (gltfData) => {
      // The mesh must be the only object in the scene
      mesh.mesh = gltfData.scene.children[0];
      mesh.mesh.entityRef = entity;
      this.three.scene.add(mesh.mesh);
    });
  });
  RemoveComponentFromAllEntities(this.entities, 'RequestGLTF3DAppearanceComponent');

  ViewEntities(this.entities, ['MeshComponent', 'RequestPlanetAppearanceComponent', 'PlanetViewDataComponent'], [], (entity, mesh, request3D, viewData) => {
    const vertexInfp = this.cache.shader.get('planet_vertex');
    const vert = vertexInfp.fragmentSrc;

    const fragmentInfo = this.cache.shader.get('planet_fragment');
    const frag = fragmentInfo.fragmentSrc;

    const geometry = new THREE.SphereBufferGeometry( viewData.radius, 9, 5 );
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        color1: new THREE.Uniform(viewData.color1),
        color2: new THREE.Uniform(viewData.color2),
        color3: new THREE.Uniform(viewData.color3),
        scaleNoise: new THREE.Uniform(2.0),
        deRes: new THREE.Uniform(1),
        displayShadow: new THREE.Uniform(1)
      }
    });

    mesh.mesh = new THREE.Mesh( geometry, material );
    mesh.mesh.entityRef = entity;
    this.three.scene.add(mesh.mesh);
  });
  // TODO: add requests for GLTF models
  RemoveComponentFromAllEntities(this.entities, 'RequestPlanetAppearanceComponent');

  // Update dummy mesh positions
  ViewEntities(this.entities, ['PositionComponent', 'MeshComponent'], ['PositionTweenComponent'], (entity, position, mesh) => {
    if (mesh.mesh === null) {
      return;
    }

    mesh.mesh.position.x = position.x;
    mesh.mesh.position.z = position.y;
  });

  ViewEntities(this.entities, ['MeshComponent', 'MeshPositionMatchComponent'], [], (entity, mesh, match) => {
    const otherEntity = this.entities[match.matchIndex];
    if (!otherEntity) {
      RemoveComponent(entity, 'MeshPositionMatchComponent');
      return;
    }
    if (!(mesh.mesh)) {
      return;
    }
    if (!HasComponent(otherEntity, 'MeshComponent')) {
      return;
    }
    const otherMesh = GetComponent(otherEntity, 'MeshComponent');
    if (otherMesh.mesh === null) {
      return;
    }
    mesh.mesh.position.x = otherMesh.mesh.position.x;
    mesh.mesh.position.y = otherMesh.mesh.position.y;
    mesh.mesh.position.z = otherMesh.mesh.position.z;
  });

  ViewEntities(this.entities, ['MeshComponent', 'VisibleIfShieldsUpComponent'], [], (entity, mesh, visibleCheck) => {
    const otherEntity = this.entities[visibleCheck.index];
    if (!otherEntity) {
      RemoveComponent(entity, 'VisibleIfShieldsUpComponent');
      return;
    }
    if (!(mesh.mesh)) {
      return;
    }
    mesh.mesh.visible = HasComponent(otherEntity, 'ShieldsUpComponent');
  });

  ViewEntities(this.entities, ['RotationComponent', 'LerpRotationComponent'], [], (entity, rotation, lerp) => {
    lerp.value = Phaser.Math.Interpolation.SmoothStep(0.1, lerp.value, rotation.value);
  });

  // Update dummy mesh rotations
  ViewEntities(this.entities, ['RotationComponent', 'MeshComponent'], [], (entity, rotation, mesh) => {
    if (mesh.mesh === null) {
      return;
    }

    const theta = HasComponent(entity, 'LerpRotationComponent') ? GetComponent(entity, 'LerpRotationComponent').value : rotation.value;

    rotationSetViewVector.set(mesh.mesh.position.x + Math.cos(theta), 0, mesh.mesh.position.z + Math.sin(theta));

    mesh.mesh.lookAt(rotationSetViewVector);
  });

  ViewEntities(this.entities, ['MeshComponent', 'PlanetViewDataComponent'], [], (entity, mesh, viewData) => {
    if (mesh.mesh === null) {
      return;
    }
    mesh.mesh.rotation.y += PLANET_ROTATION_SPEED;
  });
};
