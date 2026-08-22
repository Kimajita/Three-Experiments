//graphtoy.com
uniform vec2 uMouse;
uniform float uTime; uniform float uSine;
uniform vec2 uResolution; uniform float uAspect;
uniform float uFrequency; uniform float uNormalFrequency;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

const float pi = 3.1415926535;

vec3 gradient(float t) {

    //https://dev.thi.ng/gradients/
    vec3 a = vec3(0.7, 0.1, 0.5);
    vec3 b = vec3(0.37, 0.05, 0.37);
    vec3 c = vec3(1.0, 2.0, 0.15);
    vec3 d = vec3(3.0, 0.35, 1.0);

    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = vUV * 2.0 - 1.0; vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0, 0.0, 0.0);

    uv += uTime * 0.01;
    uv += uMouse;

    for (float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * 1.5); //split
        uv -= 0.5; //center

        float d = length(uv) * exp(-length(uv0));
        //the distance of each point towards the center

        float offset = 0.5;
        vec3 color = gradient(length(uv0) + i * offset + uTime * offset);

        float freq = 9.0; float seed = uTime * offset;
        d = sin(d * freq + seed)/freq; //radial animation
        d = abs(d); //an absolute value from 0 to one - takes out filling
        //d = smoothstep(0.0, 0.1, d); //threshold with fading

        float inverse = 0.0125;
        d = pow(inverse / d, 1.25); //inverted glow rings

        finalColor += color * d; //multiply color with circles
        finalColor.x = finalColor.x * uNormalFrequency * 0.75;
        finalColor.y = finalColor.y * uNormalFrequency * 0.5;
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
