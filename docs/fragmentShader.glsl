
uniform vec3 uColor;
uniform float uTime; uniform float uTimeLimit;
uniform vec2 uResolution; uniform vec2 uMouse;
uniform float uFrequency; uniform float uNormalFrequency;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

const float pi = 3.1415926535;

vec2 rotate(vec2 st, float rot) {
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
    if (index == 1.0) {
        st = rotate(st, pi * 0.5);
    } else if (index == 2.0) {
        st = rotate(st, pi * -0.5);
    } else if (index == 3.0) {
        st = rotate(st, pi);
    }

    return st;
}

void main() {

    //Basic Setup
    vec2 uv = vUV;
    float mult = 2.0;
    vec2 st = uv * mult - (mult / 2.0);
    vec3 finalColor = vec3(1.0, 1.0, 1.0);
    vec2 mouse = vec2(uMouse.x, 1.0 - uMouse.y);

    //Fractures
    uv = fract(st * 4.2);
    uv = rotateTiles(uv);

    //Gradients
    vec3 col1 = vec3(0.25, 0.25, 0.0);
    vec3 col2 = vec3(0.0, 0.25, 0.25);
    vec3 col3 = vec3(0.25, 0.0, 0.25);
    vec3 col4 = vec3(0.25, 0.25, 0.25);

    col1 = vec3(0.7, 0.5, 0.65);
    col2 = vec3(0.3, 0.15, 0.9);
    col3 = vec3(0.7, 0.35, 0.75);
    col4 = vec3(0.15, 0.82, 1.0);

    float freq1 = 0.25; float amp1 = 1.5; float off1 = 0.25;
    float freq2 = 0.5; float amp2 = 3.0; float off2 = 0.0;
    float freq3 = 1.0; float amp3 = 5.0; float off3 = 0.0;
    float freq4 = 2.0; float amp4 = 7.0; float off4 = -0.5;

    vec3 blend1 = mix(col1, col2, sin(uTime * freq1) * amp1 + off1);
    vec3 blend2 = mix(col2, col3, cos(uTime * freq2) * amp2 + off2);
    vec3 blend3 = mix(col3, col4, sin(uTime * freq3) * amp3 + off3);
    vec3 blend4 = mix(col4, col1, cos(uTime * freq4) * amp4 + off4);

    vec3 grad1 = mix(blend1, blend2, uv.x);
    vec3 grad2 = mix(blend3, blend4, uv.y);
    vec3 gradient = mix(grad1, grad2, abs(st.x * st.y));

    //SDF (signed distance function)
    float range = 0.025; float min = 0.37;
    float radius = pow(uNormalFrequency, 2.0) * range + min;

    //vec3 circle = vec3(0.5, 0.5, radius); //position x and y, radius z
    vec3 circle = vec3(sin(mouse * 0.25 + 0.375), radius);

    float d = length(uv - circle.xy) - circle.z; //length calculates the distance (which is the border between the shape and the outside)
    //calc: length between the current position and the shapes center position, from which the radius is subtracted to get the distance to the EDGE of the shape
    d = fract(d * mix(7.0, 13.0, sin(uTime * freq2)));

    //next we check if we're inside the shape or not so we can either draw black or white:
    float black = 0.0; float white = 2.0;
    d = smoothstep(black, white, d); //sharpens edge, if d > 0.1 display white, if d < 0 display black, interpolate inbetween

    //finalColor = -vec3(d - gradient);
    finalColor = vec3(d / gradient);
    finalColor = pow(finalColor, vec3(-10.5)) + vec3(0.0);

    gl_FragColor = vec4(finalColor, 1.0);
}
