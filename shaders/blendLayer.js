
export const vertexShader = `
        attribute vec4 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main () {
            gl_Position = a_position;
            v_texCoord = a_texCoord;
        }
    `;
export const fragmentShader = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture1;
    uniform sampler2D u_texture2;
    uniform int u_blend_type;
    void main () {
        vec4 color1 = texture2D(u_texture1, v_texCoord);
        vec4 color2 = texture2D(u_texture2, v_texCoord);
        if (u_blend_type == 0) {
            gl_FragColor = vec4(color2.rgb * color2.a + color1.rgb * (1.0 - color2.a), color1.a + color2.a);
        } else if (u_blend_type == 1) {
            gl_FragColor = vec4(color1.rgb, color1.a * color2.r);
        } else if (u_blend_type == 2) {
            gl_FragColor = vec4(color2.rgb * color2.a + color1.rgb * (1.0 - color2.a), 1.0 - (1.0 - color1.a) * (1.0 - color2.a));
        }
    }
    `