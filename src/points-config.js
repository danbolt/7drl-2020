const PointsConfiguration = function() {
  // Warning: set these to nonzero for a real ingame ship

  this.hullHealthPoints = 0;
  this.shieldPoints = 0;
  this.shipDexPoints = 0;

  this.atkStrengthPoints = 0;
  this.atkRangePoints = 0;

  this.skipperDexPoints = 0;

  this.gunnerDexPoints = 0;

  this.engineerDexPoints = 0;
  this.engineMaxSpeedPoints = 0;

  this.shieldOperatorDexPoints = 0;
};
PointsConfiguration.prototype.applyToShipEntity = function(shipEntity, entities, fillHealth) {
  fillHealth = fillHealth ? true : false;

  GetComponent(shipEntity, 'HullHealthComponent').maxHealth = (this.hullHealthPoints * HULL_HEALTH_PER_POINT);
  if (fillHealth) {
    GetComponent(shipEntity, 'HullHealthComponent').health = (this.hullHealthPoints * HULL_HEALTH_PER_POINT);
  }
  GetComponent(shipEntity, 'ShieldsComponent').maxHealth = (this.shieldPoints * SHIELDS_PER_POINT);
  GetComponent(shipEntity, 'DexterityComponent').value = (this.shipDexPoints * SHIP_DEX_PER_POINT);
  GetComponent(shipEntity, 'AttackStrengthComponent').value = (this.atkStrengthPoints * ATK_STRENGTH_PER_POINT);
  GetComponent(shipEntity, 'AttackRangeComponent').value = (this.atkRangePoints * ATK_RANGE_PER_POINT);

  const shipIndex = GetComponent(shipEntity, 'ECSIndexComponent').value;

  // TODO: apply the points to the skipper
  ViewEntities(entities, ['ShipReferenceComponent', 'SkipperComponent', 'DexterityComponent'], [], (entity, shipRef, skipper, dexterity) => {
    if (shipRef.value !== shipIndex) {
      return;
    }

    dexterity.value = this.skipperDexPoints * SKIPPER_DEX_PER_POINT;
  });

  ViewEntities(entities, ['ShipReferenceComponent', 'GunnerComponent', 'DexterityComponent'], [], (entity, shipRef, gunner, dexterity) => {
    if (shipRef.value !== shipIndex) {
      return;
    }

    dexterity.value = this.gunnerDexPoints * SKIPPER_DEX_PER_POINT;
  });

  ViewEntities(entities, ['ShipReferenceComponent', 'EngineerComponent', 'EngineComponent', 'DexterityComponent'], [], (entity, shipRef, engineer, engine, dexterity) => {
    if (shipRef.value !== shipIndex) {
      return;
    }

    dexterity.value = this.engineerDexPoints * SKIPPER_DEX_PER_POINT;
    engine.minSpeed = 0;
    engine.maxSpeed = this.engineMaxSpeedPoints * ENGINE_MAX_SPEED_PER_POINT;
  });

  ViewEntities(entities, ['ShipReferenceComponent', 'ShieldOperatorComponent', 'DexterityComponent'], [], (entity, shipRef, shieldOperator, dexterity) => {
    if (shipRef.value !== shipIndex) {
      return;
    }

    dexterity.value = this.shieldOperatorDexPoints * SHIELD_OPERATOR_DEX_PER_POINT;
  });
};

// Static, returns new ship
const CombineTwoPointsConfigurations = function(configA, configB) {
  if (!configA) {
    throw new Error('config A was bad!');
  }

  if (!configB) {
    throw new Error('config A was bad!');
  }

  const result = new PointsConfiguration();
  result.hullHealthPoints = (configA.hullHealthPoints + configB.hullHealthPoints);
  result.shieldPoints = (configA.shieldPoints + configB.shieldPoints);
  result.shipDexPoints = (configA.shipDexPoints + configB.shipDexPoints);

  result.atkStrengthPoints = (configA.atkStrengthPoints + configB.atkStrengthPoints);
  result.atkRangePoints = (configA.atkRangePoints + configB.atkRangePoints);

  result.skipperDexPoints = (configA.skipperDexPoints + configB.skipperDexPoints);

  result.gunnerDexPoints = (configA.gunnerDexPoints + configB.gunnerDexPoints);

  result.engineerDexPoints = (configA.engineerDexPoints + configB.engineerDexPoints);
  result.engineMaxSpeedPoints = (configA.engineMaxSpeedPoints + configB.engineMaxSpeedPoints);

  result.shieldOperatorDexPoints = (configA.shieldOperatorDexPoints + configB.shieldOperatorDexPoints);

  return result;
};

const DefaultPlayerPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 6;
  this.shieldPoints = 5;
  this.shipDexPoints = 9;

  this.atkStrengthPoints = 4;
  this.atkRangePoints = 5;

  this.skipperDexPoints = 2;

  this.gunnerDexPoints = 2;

  this.engineerDexPoints = 2;
  this.engineMaxSpeedPoints = 4;

  this.shieldOperatorDexPoints = 2;
};
DefaultPlayerPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
DefaultPlayerPointsConfiguration.prototype.constructor = DefaultPlayerPointsConfiguration;
