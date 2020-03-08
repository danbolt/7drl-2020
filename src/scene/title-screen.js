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

  const text = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.83, 'century', 'danbolt.itch.io', 32);
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
  this.bg = background;
  this.bgMat = backgroundMaterial;

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
  this.st = stars;
}
TitleScreen.prototype.showTitle = function (argument) {
  if (this.hasShownTitle) {
    return;
  }
  this.hasShownTitle = true;

  let t = this.add.tween({
    targets: [this.bg, this.st],
    y: Math.PI * 2,
    x: 0.1,
    duration: 253425
  });

  const logoHere = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, 'century', 'NAYR ODYSSEY', 32);
  logoHere.setCenterAlign();
  logoHere.setOrigin(0.5, 0.5);

  const startText = this.add.bitmapText(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.75, 'miniset', 'press space to start', DEFAULT_TEXT_SIZE);
  startText.setOrigin(0.5, 0.5);
  startText.setCenterAlign();
  this.time.addEvent({
    delay: 500,
    repeat: -1,
    callback: () => { startText.visible = !(startText.visible); }
  })

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

            //World.currentPlayerSector.x = 0;
            //World.currentPlayerSector.y = 3;

            this.scene.start('WorldMapScreen', {
              previousPlayerSector: {x: -2, y: -1}
            });
          }
        });
      }
    });
  });
}
TitleScreen.prototype.createEarth = function (argument) {
  const vertexInfp = this.cache.shader.get('planet_vertex');
  const vert = vertexInfp.fragmentSrc;

  const fragmentInfo = this.cache.shader.get('planet_fragment');
  const frag = fragmentInfo.fragmentSrc;

  const planetGeom = new THREE.IcosahedronBufferGeometry(2.0, 2);
  const earthMaterial = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        color1: new THREE.Uniform(new THREE.Color(0x1010aa)),
        color2: new THREE.Uniform(new THREE.Color(0x104499)),
        color3: new THREE.Uniform(new THREE.Color(0x007710)),
        scaleNoise: new THREE.Uniform(2.0),
        deRes: new THREE.Uniform(1),
        displayShadow: new THREE.Uniform(1)
      }
    });
  const earth = new THREE.Mesh( planetGeom, earthMaterial );
  const earthTween = this.add.tween({
    targets: earth.rotation,
    y: Math.PI * 2,
    duration: 15000,
    repeat: -1
  });

  return earth;
};
TitleScreen.prototype.createIscandar = function (argument) {
  const vertexInfp = this.cache.shader.get('planet_vertex');
  const vert = vertexInfp.fragmentSrc;

  const fragmentInfo = this.cache.shader.get('planet_fragment');
  const frag = fragmentInfo.fragmentSrc;

  const planetGeom = new THREE.IcosahedronBufferGeometry(1.8, 2);
  const earthMaterial = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        color1: new THREE.Uniform(new THREE.Color(0x102099)),
        color2: new THREE.Uniform(new THREE.Color(0x109999)),
        color3: new THREE.Uniform(new THREE.Color(0xaacccc)),
        scaleNoise: new THREE.Uniform(2.0),
        deRes: new THREE.Uniform(1),
        displayShadow: new THREE.Uniform(1)
      }
    });
  const earth = new THREE.Mesh( planetGeom, earthMaterial );
  const earthTween = this.add.tween({
    targets: earth.rotation,
    y: Math.PI * 2,
    duration: 15000,
    repeat: -1
  });

  return earth;
};

TitleScreen.prototype.createAsteroid = function (argument) {
  const vertexInfp = this.cache.shader.get('planet_vertex');
  const vert = vertexInfp.fragmentSrc;

  const fragmentInfo = this.cache.shader.get('planet_fragment');
  const frag = fragmentInfo.fragmentSrc;

  const asteroidMaterial = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      color1: new THREE.Uniform(new THREE.Color(0x44111)),
      color2: new THREE.Uniform(new THREE.Color(0x775500)),
      color3: new THREE.Uniform(new THREE.Color(0xeeaa88)),
      scaleNoise: new THREE.Uniform(2.0),
      deRes: new THREE.Uniform(1),
      displayShadow: new THREE.Uniform(1)
    }
  });

  const planetGeom = new THREE.IcosahedronBufferGeometry(Math.random() * 5, 2);
  const earth = new THREE.Mesh( planetGeom, asteroidMaterial );
  const earthTween = this.add.tween({
    targets: earth.rotation,
    y: Math.PI * 2,
    duration: 15000,
    repeat: -1
  });

  return earth;
};

