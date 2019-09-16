const shaders = {
    vertexShader: `#version 300 es

    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;

    uniform mat4 u_projection;
    uniform mat4 u_rotate;
    uniform vec2 u_aspect;
    uniform mat4 u_projection;
    void main () {
        // vec4 mid_position = u_rotate * a_position;
        gl_Position = u_projection * u_rotate * a_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;

    out vec4 out_color;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main () {
        // out_color = vec4(1.0, 1.0, 0.0, 1.0);
        vec4 mid_color = texture(u_texture, v_texCoord);
        out_color = mid_color;
        // out_color = vec4(mid_color.ggg * 1.0, mid_color.a);
    }
    `
}

export default shaders;