
uniform float uTime;
uniform vec2 uResolution; uniform vec2 uMouse;
uniform float uFrequency; uniform float uNormalFrequency; uniform float uLagFrequency;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

const float pi = 3.1415926535;

//mat2 rotate2D(float angle) { return mat2(cos(angle), -sin(angle), sin(angle), cos(angle)); }
//vec3 rotate3D(vec3 pos, vec3 axis, float angle) { return mix(dot(axis, pos) * axis, pos, cos(angle)) + cross(axis, pos) * sin(angle); }

//https://dev.thi.ng/gradients/
vec3 gradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b * cos(pi * 2.0 * (c * t + d)); }

vec2 rotate2D(vec2 st, float rot) {
    st -= 0.5;
    st = mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * st;
    st += 0.5;
    return st;
}

vec2 rotateTiles(vec2 st) {
    st *= 2.0;
    float index = 0.0;

    index += step(1.0, mod(st.x, 2.0));
    index += step(1.0, mod(st.y, 2.0)) * 2.0;

    st = fract(st);
    if (index == 1.0) { st = rotate2D(st, pi * 0.5); }
        else if (index == 2.0) { st = rotate2D(st, pi * -0.5); }
            else if (index == 3.0) { st = rotate2D(st, pi); }

    return st;
}

vec2 truchet(vec2 st, float index) {
    index = fract(((index - 0.5) * 2.0));
    if (index > 0.75) { st = vec2(1.0) - st; }
        else if (index > 0.5) { st = vec2(1.0 - st.x, st.y); }
            else if (index > 0.25) { st = 1.0 - vec2(1.0 - st.x, st.y); }
    return st;
}

float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }

float noise2D(vec2 st) {
    vec2 i = floor(st); vec2 f = fract(st);
    float a = random(i); float b = random(i + vec2(1.0, 0.0)); float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
    vec2 u = smoothstep(0.0, 1.0, f); //interpolation
    float noise = mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    return noise;
}

vec2 skew(vec2 st) { //basically tilting, if unsure just test: vec2 col = fract(skew(st));
    vec2 r = vec2(0.0); r.x = 1.1547 * st.x; r.y = st.y + 0.5 * r.x;
    return r;
}

vec3 noise3D(vec2 st) {
    vec3 xyz = vec3(0.0);

    vec2 p = fract(skew(st));
    if (p.x > p.y) { xyz.xy = 1.0 - vec2(p.x, p.y - p.x); xyz.z = p.y; }
    else { xyz.yz = 1.0 - vec2(p.x - p.y, p.y); xyz.x = p.x; }

    return fract(xyz);
}

#define NUM_OCTAVES 5
float fbm(vec2 st) {
    float v = 0.0; float a = 0.5; vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for(int i = 0; i < NUM_OCTAVES; i++) {
        v += a * noise2D(st);
        st = rot * st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec3 rgb(int r, int g, int b) { vec3 rgb = vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0); return rgb; }

void main() {

    //SETUP
    vec2 uv0 = vUV;                 //KEEP THESE CONSTANT!!
    vec2 uv = uv0 * 2.0 - 1.0;      //
    vec3 finalColor = vec3(0.0);
    vec2 mouse = uMouse * 2.0 - 1.0;

    vec2 st = uv;               //input copy

    st *= 2.0;                  //scale coordinations
    vec2 ipos = floor(st);      //integer coordinations
    vec2 fpos = fract(st);      //fractional coordinations

    float beat = uLagFrequency * 0.2 + 0.5;
    float anim = uTime * 0.42;

    vec2 q = vec2(0.0);
    q.x = fbm(st + 0.15 * uTime);
    q.y = fbm(st + vec2(10.0));

    vec2 r = vec2(0.0);
    float x1 = 1.7; float y1 = 9.2; float x2 = 8.2; float y2 = 2.8;
    x1 += anim; x2 += anim; y1 += anim; y2 += anim;

    float speed = uTime * 0.5; //this would be a fantastic opportunity for using bpm detection
    r.x = fbm(st + 7.0 * q + vec2(x1, y1) + speed + sin(beat));
    r.y = fbm(st + 50.0 * q + vec2(x2, y2) + speed - sin(beat));

    float f = fbm(st + r);

    vec3 col1 = rgb(242, 161, 182); vec3 col2 = rgb(42, 42, 125); col1.r += abs(sin(uTime * 0.5)); col2.r += abs(cos(uTime * 0.5));
    vec3 col3 = rgb(95, 0, 195); vec3 col4 = rgb(25, 0, 42); col3.b += abs(sin(uTime * 0.5)); col4.b += abs(cos(uTime * 0.5)); col3.g += sin(uTime * 0.75);
    col1 += beat; col2 += beat; col3 *= beat; col4 *= beat;

    vec3 color = mix(col1, col2, clamp((f*f)*4.0,0.0,1.0));
    color = mix(color, col3, clamp(length(q),0.0,1.0));
    color = mix(color, col4, clamp(length(r.x),0.0,1.0));

    finalColor = color;

    gl_FragColor = vec4(finalColor, 1.0);
}
