
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform float scaleNoise;
uniform int deRes;
uniform int displayShadow;

varying float shadow;
varying vec3 worldPos;

// 3D noise function taken from
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {
	vec4 shadowVector = vec4(shadow, shadow, shadow, 0.0); 
	if (displayShadow < 1) {
		shadowVector = vec4(0.0, 0.0, 0.0, 0.0);
	}

	vec3 lowResWorld = worldPos;
	if (deRes > 0) {
		lowResWorld = floor(worldPos * 5.0) / 5.0;
	}
	float noiseValue = noise(lowResWorld * scaleNoise);
	vec4 topologyColor = vec4(0.0, 0.0, 0.0, 1.0);
	if (noiseValue < 0.5) {
		topologyColor.x = mix(color1.x, color2.x, noiseValue * 2.0);
		topologyColor.y = mix(color1.y, color2.y, noiseValue * 2.0);
		topologyColor.z = mix(color1.z, color2.z, noiseValue * 2.0);
	} else {
		topologyColor.x = mix(color2.x, color3.x, (noiseValue - 0.5) * 2.0);
		topologyColor.y = mix(color2.y, color3.y, (noiseValue - 0.5) * 2.0);
		topologyColor.z = mix(color2.z, color3.z, (noiseValue - 0.5) * 2.0);
	}
	gl_FragColor = topologyColor - (shadowVector);
}