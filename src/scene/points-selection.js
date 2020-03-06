
const PointsSelectionScreen = function () {
  this.keys = {};
};
PointsSelectionScreen.prototype.init = function(payload) {
  this.payload = payload;
  this.resultConfig = null;
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
PointsSelectionScreen.prototype.pushOptionsView = function(options, existingConfig) {
  const optionData = [
    {
      name: 'Ship Dexterity',
      configKey: 'skipperDexPoints'
    },
    {
      name: 'Shield Power',
      configKey: 'shieldPoints'
    },
    {
      name: 'Shield Toggle Dexterity',
      configKey: 'shieldOperatorDexPoints'
    },
    {
      name: 'Cannons Strength',
      configKey: 'atkStrengthPoints'
    },
    {
      name: 'Cannons Range',
      configKey: 'atkRangePoints'
    },
    {
      name: 'Cannons Dexterity',
      configKey: 'gunnerDexPoints'
    },
    {
      name: 'Engine Dexterity',
      configKey: 'engineerDexPoints'
    },
    {
      name: 'Engine Max Speed',
      configKey: 'engineMaxSpeedPoints'
    },
  ];

  optionData.forEach((optionPreset) => {
    options.push({
      name: optionPreset.name,
      currentValue: existingConfig[optionPreset.configKey],
      configKey: optionPreset.configKey,
      toAdd: 0
    });
  });
};
PointsSelectionScreen.prototype.create = function() {
  // Add the shutdown event for when we leave
  this.events.once('shutdown', this.shutdown, this);

  const keyConfigObject = {
    'right': Phaser.Input.Keyboard.KeyCodes.RIGHT,
    'left': Phaser.Input.Keyboard.KeyCodes.LEFT,
    'down': Phaser.Input.Keyboard.KeyCodes.DOWN,
    'up': Phaser.Input.Keyboard.KeyCodes.UP,
    'confirm': Phaser.Input.Keyboard.KeyCodes.ENTER
  };
  this.keys = this.input.keyboard.addKeys(keyConfigObject);

  const shipEntity = this.payload.playerEntities[this.payload.shipIndex];
  const shipName = HasComponent(shipEntity, 'NameComponent') ? GetComponent(shipEntity, 'NameComponent').value : '???';

  let dialogWindow = this.create9Slice(GAME_WIDTH * 0.1, 32, GAME_WIDTH * 0.2 * 4, GAME_HEIGHT - 64);
  dialogWindow.scaleY = 0;
  const t = this.add.tween({
    targets: dialogWindow,
    scaleY: 1.0,
    duration: 300,
    easing: Phaser.Math.Easing.Cubic.In
  });

  const textsToKill = [];

  const headingText = this.add.bitmapText(GAME_WIDTH * 0.5, 48, 'miniset', '', DEFAULT_TEXT_SIZE);
  headingText.setCenterAlign();
  headingText.setOrigin(0.5);
  textsToKill.push(headingText);

  const confirmText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT - 48, 'miniset', 'Use the arrow keys to allocate points. Press enter when you\'re ready.', DEFAULT_TEXT_SIZE);
  confirmText.setCenterAlign();
  confirmText.setOrigin(0.5);
  textsToKill.push(confirmText);

  const existingConfig = this.payload.existingConfig;

  let currentSelectionIndex = 0;
  let pointsToSpend = this.payload.pointsToSpend;

  const options = [];
  this.pushOptionsView(options, existingConfig);

  options.forEach((option, i) => {
    option.text = this.add.bitmapText(GAME_WIDTH * 0.1 + 32, 64 + (i * (DEFAULT_TEXT_SIZE * 1.8)), 'miniset', '', DEFAULT_TEXT_SIZE);
    textsToKill.push(option.text);
    option.textCurrent = this.add.bitmapText(GAME_WIDTH * 0.1 + 132, 64 + (i * (DEFAULT_TEXT_SIZE * 1.8)), 'miniset', '', DEFAULT_TEXT_SIZE);
    textsToKill.push(option.textCurrent);
    option.textToAdd = this.add.bitmapText(GAME_WIDTH * 0.1 + 196, 64 + (i * (DEFAULT_TEXT_SIZE * 1.8)), 'miniset', '', DEFAULT_TEXT_SIZE);
    textsToKill.push(option.textToAdd);
    option.textTotal = this.add.bitmapText(GAME_WIDTH * 0.1 + 243, 64 + (i * (DEFAULT_TEXT_SIZE * 1.8)), 'miniset', '', DEFAULT_TEXT_SIZE);
    textsToKill.push(option.textTotal);
  });
  let refreshOptions = () => {
    options.forEach((option, i) => {
      option.text.text = option.name;
      option.text.tint = (i === currentSelectionIndex) ? 0xeeff00 : 0xFFFFFF;
      option.textCurrent.text = 'Current: ' + option.currentValue;
      option.textCurrent.tint = (i === currentSelectionIndex) ? 0xeeff00 : 0xFFFFFF;
      option.textToAdd.text = 'Add: ' + option.toAdd;
      option.textToAdd.tint = (i === currentSelectionIndex) ? 0xeeff00 : 0xFFFFFF;
      option.textTotal.text = 'New Total: ' + (option.currentValue + option.toAdd);
      option.textTotal.tint = (i === currentSelectionIndex) ? 0xeeff00 : 0xFFFFFF;
    });

    headingText.text = 'Allocate ' + (pointsToSpend) + ' R&D Units for ' + shipName;
  };
  refreshOptions();

  const moveSelectionDown = () => {
    currentSelectionIndex = Math.min(options.length - 1, currentSelectionIndex + 1);
    refreshOptions();

    SFXSingletons['click'].play();
  };
  this.keys.down.on('down', moveSelectionDown);
  this.events.once('shutdown', () => { this.keys.down.removeListener('down', moveSelectionDown); });
  const moveSelectionUp = () => {
    currentSelectionIndex = Math.max(0, currentSelectionIndex - 1);
    refreshOptions();

    SFXSingletons['click'].play();
  };
  this.keys.up.on('down', moveSelectionUp);
  this.events.once('shutdown', () => { this.keys.up.removeListener('down', moveSelectionUp); });

  const spendPoint = () => {
    if (pointsToSpend <= 0) {
      SFXSingletons['click'].play();

      return;
    }

    const currentOption = options[currentSelectionIndex];
    pointsToSpend--;
    currentOption.toAdd++;
    refreshOptions();

    SFXSingletons['select_y'].play();
  };
  this.keys.right.on('down', spendPoint);
  this.events.once('shutdown', () => { this.keys.right.removeListener('down', spendPoint); });
  const takePointBack = () => {
    const currentOption = options[currentSelectionIndex];
    if (currentOption.toAdd <= 0) {
      SFXSingletons['click'].play();
      return;
    }
    pointsToSpend++;
    currentOption.toAdd--;
    refreshOptions();

    SFXSingletons['select_n'].play();
  };
  this.keys.left.on('down', takePointBack);
  this.events.once('shutdown', () => { this.keys.left.removeListener('down', takePointBack); });

  let dialogIsUp = false;
  const confirmSelection = () => {
    if (dialogIsUp) {
      return;
    }
    dialogIsUp = true;

    const confirmDialog = {
      question: 'Is this allocation for ' + shipName + ' okay?\n' + ((pointsToSpend <= 0) ? 'You\'ve spent all your R&D points' : ('You have ' + pointsToSpend + ' R&D points left.')),
      options: [
        {
          text: '[n] no',
          keyCode: Phaser.Input.Keyboard.KeyCodes.N,
          action: () => {
            this.time.addEvent({
              delay: 32,
              callback: () => {
                dialogIsUp = false;
                // do nothing since the player changed their mind
              }
            })
          }
        },
        {
          text: '[y] yes',
          keyCode: Phaser.Input.Keyboard.KeyCodes.Y,
          action: () => {
            this.time.addEvent({
              delay: 32,
              callback: () => {
                textsToKill.forEach((text) => {
                  text.destroy();
                });

                const t = this.add.tween({
                  targets: dialogWindow,
                  scaleY: 0.0,
                  duration: 300,
                  easing: Phaser.Math.Easing.Cubic.In,
                  onComplete: () => {
                    this.resultConfig = new PointsConfiguration();
                    options.forEach((option) => {
                      this.resultConfig[option.configKey] += option.toAdd;
                    });
                    this.scene.stop('PointsSelectionScreen');
                  }
                });
              }
            })
          }
        }
      ]
    };

    if (pointsToSpend <= 0) {
      confirmDialog.options.reverse();
    }

    Gameplay.prototype.showDialogue.call(this, confirmDialog);
  };
  this.keys.confirm.on('down', confirmSelection);
  this.events.once('shutdown', () => { this.keys.confirm.removeListener('down', confirmSelection); });
};
PointsSelectionScreen.prototype.update = function () {
};
PointsSelectionScreen.prototype.shutdown = function() {
  this.payload.onComplete(this.resultConfig);
  this.payload = null;
};
