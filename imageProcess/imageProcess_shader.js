const shaders = {
    vertexShader: `#version 300 es

    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;

    uniform mat4 u_projection;
    uniform float u_flipY;
    void main () {
        gl_Position = u_projection * a_position;
        if (u_flipY == 1.0) {
            gl_Position = gl_Position * vec4(1.0, -1.0, 1.0, 1.0);
        }
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    out vec4 out_color;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform int u_type;
    void main () {
        vec2 one_pixel = vec2(1.0, 1.0) / u_resolution;
        vec2 L_texCoord = v_texCoord + vec2(-one_pixel.x, 0.0);
        vec2 R_texCoord = v_texCoord + vec2(one_pixel.x, 0.0);
        vec2 U_texCoord = v_texCoord + vec2(0.0, one_pixel.y);
        vec2 D_texCoord = v_texCoord + vec2(0.0, -one_pixel.y);

        vec4 L_color = texture(u_texture, L_texCoord);
        vec4 R_color = texture(u_texture, R_texCoord);
        vec4 U_color = texture(u_texture, U_texCoord);
        vec4 D_color = texture(u_texture, D_texCoord);
        vec4 color = texture(u_texture, v_texCoord);
        if (u_type == 0) {
            out_color = color;
        } else if (u_type == 1) {
            // 反色
            out_color = vec4(1.0 - color.rgb, color.a);
        } else if (u_type == 2) {
            // 黑白
            out_color = color.rrra;
        } else {

            out_color = vec4((color - L_color).rgb, 1.0);
        }

        // out_color = color;
        
        
    }
    `
}

export default shaders;