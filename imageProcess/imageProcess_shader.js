const util = `
    vec4 average(vec4 v) {
        float avg = (v.r + v.g + v.b) / 3.0;
        return vec4(avg, avg, avg, v.a);
    }
`


const shaders = {
    vertexShader: `#version 300 es

    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;

    uniform mat4 u_projection;
    uniform int u_flipY;
    uniform mat4 u_rotate;
    uniform mat4 u_scale;
    uniform mat4 u_translate;
    void main () {
        gl_Position = u_projection * u_translate * u_scale * u_rotate * a_position;
        // gl_Position = u_projection * a_position;
        if (u_flipY == 1) {
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
    uniform float u_gaussian_radius;
    ${util}
    void main () {
        vec2 one_pixel = vec2(1.0, 1.0) / u_resolution;
        vec4 color = texture(u_texture, v_texCoord);
        if (u_type == 0) {
            out_color = color;
        } else if (u_type == 1) {
            // 反色
            out_color = vec4(1.0 - color.rgb, color.a);
        } else if (u_type == 2) {
            // 黑白
            out_color = average(color);
        } else if (u_type == 3) {
            // 颜色偏移
            vec2 offsetCoord = one_pixel * vec2(3.0, 4.0);
            vec4 maskR = texture(u_texture, v_texCoord - offsetCoord);
            vec4 maskG = texture(u_texture, v_texCoord + offsetCoord);
            out_color = vec4(maskR.r, maskG.g, color.b, color.a);
        } else if (u_type == 5) {
            // 高斯模糊
            vec2 L_texCoord = v_texCoord + vec2(-1.0, 0.0) * one_pixel * u_gaussian_radius;
            vec2 R_texCoord = v_texCoord + vec2(1.0, 0.0) * one_pixel * u_gaussian_radius;
            vec2 U_texCoord = v_texCoord + vec2(0.0, 1.0) * one_pixel * u_gaussian_radius;
            vec2 D_texCoord = v_texCoord + vec2(0.0, -1.0) * one_pixel * u_gaussian_radius;
    
            vec4 L_color = texture(u_texture, L_texCoord);
            vec4 R_color = texture(u_texture, R_texCoord);
            vec4 U_color = texture(u_texture, U_texCoord);
            vec4 D_color = texture(u_texture, D_texCoord);
            out_color = vec4((0.5 * color + 0.125 * L_color + 0.125 * R_color + 0.125 * U_color + 0.125 * D_color).rgb, color.a);
        } else if (u_type == 6) {
            // 三角形划像
            out_color = color;
        } else {
            out_color = color;
        }
    }
    `
}

export default shaders;