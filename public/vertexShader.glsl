varying vec3 v_Normal;
varying vec2 v_Uv;

varying vec3 L;
varying vec3 V;

attribute vec3 tangent;
attribute vec3 bitangent;

void main() {
    v_Normal = normal;
    v_Uv = uv;

    vec3 surfaceNormal = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);
    vec3 tang = normalize((modelViewMatrix * vec4(tangent, 0.0)).xyz);
    vec3 bitang = normalize(cross(surfaceNormal, tang));
    mat3 toTangentSpace = mat3(tang, bitang, surfaceNormal);

    //L = toTangentSpace * (lightPosition - (modelViewMatrix * vec4(position, 1.0)).xyz);
    //V = toTangentSpace * (- (modelViewMatrix * vec4(position, 1.0)).xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
