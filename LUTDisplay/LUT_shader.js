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
        vec4 mid_position = a_position;
        // gl_Position = mid_position * 2.0 / vec4(u_canvas_size, 1.0, 1.0) - 1.0;
        gl_Position = u_projection * mid_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;
    out vec4 color;
    uniform vec2 u_resolution;

    uniform sampler2D u_texture;
    uniform sampler2D u_lut;
    void main () {
        // if (gl_FragCoord.x < 512.0) {
        //     color = vec4(0.0, 0.0, 0.0, 1.0);
        // } else {
            color = texture(u_texture, v_texCoord);
            float b = color.b * 255.0;
            float r = color.r * 255.0;
            float g = color.g * 255.0;
            int b_pos = int(floor(b / 4.0));
            int r_pos = int(floor(r / 4.0));
            int g_pos = int(floor(g / 4.0));
            int row = int(b_pos) / 8;
            int col = int(b_pos) % 8;
            int i_row = g_pos;
            int i_col = r_pos;
            float x = float(col * 64 + i_col) / 512.0;
            float y = float(row * 64 + i_row) / 512.0;
            
            // color = texture(u_lut, vec2(x, y));
            color = texture(u_lut, v_texCoord);
            
        // }
    }
    `
}


export default shaders;