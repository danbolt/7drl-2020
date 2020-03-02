

varying float shadow;
varying vec3 worldPos;

void main() {
	vec4 pos = vec4( position, 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * pos;

	worldPos = position;
	shadow = worldPos.y < 0.0 ? 0.43 : 0.0;
}