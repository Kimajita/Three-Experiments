
uniform vec3 uColor;
uniform sampler2D uTexture;
uniform float uTime; uniform float uSpeed;
uniform vec2 uResolution; uniform vec2 uMouse;
uniform float uFrequency; uniform float uNormalFrequency;

varying vec3 vNormal;
varying vec2 vUV;

const float pi = 3.1415926535;

float threshold(float color, float white, float grey) {
    if (color > white) { return 1.0; }
        else if (color > grey) { return 0.5; }
            else { return 0.0; }
}

float grain(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.23))) * 43758.5453);
}

void main() {
    vec2 uv = vUV * 2.0 - 1.0; vec2 uv0 = uv;
    //vec3 finalColor = vec3(abs(sin(uTime)), 0.0, abs(cos(uTime)));

    vec4 finalTexture = texture2D(uTexture, vUV);
    vec3 finalColor = finalTexture.rgb;

    //greyscale
    vec4 lum = vec4(0.215, 0.715, 0.075, 0.0);
    float greyscale = dot(finalTexture, lum);

    //threshold
    //float maxWhite = abs(sin(uTime)) / 2.0 + 0.2; float maxGrey = abs(sin(uTime)) / 2.0 + 0.015;
    float maxWhite = 0.5; float maxGrey = 0.35;

    //grain
    float grainFactor = 1.2;
    greyscale = greyscale + ((grain(uv) / 9.0) * grainFactor);
    finalColor = vec3(threshold(greyscale, maxWhite, maxGrey));

    gl_FragColor = vec4(finalColor, 1.0);
}
