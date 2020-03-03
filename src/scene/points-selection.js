
const PointsSelectionScreen = function () {
  // body...
};
PointsSelectionScreen.prototype.init = function(payload) {
  //
};
PointsSelectionScreen.prototype.create9Slice = function (x, y, width, height) {
  const barsSize = 16;

  // top bars
  let topCorner = this.add.image(0, 0, 'window_9slice', 0);
  topCorner.setOrigin(0);
  let topBar = this.add.tileSprite(barsSize, 0, width - (barsSize * 2), 16, 'window_9slice', 1);
  topBar.setOrigin(0);
  let otherTopCorner = this.add.image(width - barsSize, 0, 'window_9slice', 2);
  otherTopCorner.setOrigin(0);

  // bottom bars
  let bottomCorner =  this.add.image(0, height - barsSize, 'window_9slice', 6);
  bottomCorner.setOrigin(0);
  let bottomBar = this.add.tileSprite(barsSize, height - barsSize, width - (barsSize * 2), 16, 'window_9slice', 7);
  bottomBar.setOrigin(0);
  let otherBottomCorner = this.add.image(width - barsSize, height - barsSize, 'window_9slice', 8);
  otherBottomCorner.setOrigin(0);

  // left-right bars
  let leftBar = this.add.tileSprite(0, barsSize, 16, height - (barsSize * 2), 'window_9slice', 3);
  leftBar.setOrigin(0);
  let rightBar = this.add.tileSprite(width - barsSize, barsSize, 16, height - (barsSize * 2), 'window_9slice', 5);
  rightBar.setOrigin(0);
  

  // middle
  let middleZone = this.add.tileSprite(barsSize, barsSize, width - (barsSize * 2), height - (barsSize * 2), 'window_9slice', 4);
  middleZone.setOrigin(0);

  return this.add.container(x, y, [topCorner, topBar, otherTopCorner, bottomCorner, bottomBar, otherBottomCorner, leftBar, rightBar, middleZone]);
};
PointsSelectionScreen.prototype.create = function() {
  let dialogWindow = this.create9Slice(GAME_WIDTH * 0.1, 32, GAME_WIDTH * 0.2 * 4, GAME_HEIGHT - 64);


  const text = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'miniset', 'points selection', DEFAULT_TEXT_SIZE);
  text.setCenterAlign();
  text.setOrigin(0.5);



  // Add the shutdown event
  this.events.once('shutdown', this.shutdown, this);
};
PointsSelectionScreen.prototype.shutdown = function() {
  //
};
