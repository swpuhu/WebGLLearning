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
    uniform sampler2D u_texture;
    void main () {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;