
uniform vec3 uColor;
uniform sampler2D uTexture;
uniform float uTime; uniform float uSpeed;
uniform vec2 uResolution; uniform vec2 uMouse;
uniform float uFrequency; uniform float uNormalFrequency;

varying vec3 vNormal;
varying vec2 vUV;

const float pi = 3.1415926535;

float threshold(float color, float max) {
    if (color > max) { return 1.0; } else { return 0.0; }
}

void main() {
    vec2 uv = vUV * 2.0 - 1.0; vec2 uv0 = uv;
    //vec3 finalColor = vec3(abs(sin(uTime)), 0.0, abs(cos(uTime)));

    vec4 finalTexture = texture2D(uTexture, vUV);
    vec3 finalColor = finalTexture.rgb;

    //grayscale
    vec4 lum = vec4(0.215, 0.715, 0.075, 0.0);
    float grayscale = dot(finalTexture, lum);

    //threshold
    float maxValue = 0.5;
    finalColor = vec3(threshold(grayscale, maxValue));

    gl_FragColor = vec4(finalColor, 1.0);
}
