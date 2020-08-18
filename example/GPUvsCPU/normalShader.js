export const vertexShader = `
    attribute vec4 a_position;
    void main () {
        gl_Position = a_position;
    }
`


export const fragmentShader = `


    precision mediump float;
    void main () {
        highp vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
        gl_FragColor = color;
    }
`