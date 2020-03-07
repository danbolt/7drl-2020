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
