const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

const DEFAULT_IMAGE_MAP = 'test_sheet_image';
const DEFAULT_IMAGE_SPRITE = DEFAULT_IMAGE_MAP + '_whole_image';

const CAMERA_DISTANCE = 3.0;
const CAMERA_TURN_INVERT = -1;
const CAMERA_TURN_SPEED = 0.1 * CAMERA_TURN_INVERT;
const CAMERA_PAN_SPEED = 0.3;
const DOUBLE_CAMERA_PAN_SPEED = CAMERA_PAN_SPEED * 2.0;

const DUMMY_3D_CUBE_GEOM = new THREE.BoxBufferGeometry( 1, 1, 1 );
const DUMMY_3D_CUBE_MATERIAL = new THREE.MeshBasicMaterial( { color: 0x00FF00 } );