uniform float uTime;
uniform float uSpeed;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

void main() {

    vNormal = normal;
    vPosition = position;
    vUV = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
