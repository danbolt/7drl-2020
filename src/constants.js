const GAME_WIDTH = 426;
const GAME_HEIGHT = 240;

const DEFAULT_TEXT_SIZE = 12;

const DEFAULT_IMAGE_MAP = 'test_sheet_image';
const DEFAULT_IMAGE_SPRITE = DEFAULT_IMAGE_MAP + '_whole_image';

const CAMERA_DISTANCE = 6.0;
const CAMERA_TURN_INVERT = -1;
const CAMERA_TURN_SPEED = 0.1 * CAMERA_TURN_INVERT;
const CAMERA_PAN_SPEED = 0.3;
const DOUBLE_CAMERA_PAN_SPEED = CAMERA_PAN_SPEED * 2.0;

const DEFAULT_POSITION_TWEEN_DURATION = 2000;

const DUMMY_3D_CUBE_GEOM = new THREE.BoxBufferGeometry( 1, 1, 1 );

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
  Phaser.Input.Keyboard.KeyCodes.NINE
];

// TODO: data-drive this
const SHIELD_BUFFER_RATIO = 0.6;
const SHIELD_DEPLETE_RATE = 0.2;
const SHIELD_REGEN_RATE = 0.4;

const PLANET_REPAIR_RATIO = 0.1;

const FALLBACK_ENGINEER_DEXTERITY = 10;


