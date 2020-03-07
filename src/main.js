let main = function() {
    let game = new Phaser.Game({
                        width: GAME_WIDTH,
                        height: GAME_HEIGHT,
                        type : Phaser.WEBGL,
                        pixelArt: true,
                        antialias: true,
                        scaleMode: Phaser.Scale.ScaleModes.FIT,
                        autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                        roundPixels: true,
                        input: {
                            gamepad: true
                        },
                        plugins: {
                            global: [],
                        }
                     });
    game.scene.add('FirstLoadScreen', FirstLoadScreen, false);
    game.scene.add('PreloadScreen', PreloadScreen, false);
    game.scene.add('SplashScreen', SplashScreen, false);
    game.scene.add('CDRomScreen', CDRomScreen, false);
    game.scene.add('TitleScreen', TitleScreen, false);
    game.scene.add('WinScreen', WinScreen, false);
    game.scene.add('Gameplay', Gameplay, false);
    game.scene.add('PointsSelectionScreen', PointsSelectionScreen, false);
    game.scene.add('WorldMapScreen', WorldMapScreen, false);

    game.scene.start('FirstLoadScreen');
    game.scene.start('PreloadScreen');
};
