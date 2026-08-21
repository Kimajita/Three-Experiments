
uniform float uTime;
uniform float uSine;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uAspect;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

void main() {
    vec2 uv = vUV * 2.0 - 1.0;

    float d = length(uv); //the distance of each point towards the center - black circle
    float freq = 7.0;
    float seed = uSine;
    d = sin(d * freq + seed)/freq;
    //d -= 0.5; //radius from 1 to 0.5 - filled circle
    d = abs(d); //an absolute value from 0 to one - takes out filling
    //d = step(0.1, d); //threshold to create distinct circle line
    d = smoothstep(0.0, 0.1, d); //threshold with fading

    gl_FragColor = vec4(d, d, d, 1.0);
}
