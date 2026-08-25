
uniform vec3 uColor;
uniform float uTime; uniform float uTimeLimit;
uniform vec2 uResolution; uniform vec2 uMouse;
uniform float uFrequency; uniform float uNormalFrequency;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

const float pi = 3.1415926535;

//returns signed distance of a sphere, taking it's position and radius
float sdSphere(vec3 pos, float radius) { return length(pos) - radius; }
float sdBox(vec3 pos, vec3 size) {
    vec3 q = abs(pos) - size;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float sdOctahedron(vec3 pos, float size) { pos = abs(pos); return (pos.x + pos.y + pos.z - size) * 0.57735027; }

float smoothMin(float shape1, float shape2, float n) {
    float h = max(n - abs(shape1 - shape2), 0.0) / n;
    float min = min(shape1, shape2) - pow(h, 3.0) * n * (1.0 / 6.0);
    return min;
}

mat2 rotate2D(float angle) { return mat2(cos(angle), -sin(angle), sin(angle), cos(angle)); }
vec3 rotate3D(vec3 pos, vec3 axis, float angle) { return mix(dot(axis, pos) * axis, pos, cos(angle)) + cross(axis, pos) * sin(angle); }

//https://dev.thi.ng/gradients/
vec3 gradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b * cos(pi * 2.0 * (c * t + d)); }

float map(vec3 p) {
    float sphereScale = 1.0;
    float sphereRadius = 0.5;
    vec3 sphereOrigin = vec3(sin(uTime), cos(uTime), 0.);
    float sphere = sdSphere((p - sphereOrigin) * sphereScale, sphereRadius) / sphereScale; //p is the current point, then we substract the spheres origin

    p.z += uTime * 0.5; //movement towards camera

    float boxScale = 1.25;
    vec3 boxSize = vec3(0.1, 0.1, 0.1);

    vec3 q = p; //input copy
    //q.y -= uTime * 0.15; //upward movement
    //q = fract(q) - 0.5; //space repetition

    //space repetition:
    q.xy = mod(q.xy, 1.0) - 0.5;
    q.z = mod(q.z, 0.25) - 0.125;

    vec3 boxOrigin = vec3(0.0, 0.0, 0.0);
    vec3 boxPos = rotate3D(q, vec3(0.0, 1.0, 0.0), uTime);
    float box = sdBox((boxPos - boxOrigin) * boxScale, boxSize) / boxScale; //you need to devide by the scale again to avoid changing the actual position of the box

    float offset = 0.95;
    float ground = p.y + offset; //without the offset, the ground would sit at the same height as the camera, resulting in a black screen

    //float scene = min(sphere, box); //calculates which of these objects is closer to the origin p
    float scene = smoothMin(sphere, box, 0.25);
    scene = min(ground, box);
    return scene;
}

void main() {

    //SETUP
    vec2 uv0 = vUV;                 //KEEP THESE CONSTANT!!
    vec2 uv = uv0 * 2.0 - 1.0;      //
    vec3 finalColor = vec3(1.);
    vec2 mouse = uMouse * 2.0 - 1.0;
    mouse = mouse * 0.5;

    //RAYMARCHING
    //World
    vec3 worldOrigin = vec3(0.0);
    vec3 rayOrigin = vec3(worldOrigin.xy, -3.0);        //ray starts 3 units from worldOrigin towards viewer
    float fov = 1.0;
    vec3 rayDirection = normalize(vec3(uv * fov, 1.));        //ray points towards z direction, 1.0 being the windows

    //Vertical Camera Rotation (NEEDS TO BE BEFORE HORIZONTAL!!)
    //rayOrigin.yz *= rotate2D(-mouse.y);
    //rayDirection.yz *= rotate2D(-mouse.y);

    //Horizontal Camera Rotation
    rayOrigin.xz *= rotate2D(-mouse.x);
    rayDirection.xz *= rotate2D(-mouse.x);

    //Marching
    float t = 0.0;                                      //total distance travelled
    int steps = 100;
    int i;
    for (i = 0; i < steps; i++) {
        vec3 p = rayOrigin + rayDirection * t;          //point at origin, add the travelled distance on the raydirection, that's the current position

        p = rotate3D(p, vec3(0.0, 0.0, 1.0), t * 0.25); //rotate around z depending on the depth (travelled distance t)
        p.y += sin(t) * uMouse.y;// * 0.42;                           //wiggle the ray

        float d = map(p);                               //basically the "safe distance" p can travel to without hitting an object
        t += d;                                         //the actual marching adds the distance from the hit object to the total distance travelled

        float max = 0.01;
        if (d < max) { break; }                         //exit if too close to object
        if (t > 100.0) { break; }                       //exit if distance gets too far to make an actual difference for the viewer
    }

    //COMPOSITION
    float zBuffer = 0.142;
    finalColor = vec3(t * zBuffer + float(i) * 0.0042);

    //COLORING
    vec3 a = vec3(0.938, 0.328, 0.718);
    vec3 b = vec3(0.659, 0.438, 0.328);
    vec3 c = vec3(0.388, 0.388, 0.296);
    vec3 d = vec3(2.538, 2.478, 0.168);
    finalColor = gradient(finalColor.x, a, b, c, d);

    gl_FragColor = vec4(finalColor, 1.0);
}
