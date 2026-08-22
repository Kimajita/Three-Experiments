//graphtoy.com
uniform vec2 uMouse;
uniform float uTime; uniform float uSine;
uniform vec2 uResolution; uniform float uAspect;
uniform float uFrequency; uniform float uNormalFrequency;

uniform sampler2D uTexture;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

const float pi = 3.1415926535;

void main() {

    gl_FragColor = texture2D(uTexture, vUV);
}
