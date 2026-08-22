//graphtoy.com
uniform vec2 uMouse;
uniform float uTime; uniform float uSine;
uniform vec2 uResolution; uniform float uAspect;
uniform float uFrequency; uniform float uNormalFrequency;

uniform sampler2D uTexture;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

const float pi = 3.1415926535;

vec2 fisheye(vec2 uv, vec2 xy, float maxFactor) {
    float d = length(xy);
    float distortionSize = 2.0; //default 2.0
    if (d < (distortionSize - maxFactor)) {
        d = length(xy * maxFactor);// + 1.0;

        float z = sqrt(1.0 - d * d); //THIS ONE! default: sqrt(1.0 - d * d);
        float r = atan(d, z) / pi;
        float phi = atan(xy.y, xy.x);

        uv.x = r * cos(phi) + 0.5; uv.y = r * sin(phi) + 0.5;
        return uv;
    } else { return 0.5 * xy + 0.5; } //as a reference for the uv reverse calculation
}

vec2 radiant(vec2 uv, vec2 xy, float maxFactor) {
    float d = length(xy);
    float distortionSize = 1.5; //default 2.0
    if (d < (distortionSize - maxFactor)) {
        d = length(uv + maxFactor);// + 1.0;

        float z = sqrt(1.0 - d * d); //THIS ONE! default: sqrt(1.0 - d * d);
        float r = atan(d, z) / pi;
        float phi = atan(xy.y, xy.x);

        uv.x = r * cos(phi) + 0.5; uv.y = r * sin(phi) + 0.5;
        return uv;
    } else { return 0.5 * xy + 0.5; } //as a reference for the uv reverse calculation
}

void main() {
    vec2 uv = vUV;
    vec2 xy = 2.0 * vUV - 1.0;

    float aperture = 175.0;
    float apertureHalf = 0.5 * aperture * (pi / 180.0);
    float maxFactor = sin(apertureHalf);

    vec2 fisheye = fisheye(uv, xy, maxFactor);
    vec2 radiant = radiant(uv, xy, maxFactor);

    vec2 finalCoord = radiant;
    //finalCoord = finalCoord * 1.05 - 0.025;

    gl_FragColor = texture2D(uTexture, finalCoord);
}
