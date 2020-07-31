export const vertexShader = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        v_color = a_color;
    }
`;

export const fragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    void main () {
        gl_FragColor = v_color;
    }
`