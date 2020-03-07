// Title screen is below; here is some extra stuff


// The preload screen will take a while to finish on a new connection, so add this in the meantime.
const FirstLoadScreen = function () {
  // body...
};
FirstLoadScreen.prototype.init = function() {
  //
};
FirstLoadScreen.prototype.preload = function() {
  this.load.image('preload', 'asset/image/preload.png');
};
FirstLoadScreen.prototype.create = function() {
  this.add.image(~~(GAME_WIDTH * 0.5), ~~(GAME_HEIGHT * 0.5), 'preload');
};

const SplashScreen = function() {
  //
};
SplashScreen.prototype.init = function() {
  //
};
SplashScreen.prototype.preload = function() {
  //
};
SplashScreen.prototype.create = function() {
  this.three = {};
  this.three.camera = new THREE.OrthographicCamera( GAME_WIDTH / -2, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT / -2,  0.1, 100 );
  this.three.camera.position.z = 50;
  this.three.camera.lookAt(0, 0, 0);

  this.three.scene = new THREE.Scene();
  this.three.renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );
  this.three.renderer.autoClear = true;
  this.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

  this.three.raycaster = new THREE.Raycaster(undefined, undefined, 0.1, 150);

  this.three.view = this.add.extern();
  const that = this;
  this.three.view.render = function (prenderer, pcamera, pcalcMatrix) {
    that.three.renderer.state.reset();
    that.three.renderer.render(that.three.scene, that.three.camera);
  }

  const cubeSize = 50;
  const cubeGeom = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
  const cubeAMat = new THREE.MeshBasicMaterial( { color: 0xFFAA00 } );
  const cubeBMat = new THREE.MeshBasicMaterial( { color: 0x0033FF } );
  const rectMat = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
  const cubeA = new THREE.Mesh(cubeGeom, cubeAMat);
  cubeA.position.set(-cubeSize * 0.6, -35, 10);
  cubeA.scale.set(0.0001, 1.0, 1.0)
  const cubeB = new THREE.Mesh(cubeGeom, cubeBMat);
  cubeB.position.set(-cubeSize * 0.6, 35, 10);
  cubeB.scale.set(0.0001, 1.0, 1.0)
  const rect = new THREE.Mesh(new THREE.BoxBufferGeometry(cubeSize * 1.2, cubeSize * 3, cubeSize), rectMat);
  rect.position.set(-cubeSize * 0.6, 0, 12);
  rect.scale.set(0.0001, 0.8, 0.8);

  const logo = new THREE.Group();
  logo.position.set(0, GAME_HEIGHT * 0.124, 0);
  logo.rotation.z = Math.PI * 0.25;
  logo.add(cubeA);
  logo.add(cubeB);
  logo.add(rect);
  this.three.scene.add(logo);

  this.cameras.cameras[0].fadeIn(400);

  const text = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.83, 'century', 'https://danbolt.itch.io', 32);
  text.tint = 0x343434;
  text.setOrigin(0.5, 0.5);
  text.setCenterAlign();
  text.scaleY = 0.0001;
  let textTween = this.add.tween({
    targets: text,
    scaleY: 1.0,
    duration: 450,
    delay: 500
  });

  let tA = this.add.tween({
    targets: cubeA.position,
    x: cubeSize * 0.6,
    duration: 800,
    delay: 500
  });

  let tB = this.add.tween({
    targets: cubeB.position,
    x: cubeSize * 0.6,
    duration: 800,
    delay: 500
  });

  let tsA = this.add.tween({
    targets: cubeA.scale,
    x: 1.0,
    duration: 600,
    easing: Phaser.Math.Easing.Cubic.In,
    delay: 500
  });

  let tsB = this.add.tween({
    targets: cubeB.scale,
    x: 1.0,
    duration: 600,
    easing: Phaser.Math.Easing.Cubic.In,
    delay: 500
  });

  let tLogo = this.add.tween({
    duration: 1000,
    targets: rect.scale,
    x: 0.8,
    easing: Phaser.Math.Easing.Cubic.In,
    delay: 500
  })

  const bg = this.add.image(0, 0, 'splash_bg');
  bg.setOrigin(0, 0);

  SFXSingletons['startup'].play(undefined, {
    //
  });

  this.time.addEvent({
    delay: 6000,
    callback: () => {
      this.cameras.cameras[0].fade(1500);
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          this.scene.start('CDRomScreen');
        }
      })
    }
  })

  
};

