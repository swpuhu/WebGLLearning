const shaders = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    uniform vec2 u_canvas_size;
    uniform mat4 u_rotate;
    uniform mat4 u_projection;
    uniform float u_filpY;
    void main () {
        vec4 mid_position = u_rotate * a_position;
        // gl_Position = mid_position * 2.0 / vec4(u_canvas_size, 1.0, 1.0) - 1.0;
        gl_Position = u_projection * mid_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;
    out vec4 color;

    uniform sampler2D u_texture;
    void main () {
        color = texture(u_texture, v_texCoord);
    }
    `
}


export default shaders;