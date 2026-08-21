
uniform float uTime;
uniform float uSine;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uAspect;
uniform vec2 uMouse;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

void main() {

    vPosition = position;
    vNormal = normal;
    vUV = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