const TitleScreen = function() {
  //
};
TitleScreen.prototype.init = function() {
  //
};
TitleScreen.prototype.preload = function() {
  //
};
TitleScreen.prototype.setupBackground = function() {
  const vertexInfp = this.cache.shader.get('planet_vertex');
  const vert = vertexInfp.fragmentSrc;

  const fragmentInfo = this.cache.shader.get('planet_fragment');
  const frag = fragmentInfo.fragmentSrc;

  this.three = {};
  this.gameCamera = new THREE.PerspectiveCamera( 70, GAME_WIDTH / GAME_HEIGHT,  0.1, 1000 );
  this.three.camera = this.gameCamera;

  this.three.scene = new THREE.Scene();
  this.three.renderer = new THREE.WebGLRenderer( { canvas: this.game.canvas, context: this.game.context, antialias: false } );
  this.three.renderer.autoClear = true;
  this.three.renderer.setClearColor(new THREE.Color(0x330044), 1.0);

  this.three.raycaster = new THREE.Raycaster(undefined, undefined, 0.1, 150);

  this.three.view = this.add.extern();
  const that = this;
  this.three.view.render = function (prenderer, pcamera, pcalcMatrix) {
    that.three.renderer.state.reset();
    that.three.renderer.render(that.three.scene, that.three.camera);
  }

  const backgroundGeom = new THREE.IcosahedronBufferGeometry(900, 2);
  const backgroundMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        color1: new THREE.Uniform(new THREE.Color(IscandarSectorColor.colorA)),
        color2: new THREE.Uniform(new THREE.Color(IscandarSectorColor.colorB)),
        color3: new THREE.Uniform(new THREE.Color(IscandarSectorColor.colorC)),
        scaleNoise: new THREE.Uniform(0.008),
        deRes: new THREE.Uniform(1),
        displayShadow: new THREE.Uniform(0)
      }
    });
  const backgroundHolder = new THREE.Group();
  const background = new THREE.Mesh( backgroundGeom, backgroundMaterial);
  backgroundHolder.add(background);
  this.three.scene.add(backgroundHolder);

  // Generate starfield from:
  // https://math.stackexchange.com/a/1585996
  const starVerts = [];
  const starfieldRadius = 200;
  for (var i = 0; i < NUMBER_OF_STARS; i++) {
    let x = (Math.random() * 2 - 1.0) + 0.0001;
    let y = (Math.random() * 2 - 1.0) + 0.0001;
    let z = (Math.random() * 2 - 1.0) + 0.0001;
    const normalizeFactor = 1.0 / Math.sqrt((x*x) + (y*y) + (z*z));
    x *= normalizeFactor * starfieldRadius;
    y *= normalizeFactor * starfieldRadius;
    z *= normalizeFactor * starfieldRadius;
    starVerts.push(x, y, z);
  }
  const starGeom = new THREE.BufferGeometry();
  starGeom.addAttribute( 'position', new THREE.Float32BufferAttribute( starVerts, 3 ) );
  const stars = new THREE.Points(starGeom, STARS_COLOR);
  this.three.scene.add(stars);

  let t = this.add.tween({
    targets: [background.rotation, stars.rotation],
    y: Math.PI * 2,
    x: 0.1,
    duration: 253425
  });
}
TitleScreen.prototype.create = function() {
  this.cameras.cameras[0].fadeIn(400);

  this.setupBackground();

  const tSound = this.add.tween({
    targets: BGMSingletons[0],
    volume: MAX_VOLUME * 0.5,
    delay: 2000,
    duration: 500,
  });

  this.time.addEvent({
    delay: 500,
    callback: () => {
      SFXSingletons['win_game'].play();
    }
  });

  const logoHere = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'miniset', 'LOGOTYPE GOES HERE', DEFAULT_TEXT_SIZE);
  logoHere.setOrigin(0.5, 0.5);

  const startText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.75, 'miniset', 'title screen press space to start', DEFAULT_TEXT_SIZE);
  startText.setOrigin(0.5, 0.5);
  startText.setCenterAlign();


  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('down', () => {
    this.cameras.cameras[0].fadeOut(500);

    this.time.addEvent({
      delay: 800,
      callback: () => {
        // Create the player entities for worldgen and allocation
        const playerEntities = [];
        populateWithPlayerEntities(playerEntities);
        const playerBasePoints = new DefaultPlayerPointsConfiguration();
        playerBasePoints.applyToShipEntity(playerEntities[0], playerEntities, true);

        this.scene.stop('FirstLoadScreen');
        this.scene.start('PointsSelectionScreen', {
          pointsToSpend: 3,
          existingConfig: playerBasePoints,
          playerEntities: playerEntities,
          shipIndex: 0,
          onComplete: (newConfigWithAllocatedPoints) => {
            // Combine the player-allocated points with the base points.
            const basePointsPlusExtra = CombineTwoPointsConfigurations(playerBasePoints, newConfigWithAllocatedPoints);
            basePointsPlusExtra.applyToShipEntity(playerEntities[0], playerEntities, true);

            // Generate a new campaign
            World = new GameWorld(5, 5, Math.random());
            ROT.RNG.setSeed(World.seed); // We have to set ROT's seed to ours to get deterministic markov names :/
            World.currentConfig = basePointsPlusExtra;
            while (!(World.isGenerated())) {
              World.tickGenerate(playerEntities);
            }

            this.scene.start('WorldMapScreen', {
              previousPlayerSector: {x: -2, y: -1}
            });
          }
        });
      }
    });
  });
};

