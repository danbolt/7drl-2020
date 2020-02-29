let main = function() {
    // Expose bulletml's builder DSL to the global namespace.
    bulletml.dsl();

    let game = new Phaser.Game({
                        width: GAME_WIDTH,
                        height: GAME_HEIGHT,
                        type : Phaser.WEBGL,
                        pixelArt: true,
                        antialias: false,
                        scaleMode: Phaser.Scale.ScaleModes.FIT,
                        autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                        roundPixels: true,
                        input: {
                            gamepad: true
                        },
                        physics: {
                            default: 'arcade',
                            arcade: {
                                gravity: { y: 0 },
                                debug: false
                            }
                        },
                     });

    game.scene.add('Gameplay', Gameplay, false);
    game.scene.start('Gameplay', {});
};
