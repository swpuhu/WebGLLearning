export const vertexShader = `
    precision mediump float;
    attribute vec4 a_position;
    void main () {
        gl_Position =  a_position;
    }
`;

export const fragmentShader = `


    precision mediump float;
    void main () {
        gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
    }
`;
