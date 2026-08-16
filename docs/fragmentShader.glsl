varying vec3 v_Normal;
varying vec2 v_Uv;

uniform sampler2D u_Texture;

void main() {
    vec4 texture = texture2D(u_Texture, v_Uv);



    vec4 out1 = texture;
    gl_FragColor = out1;
}
