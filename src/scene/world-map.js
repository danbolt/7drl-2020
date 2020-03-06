const WorldMapScreen = function () {
  this.three = {};
};
WorldMapScreen.prototype.init = function(payload) {
  this.payload = payload;
};
WorldMapScreen.prototype.setup3DBackground = function () {
  const vertexInfp = this.cache.shader.get('planet_vertex');
  const vert = vertexInfp.fragmentSrc;

  const fragmentInfo = this.cache.shader.get('planet_fragment');
  const frag = fragmentInfo.fragmentSrc;

  const backgroundGeom = new THREE.IcosahedronBufferGeometry(900, 2);
  const backgroundMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        color1: new THREE.Uniform(new THREE.Color(World.getCurrentSector().colorA)),
        color2: new THREE.Uniform(new THREE.Color(World.getCurrentSector().colorB)),
        color3: new THREE.Uniform(new THREE.Color(World.getCurrentSector().colorC)),
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
WorldMapScreen.prototype.create = function() {
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
  this.setup3DBackground();

  this.cameras.cameras[0].fadeIn(900);

  // setup the grid
  const GridSize = 5.0;
  const CellWidth = GridSize / World.width;
  const CellHeight = GridSize / World.height;
  for (let i = 0; i <= World.width; i++) {
    const lineGeom  = new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(i * CellWidth, 0, 0), new THREE.Vector3(i * CellWidth, 0, GridSize)] );
    const pathLine = new THREE.Line(lineGeom, PATH_LINE_COLOR);
    this.three.scene.add(pathLine);
  }
  for (let i = 0; i <= World.height; i++) {
    const lineGeom  = new THREE.BufferGeometry().setFromPoints( [new THREE.Vector3(0, 0, i * CellHeight), new THREE.Vector3(GridSize, 0, i * CellHeight)] );
    const pathLine = new THREE.Line(lineGeom, PATH_LINE_COLOR);
    this.three.scene.add(pathLine);
  }

  this.three.camera.position.set(GridSize * 0.5, 2.6, GridSize * 0.5 + 3.7);
  this.three.camera.lookAt(GridSize * 0.5, 0, GridSize * 0.5);

  const arloBinary = this.cache.binary.get('player_ship');
  loader.parse(arloBinary, 'asset/model/', (gltfData) => {
    // The mesh must be the only object in the scene
    const mesh = gltfData.scene.children[0];
    mesh.position.set(World.currentPlayerSector.x * CellWidth + (CellWidth * 0.5), 0, World.currentPlayerSector.y * CellHeight + (CellHeight * 0.5));
    mesh.scale.set(0.25, 0.25, 0.25);
    this.three.scene.add(mesh);

    if (this.payload.previousPlayerSector) {
      mesh.position.set(this.payload.previousPlayerSector.x * CellWidth + (CellWidth * 0.5), 0, this.payload.previousPlayerSector.y * CellHeight + (CellHeight * 0.5));
      mesh.lookAt(World.currentPlayerSector.x * CellWidth + (CellWidth * 0.5), 0, World.currentPlayerSector.y * CellHeight + (CellHeight * 0.5));

      const t = this.add.tween({
        targets: mesh.position,
        x: World.currentPlayerSector.x * CellWidth + (CellWidth * 0.5),
        z: World.currentPlayerSector.y * CellHeight + (CellHeight * 0.5),
        duration: 2000,
        delay: 1000
      })
    }
  });

  const vertexInfp = this.cache.shader.get('planet_vertex');
  const vert = vertexInfp.fragmentSrc;

  const fragmentInfo = this.cache.shader.get('planet_fragment');
  const frag = fragmentInfo.fragmentSrc;

  const planetGeom = new THREE.IcosahedronBufferGeometry(1.8, 2);
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
  earth.position.set(0, 0, -0.7);
  earth.scale.set(0.3, 0.3, 0.3);
  const earthTween = this.add.tween({
    targets: earth.rotation,
    y: Math.PI * 2,
    duration: 15000,
    repeat: -1
  });
  this.three.scene.add(earth);
  const iscandarMaterial = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        color1: new THREE.Uniform(new THREE.Color(0x102099)),
        color2: new THREE.Uniform(new THREE.Color(0x109999)),
        color3: new THREE.Uniform(new THREE.Color(0xaacccc)),
        scaleNoise: new THREE.Uniform(2.8),
        deRes: new THREE.Uniform(1),
        displayShadow: new THREE.Uniform(1)
      }
    });
  const iscandar = new THREE.Mesh( planetGeom, iscandarMaterial );
  iscandar.position.set(World.iscandarSector.x * CellWidth + (CellWidth * 1.3), 0, World.iscandarSector.y * CellHeight + (CellHeight * 0.9));
  iscandar.scale.set(0.3, 0.3, 0.3);
  const iscandarTween = this.add.tween({
    targets: iscandar.rotation,
    y: Math.PI * 2,
    duration: 108650,
    repeat: -1
  });
  this.three.scene.add(iscandar);

  const welcomeMessage = 'Now entering ' + World.getCurrentSector().name;
  let bipIndex = 0;
  const bipText = this.add.bitmapText(GAME_WIDTH * 0.5, 32, 'miniset', '', DEFAULT_TEXT_SIZE);
  bipText.setCenterAlign();
  bipText.setOrigin(0.5);
  this.time.addEvent({
    delay: 100,
    repeat: welcomeMessage.length,
    callback: () => {
      bipText.text = welcomeMessage.substring(0, bipIndex);
      bipIndex++;

      if (bipIndex === welcomeMessage.length) {
        this.time.addEvent({
          delay: 2000,
          callback: () => {
            this.cameras.cameras[0].fade(1402);
            this.time.addEvent({
              delay: 2000,
              callback: () => {
                // Start gameplay in the current sector
                this.scene.start('Gameplay', World.getCurrentSector());
              }
            });
          }
        });
      }
    }
  });
};