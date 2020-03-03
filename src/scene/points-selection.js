
const PointsSelectionScreen = function () {
  // body...
};
PointsSelectionScreen.prototype.init = function(payload) {
  //
};
PointsSelectionScreen.prototype.create = function() {

  const barsSize = 16;

  const x = 100;
  const y = 100;
  const width = 200;
  const height = 123;


  // bottom bar
  let topCorner = this.add.image(0, 0, 'window_9slice', 0);
  topCorner.setOrigin(0);
  let topBar = this.add.image(barsSize, 0, 'window_9slice', 1);
  topBar.setOrigin(0);
  topBar.displayWidth = width - (barsSize * 2);
  let otherTopCorner = this.add.image(width - barsSize, 0, 'window_9slice', 2);
  otherTopCorner.setOrigin(0);

  // bottom bars
  let bottomCorner = this.add.image(0, height - barsSize, 'window_9slice', 6);
  bottomCorner.setOrigin(0);
  let bottomBar = this.add.image(barsSize, height - barsSize, 'window_9slice', 7);
  bottomBar.setOrigin(0);
  bottomBar.displayWidth = width - (barsSize * 2);
  let otherBottomCorner = this.add.image(width - barsSize, height - barsSize, 'window_9slice', 8);
  otherBottomCorner.setOrigin(0);

  // left-right bars
  let leftBar = this.add.image(0, barsSize, 'window_9slice', 3);
  leftBar.setOrigin(0);
  leftBar.displayHeight = height - (barsSize * 2);
  let rightBar = this.add.image((width - barsSize), barsSize, 'window_9slice', 5);
  rightBar.setOrigin(0);
  rightBar.displayHeight = height - (barsSize * 2);

  // middle
  let middleZone = this.add.tileSprite(barsSize, barsSize, width - (barsSize * 2), height - (barsSize * 2), 'window_9slice', 4);
  middleZone.setOrigin(0);

  let holder = this.add.container(x, y, [topCorner, topBar, otherTopCorner, bottomCorner, bottomBar, otherBottomCorner, leftBar, rightBar, middleZone]);

  console.log('points select');
  const text = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'miniset', 'points selection', DEFAULT_TEXT_SIZE);
  text.setCenterAlign();
  text.setOrigin(0.5);



  // Add the shutdown event
  this.events.once('shutdown', this.shutdown, this);
};
PointsSelectionScreen.prototype.shutdown = function() {
  //
};
