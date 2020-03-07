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

  this.engineerDexPoints = 3;
  this.engineMaxSpeedPoints = 3;

  this.shieldOperatorDexPoints = 0;
};
WeakEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
WeakEnemyPointsConfiguration.prototype.constructor = WeakEnemyPointsConfiguration;


const BattleshipEnemyPointsConfiguration = function() {
  PointsConfiguration.call(this);

  this.hullHealthPoints = 20;
  this.shieldPoints = 0;
  this.shipDexPoints = 2;

  this.atkStrengthPoints = 4;
  this.atkRangePoints = 9;

  this.skipperDexPoints = 5;

  this.gunnerDexPoints = 6;

  this.engineerDexPoints = 3;
  this.engineMaxSpeedPoints = 3;

  this.shieldOperatorDexPoints = 0;
};
BattleshipEnemyPointsConfiguration.prototype = Object.create(PointsConfiguration.prototype);
BattleshipEnemyPointsConfiguration.prototype.constructor = BattleshipEnemyPointsConfiguration;