// lol
const CDRomScreen = function() {
  //
};
CDRomScreen.prototype.init = function() {
  //
};
CDRomScreen.prototype.preload = function() {
  //
};
CDRomScreen.prototype.create = function() {
  this.time.addEvent({
    delay: 300,
    callback: () => {
      let cd =this.add.circle(GAME_WIDTH - 20, GAME_HEIGHT - 20, 18, 0xAAAAAF);
      let cdHole =this.add.circle(GAME_WIDTH - 20, GAME_HEIGHT - 20, 5, 0x000000);

      this.time.addEvent({
        delay: 50,
        callback: () => { cd.visible = false; }
      });

      this.time.addEvent({
        delay: 140,
        callback: () => { cd.visible = true;}
      });

      this.time.addEvent({
        delay: 300,
        callback: () => { cd.visible = false; }
      });

      this.time.addEvent({
        delay: 500,
        callback: () => { cd.visible = true; }
      });

      this.time.addEvent({
        delay: 700,
        callback: () => { cd.visible = false; }
      });
    }
  })
  SFXSingletons['cdrom'].play();

  this.time.addEvent({
    delay: 3500,
    callback: () => {
      this.scene.start('TitleScreen');
    }
  })
};

const WinScreen = function() {
  //
};
WinScreen.prototype.init = function() {
  //
};
WinScreen.prototype.preload = function() {
  //
};
WinScreen.prototype.create = function() {
  TitleScreen.prototype.setupBackground.call(this);

  this.cameras.cameras[0].fadeIn(400);

  const tSound = this.add.tween({
    targets: BGMSingletons[0],
    volume: MAX_VOLUME * 0.5,
    delay: 2000,
    duration: 500,
  });

  this.time.addEvent({
    delay: 500,
    callback: () => {
      SFXSingletons['win_game'].play();
    }
  });

  this.add.bitmapText(32, 32, 'miniset', 'You win! Press space to go to back to the title', DEFAULT_TEXT_SIZE);

  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('down', () => {
    this.scene.start('TitleScreen');
  });
};