const TitleTextA = `In a different place,
in a different time,
NAYR was the most lovely planet of them all.`;

const TitleTextB = `Clouds, mountains, and rivers,
science, art, and commerce.
NAYR was a utopia for all that came.`;

const TitleTextC = `Until one day...`;

const TitleTextD = `The ` + ENEMY_FACTION_NAME.toUpperCase() + ` took NAYR as
a colony for itself.
They sanctioned the populace and
closed all borders.`

const TitleTextE = `All hope seemed lost until...`;

const TitleTextF = `A motley crew of volunteers offered to
escort the PLANET SHIELD, a device that can protect
the people of NAYR from the ` + ENEMY_PEOPLE_NAME.toUpperCase() + 'S.';

const TitleTextG = `With you as the captain of the ARLO MK IV,
will you be able to make it?

Can you save NAYR?`;

TitleScreen.prototype.create = function() {
  this.hasShownTitle = false;

  this.cameras.cameras[0].fadeIn(400);
  const tSound = this.add.tween({
    targets: BGMSingletons[0],
    volume: MAX_VOLUME * 0.5,
    delay: 2000,
    duration: 500,
  });

  this.setupBackground();
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('down', () => {
    this.showTitle();
  });

  this.three.camera.position.set(5, 3, -5);
  this.three.camera.lookAt(0, 0, 0);

  const loader = new THREE.GLTFLoader();

  for (let i = 0; i < 30; i++) {
    const a = this.createAsteroid();
    a.position.set(-30 + (Math.random() * 70), (Math.random() * 20) - 10, (Math.random() * -150) + (50))
    if (Math.abs(a.position.x) < 10) {
      a.position.x -= 20;
    }
    if (a.position.y < 5) {
      a.position.y += (Math.random() < 0.5) ? 10 : -10;
    }
    this.three.scene.add(a);
  }

  let cinematicStuff = [];
  const iscandar = this.createIscandar();
  iscandar.position.set(0, 0, 0);
  this.three.scene.add(iscandar);

  const earth = this.createEarth();
  earth.position.set(0, 0, -50);
  this.three.scene.add(earth);

  let matTweenData = {value: 0};

  let playerShip = null;
  let playerShipTween = null;
  const gltfBinary = this.cache.binary.get('player_ship');
  loader.parse(gltfBinary, 'asset/model/', (gltfData) => {
    const playerShip = gltfData.scene.children[0];
    playerShip.scale.set(0.0001, 0.0001, 0.0001);
    playerShip.position.set(earth.position.x, earth.position.y, earth.position.z + 1.2);
    this.three.scene.add(playerShip);

    playerShipTween = this.add.tween({
      targets:playerShip.position,
      paused: true,
      z: ((earth.position.z + iscandar.position.z) * 0.5),
      duration: 10000,
      easing: Phaser.Math.Easing.Cubic.Out,
      onStart: () => {
        this.time.addEvent({
          delay: 5000,
          callback: () => {
            SFXSingletons['win_game'].play();
            this.showTitle();
          }
        })
        this.add.tween({
          targets: playerShip.scale,
          x: 0.5,
          y: 0.5,
          z: 0.5,
          duration: 2000
        })
      },
      onUpdate: () => { this.three.camera.lookAt(playerShip.position) }
    })
  });

  const dispatchPlayerShip = () => {
    if (playerShipTween !== null) {
      playerShipTween.play();
    } else {
      this.time.addEvent({
        delay: 1000,
        callback: dispatchPlayerShip
      })
    }
  };

  const toEarthTweenDuration = 1500;
  const toEarthTweenDelay = 1500;

  const n = new THREE.Vector3(iscandar.position.x, iscandar.position.y, iscandar.position.z);
  const cameraScrollTween = this.add.tween({
    targets: n,
    x: earth.position.x,
    y: earth.position.y,
    z: earth.position.z,
    paused: true,
    duration: toEarthTweenDuration,
    onUpdate: (tween, target) => {
      this.three.camera.lookAt(target.x, target.y, target.z);

      this.three.camera.position.x = target.x - 5;
      this.three.camera.position.y = target.y + 3;
      this.three.camera.position.z = Phaser.Math.Interpolation.Linear([iscandar.position.z - 5, earth.position.z + 5], tween.progress);
    },
    onComplete: () => {
      this.time.addEvent({
        delay: 1000,
        callback: () => { dispatchPlayerShip(); }
      })
    }
  });

  const matTweenB = this.add.tween({
    targets: matTweenData,
    value: 1.0,
    duration: toEarthTweenDuration,
    paused: true,
    easing: Phaser.Math.Easing.Cubic.Out,
    onStart: () => { matTweenData.value = 0; },
    onUpdate: () => {
      const v = matTweenData.value;
      const newA = lerpColor(GamilonHomeworldSectorColor.colorA, StartingSectorColor.colorA, v);
      const newB = lerpColor(GamilonHomeworldSectorColor.colorB, StartingSectorColor.colorB, v);
      const newC = lerpColor(GamilonHomeworldSectorColor.colorC, StartingSectorColor.colorC, v);
      this.bgMat.uniforms.color1.value.set(newA);
      this.bgMat.uniforms.color2.value.set(newB);
      this.bgMat.uniforms.color3.value.set(newC);
      this.bgMat.uniformsNeedUpdate = true;
    }
  });

  const toEarth = () => {
    matTweenB.play();
    cameraScrollTween.play();
  };

  const gamilonTweenDuration = 300;
  const matTweenA = this.add.tween({
    targets: matTweenData,
    value: 1.0,
    paused: true,
    duration: gamilonTweenDuration,
    easing: Phaser.Math.Easing.Cubic.Out,
    onUpdate: () => {
      const v = matTweenData.value;
      const newA = lerpColor(IscandarSectorColor.colorA, GamilonHomeworldSectorColor.colorA, v);
      const newB = lerpColor(IscandarSectorColor.colorB, GamilonHomeworldSectorColor.colorB, v);
      const newC = lerpColor(IscandarSectorColor.colorC, GamilonHomeworldSectorColor.colorC, v);
      this.bgMat.uniforms.color1.value.set(newA);
      this.bgMat.uniforms.color2.value.set(newB);
      this.bgMat.uniforms.color3.value.set(newC);
      this.bgMat.uniformsNeedUpdate = true;
    }
  });

  const farRange = 10;
  const closeRange = 3.4;
  const gamilonTweens = [];
  const numberOfShips = 10
  for (let id = 0; id < numberOfShips; id++) {
    const i = id;
    const gltfBinary = this.cache.binary.get('gamilon_small');
    loader.parse(gltfBinary, 'asset/model/', (gltfData) => {
      // The mesh must be the only object in the scene
      const m = gltfData.scene.children[0];
      m.scale.set(0.5, 0.5, 0.5);
      this.three.scene.add(m);
      m.position.set(iscandar.position.x + Math.cos(i / numberOfShips * Math.PI * 2) * farRange, 0, iscandar.position.z + Math.sin(i / numberOfShips * Math.PI * 2) * farRange)
      m.lookAt(iscandar.position);
      m.visible = false;

      let t = this.add.tween({
        targets: m.position,
        paused: true,
        x: (iscandar.position.x + Math.cos(i / numberOfShips * Math.PI * 2) * closeRange),
        z: (iscandar.position.z + Math.sin(i / numberOfShips * Math.PI * 2) * closeRange),
        duration: gamilonTweenDuration,
        easing: Phaser.Math.Easing.Cubic.Out,
        onStart: () => { m.visible = true; },
        onComplete: () => { if (i === 0) { this.time.addEvent({delay: toEarthTweenDelay, callback: toEarth}) } }
      });
      gamilonTweens.push(t);
    });
  }

  const launchGamilons = () => {
    gamilonTweens.forEach((t) => {
      t.play();
    });
    matTweenA.play();
  };

  this.time.addEvent({
    delay: 2000,
    callback: launchGamilons
  })

  this.three.camera.position.set(-5, 3, -5);
  this.three.camera.lookAt(iscandar.position);
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
      const holeContainer = this.add.container(GAME_WIDTH - 20, GAME_HEIGHT - 20);
      let cdHole =this.add.circle(0, 0, 5, 0x000000);
      let cdHole2 =this.add.circle(0, 11, 5, 0x000000);
      holeContainer.add(cdHole);
      holeContainer.add(cdHole2);
      this.add.tween({
        targets: holeContainer,
        rotation: Math.PI * 2,
        duration: 1000,
        repeat: -1
      })

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

  this.add.bitmapText(32, 32, 'miniset', 'You win! Press space to go to back to the title', DEFAULT_TEXT_SIZE);

  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('down', () => {
    this.scene.start('TitleScreen');
  });
};