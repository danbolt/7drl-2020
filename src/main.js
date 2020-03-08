
// custom context used for Firefox rendering; lifted from:
// https://discourse.threejs.org/t/firefox-does-not-render-the-depth-correctly/11823
// https://jsfiddle.net/g1zbLrkm/

// create canvas
var myCustomCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas')
myCustomCanvas.id = 'myCustomCanvas';

const parameters = {}

// copied from https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderer.js
const _alpha = parameters.alpha !== undefined ? parameters.alpha : false
const _depth = parameters.depth !== undefined ? parameters.depth : true
const _stencil = parameters.stencil !== undefined ? parameters.stencil : true
const _antialias = parameters.antialias !== undefined ? parameters.antialias : false
const _premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true
const _preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false
const _powerPreference = parameters.powerPreference !== undefined ? parameters.powerPreference : 'default'
const _failIfMajorPerformanceCaveat = parameters.failIfMajorPerformanceCaveat !== undefined ? parameters.failIfMajorPerformanceCaveat : false

// threejs's context attributes
var contextAttributes = {
  alpha: _alpha,
  depth: _depth,
  stencil: _stencil,
  antialias: _antialias,
  premultipliedAlpha: _premultipliedAlpha,
  preserveDrawingBuffer: _preserveDrawingBuffer,
  powerPreference: _powerPreference,
  failIfMajorPerformanceCaveat: _failIfMajorPerformanceCaveat,
  xrCompatible: true,
};

//  default context config for phaser
var contextCreationConfig = {
  alpha: false,
  depth: false,
  antialias: true,
  premultipliedAlpha: true,
  stencil: true,
  preserveDrawingBuffer: false,
  failIfMajorPerformanceCaveat: false,
  powerPreference: 'default',
  // merge bots context attributes
  ...contextAttributes
};

// create context
var myCustomContext = myCustomCanvas.getContext('webgl', contextCreationConfig);



let main = function() {
    let game = new Phaser.Game({
                        width: GAME_WIDTH,
                        height: GAME_HEIGHT,
                        type : Phaser.WEBGL,
                        canvas: myCustomCanvas,
                        context: myCustomContext,
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
