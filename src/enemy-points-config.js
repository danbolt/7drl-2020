const PopcornEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 8;
  this.shieldPoints = 0;
  this.shipDexPoints = 2;

  this.atkStrengthPoints = 1;
  this.atkRangePoints = 7;

  this.skipperDexPoints = 5;

  this.gunnerDexPoints = 5;

  this.engineerDexPoints = 4;
  this.engineMaxSpeedPoints = 3;

  this.shieldOperatorDexPoints = 0;
};
PopcornEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
PopcornEnemyPointsConfiguration.prototype.constructor = PopcornEnemyPointsConfiguration;

const WeakEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 13;
  this.shieldPoints = 0;
  this.shipDexPoints = 2;

  this.atkStrengthPoints = 4;
  this.atkRangePoints = 9;

  this.skipperDexPoints = 5;

  this.gunnerDexPoints = 6;

  this.engineerDexPoints = 1;
  this.engineMaxSpeedPoints = 3;

  this.shieldOperatorDexPoints = 0;
};
WeakEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
WeakEnemyPointsConfiguration.prototype.constructor = WeakEnemyPointsConfiguration;


const BattleshipEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 20;
  this.shieldPoints = 0;
  this.shipDexPoints = 6;

  this.atkStrengthPoints = 2.5;
  this.atkRangePoints = 13;

  this.skipperDexPoints = 8;

  this.gunnerDexPoints = 3;

  this.engineerDexPoints = 3;
  this.engineMaxSpeedPoints = 7;

  this.shieldOperatorDexPoints = 0;
};
BattleshipEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
BattleshipEnemyPointsConfiguration.prototype.constructor = BattleshipEnemyPointsConfiguration;

const AltBattleshipEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 11;
  this.shieldPoints = 4;
  this.shipDexPoints = 6;

  this.atkStrengthPoints = 2.8;
  this.atkRangePoints = 10;

  this.skipperDexPoints = 10;

  this.gunnerDexPoints = 3;

  this.engineerDexPoints = 3;
  this.engineMaxSpeedPoints = 8;

  this.shieldOperatorDexPoints = 7;
};
AltBattleshipEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
AltBattleshipEnemyPointsConfiguration.prototype.constructor = AltBattleshipEnemyPointsConfiguration;


const DreadnoughtEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 30;
  this.shieldPoints = 8;
  this.shipDexPoints = 6;

  this.atkStrengthPoints = 7;
  this.atkRangePoints = 17;

  this.skipperDexPoints = 5;

  this.gunnerDexPoints = 6;

  this.engineerDexPoints = 5;
  this.engineMaxSpeedPoints = 9;

  this.shieldOperatorDexPoints = 7;
};
DreadnoughtEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
DreadnoughtEnemyPointsConfiguration.prototype.constructor = DreadnoughtEnemyPointsConfiguration;

const OldGodEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 35;
  this.shieldPoints = 0;
  this.shipDexPoints = 10;

  this.atkStrengthPoints = 10;
  this.atkRangePoints = 9999;

  this.skipperDexPoints = 10;

  this.gunnerDexPoints = 2;

  this.engineerDexPoints = 1;
  this.engineMaxSpeedPoints = 5;

  this.shieldOperatorDexPoints = 0;
};
OldGodEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
OldGodEnemyPointsConfiguration.prototype.constructor = OldGodEnemyPointsConfiguration;

const DroneEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 5;
  this.shieldPoints = 0;
  this.shipDexPoints = 15;

  this.atkStrengthPoints = 5;
  this.atkRangePoints = 3.4;

  this.skipperDexPoints = 30;

  this.gunnerDexPoints = 3;

  this.engineerDexPoints = 1;
  this.engineMaxSpeedPoints = 3;

  this.shieldOperatorDexPoints = 0;
};
DroneEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
DroneEnemyPointsConfiguration.prototype.constructor = DroneEnemyPointsConfiguration;
