
uniform vec3 uColor;
uniform float uTime; uniform float uTimeLimit;
uniform vec2 uResolution; uniform vec2 uMouse;
uniform float uFrequency; uniform float uNormalFrequency;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

const float pi = 3.1415926535;

float smoothMin(float shape1, float shape2, float n) {
    float h = max(n - abs(shape1 - shape2), 0.0) / n;
    float min = min(shape1, shape2) - h * h * h * n * (1.0 / 6.0);
    return min;
}

//returns signed distance of a sphere, taking it's position and radius
float sdSphere(vec3 pos, float radius) { return length(pos) - radius; }
float sdBox(vec3 pos, vec3 size) {
    vec3 q = abs(pos) - size;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {

    float sphereRadius = 1.0;
    float sphereScale = 1.25;
    vec3 sphereOrigin = vec3(sin(uTime), cos(uTime), 0.);
    float sphere = sdSphere((p - sphereOrigin) * sphereScale, sphereRadius) / sphereScale; //p is the current point, then we substract the spheres origin

    float boxScale = 2.0;
    vec3 boxOrigin = vec3(0.0, 0.0, sin(uTime));
    float box = sdBox((p - boxOrigin) * boxScale, vec3(0.75, 0.75, 0.75)) / boxScale; //you need to devide by the scale again to avoid changing the actual position of the box

    float offset = 0.95;
    float ground = p.y + offset; //without the offset, the ground would sit at the same height as the camera, resulting in a black screen

    //float scene = min(sphere, box); //calculates which of these objects is closer to the origin p
    float scene = smoothMin(sphere, box, 1.0);
    scene = min(ground, scene);
    return scene;
}

void main() {

    //SETUP
    vec2 uv0 = vUV;                 //KEEP THESE CONSTANT!!
    vec2 uv = uv0 * 2.0 - 1.0;      //
    vec3 finalColor = vec3(1.);

    //RAYMARCHING
    //World
    vec3 worldOrigin = vec3(0.0);
    vec3 rayOrigin = vec3(worldOrigin.xy, -3.0);        //ray starts 3 units from worldOrigin towards viewer
    float fov = 1.0;
    vec3 rayDirection = normalize(vec3(uv * fov, 1.));        //ray points towards z direction, 1.0 being the windows

    //Marching
    float t = 0.0;                                      //total distance travelled
    int steps = 42;
    for (int i = 0; i < steps; i++) {
        vec3 p = rayOrigin + rayDirection * t;          //point at origin, add the travelled distance on the raydirection, that's the current position
        float d = map(p);                               //basically the "safe distance" p can travel to without hitting an object
        t += d;                                         //the actual marching adds the distance from the hit object to the total distance travelled

        float max = 0.01;
        if (d < max) { break; }                         //exit if too close to object
        if (t > 100.0) { break; }                       //exit if distance gets too far to make an actual difference for the viewer
    }

    //COMPOSITION
    float zBuffer = 0.2;
    finalColor = vec3(t * zBuffer); //color based on distance

    gl_FragColor = vec4(finalColor, 1.0);
}
