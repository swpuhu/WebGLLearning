export const vertexShader = `
    attribute vec4 a_position;
    uniform mat4 u_perspective;
    uniform mat4 u_scale;
    uniform mat4 u_rotateZ;
    uniform mat4 u_rotateY;
    uniform mat4 u_rotateX;
    uniform mat4 u_translate;
    void main () {
        gl_Position = u_perspective * u_translate * u_rotateX * u_rotateY * u_rotateZ * a_position;
    }
`


export const fragmentShader = `


    precision mediump float;
    void main () {
        highp vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
        gl_FragColor = color;
    }    
`