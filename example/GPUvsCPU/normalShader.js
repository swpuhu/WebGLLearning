export const vertexShader = `
    precision mediump float;
    attribute vec4 a_position;
    void main () {
        gl_Position =  a_position;
    }
`


export const fragmentShader = `


    precision mediump float;
    uniform float u_test;
    void main () {
        highp vec4 color = vec4(vec3(u_test), 1.0);
        float i = 0.0;
        gl_FragColor = color;
    }
`