
uniform vec3 uColor;
uniform float uTime; uniform float uTimeLimit;
uniform vec2 uResolution; uniform vec2 uMouse;
uniform float uFrequency; uniform float uNormalFrequency;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

const float pi = 3.1415926535;

void main() {

    //SETUP
    vec2 uv0 = vUV;                 //KEEP THESE CONSTANT!!
    vec2 uv = uv0 * 2.0 - 1.0;      //
    vec3 finalColor = vec3(1.);

    //RAYMARCHING
    //World
    vec3 worldOrigin = vec3(0.0);
    vec3 rayOrigin = vec3(worldOrigin.xy, -3.0);        //ray starts 3 units from worldOrigin towards viewer
    vec3 rayDirection = normalize(vec3(uv, 1.));        //ray points towards z direction, 1.0 being the windows

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
