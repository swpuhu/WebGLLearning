const shaders = {
    vertexShader: `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    uniform mat4 u_projection;
    uniform mat4 u_rotate;
    uniform vec2 u_aspect;
    void main () {
        vec4 mid_position = u_rotate * a_position;
        gl_Position = mid_position / vec4(u_aspect, 1.0, 1.0) * 2.0 - 1.0;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `
    precision mediump float;

    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main () {
        // out_color = vec4(1.0, 1.0, 0.0, 1.0);
        vec4 mid_color = texture2D(u_texture, v_texCoord);
        gl_FragColor = mid_color;
        // out_color = vec4(mid_color.ggg * 1.0, mid_color.a);
    }
    `
}

export default shaders;