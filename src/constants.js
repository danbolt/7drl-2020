const GAME_WIDTH = 426;
const GAME_HEIGHT = 240;

const DEFAULT_TEXT_SIZE = 8;

const DEFAULT_IMAGE_MAP = 'test_sheet_image';
const DEFAULT_IMAGE_SPRITE = DEFAULT_IMAGE_MAP + '_whole_image';

const CAMERA_DISTANCE = 12.0;
const CAMERA_TURN_INVERT = -1;
const CAMERA_TURN_SPEED = 0.1 * CAMERA_TURN_INVERT;
const CAMERA_PAN_SPEED = 0.3;
const DOUBLE_CAMERA_PAN_SPEED = CAMERA_PAN_SPEED * 2.0;

const DEFAULT_POSITION_TWEEN_DURATION = 2000;

const DEFAULT_WORLD_SIZE_IN_SECTORS = 10;
const SECTOR_WIDTH = 70;
const SECTOR_HEIGHT = 70;

const EXPLOSION_BUFFER_COUNT = 60;
const LASER_BUFFER_COUNT = 50;

const DUMMY_3D_CUBE_GEOM = new THREE.BoxBufferGeometry( 1, 1, 1 );
const SHIELDS_GEOM = new THREE.OctahedronBufferGeometry(1, 1);
const SHIELDS_MAT = new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x53FEFF, wireframe: true });

const PATH_LINE_COLOR = new THREE.LineBasicMaterial({
  color: 0xaaaaaa,
  linewidth: 4
});
const STARS_COLOR = new THREE.PointsMaterial( { color: 0xFFFFFF, size: 1 } );
const NUMBER_OF_STARS = 200;

const ORBIT_ROTATION_PER_TURN = 0.4562;

const COMPASS_ANGLE_LETTERS = ['E', 'NE', 'N', 'N', 'NW', 'W', 'W', 'SW', 'S', 'S', 'SE', 'E'];

const UNIT = 'paular'; // A scifi-sounding unit of measure for space in case people say parsecs or lightyears isn't realistic
const UNIT_PLURAL = UNIT + 's';

const PLANET_ROTATION_SPEED = 0.0038703;

const ENEMY_SELECTION_KEYCODES = [
  Phaser.Input.Keyboard.KeyCodes.ONE,
  Phaser.Input.Keyboard.KeyCodes.TWO,
  Phaser.Input.Keyboard.KeyCodes.THREE,
  Phaser.Input.Keyboard.KeyCodes.FOUR,
  Phaser.Input.Keyboard.KeyCodes.FIVE,
  Phaser.Input.Keyboard.KeyCodes.SIX,
  Phaser.Input.Keyboard.KeyCodes.SEVEN,
  Phaser.Input.Keyboard.KeyCodes.EIGHT,
  Phaser.Input.Keyboard.KeyCodes.NINE,
  Phaser.Input.Keyboard.KeyCodes.T,
  Phaser.Input.Keyboard.KeyCodes.Y,
  Phaser.Input.Keyboard.KeyCodes.U,
  Phaser.Input.Keyboard.KeyCodes.I,
  Phaser.Input.Keyboard.KeyCodes.O,
  Phaser.Input.Keyboard.KeyCodes.P
];

// TODO: data-drive this
const SHIELD_BUFFER_RATIO = 0.6;
const SHIELD_DEPLETE_RATE = 0.2;
const SHIELD_REGEN_RATE = 0.4;

const PLANET_REPAIR_RATIO = 0.1;

const FALLBACK_ENGINEER_DEXTERITY = 10;

const DEFAULT_SUPPLIES = 100;
const SUPPLIES_DEPLETION_PER_SHIP_TURN = 1;

const SUPPLIES_BAR_WIDTH = GAME_WIDTH;

// Spending R&D points
const HULL_HEALTH_PER_POINT = 10;
const SHIELDS_PER_POINT = 7;
const SHIP_DEX_PER_POINT = 1;

const ATK_STRENGTH_PER_POINT = 1;
const ATK_RANGE_PER_POINT = 1;

const SKIPPER_DEX_PER_POINT = 1;

const GUNNER_DEX_PER_POINT = 1;

const ENGINEER_DEX_PER_POINT = 1;
const ENGINE_MAX_SPEED_PER_POINT = 1;

const SHIELD_OPERATOR_DEX_PER_POINT = 1;

const CAMERA_DIST_TWEEN_SNAP = 27.5;
const CAMERA_DIST_TWEEN_SNAP_SQUARED = CAMERA_DIST_TWEEN_SNAP * CAMERA_DIST_TWEEN_SNAP;

const PORTRAIT_FRAMES = {
  'bryce': [0, 1]
};

// taken from
// https://gist.github.com/nikolas/b0cce2261f1382159b507dd492e1ceef
const lerpColor = function(a, b, amount) {
    const ar = a >> 16,
          ag = a >> 8 & 0xff,
          ab = a & 0xff,

          br = b >> 16,
          bg = b >> 8 & 0xff,
          bb = b & 0xff,

          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
};


