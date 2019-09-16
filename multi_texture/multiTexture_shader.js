const shaders = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    out vec4 v_position;
    uniform vec2 u_canvas_size;
    uniform mat4 u_rotate;
    uniform mat4 u_projection;
    uniform float u_filpY;
    void main () {
        vec4 mid_position = u_rotate * a_position;
        gl_Position = u_projection * mid_position;
        v_texCoord = a_texCoord;
        v_position = gl_Position;
    }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;
    in vec4 v_position;
    out vec4 color;

    uniform sampler2D u_texture;
    uniform sampler2D u_texture2;
    void main () {
        vec4 color1 = texture(u_texture, v_texCoord);
        vec4 color2 = texture(u_texture2, v_texCoord);
        if (v_position.x > 0.0) {
            color = color1;
        } else {
            color = color2;
        }
    }
    `
}


export default shaders;