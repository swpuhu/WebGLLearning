    import util from '../util.js';
const shader = {
    vertexShader: `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;

    uniform vec3 u_size;
    uniform mat4 u_rotateX;
    uniform mat4 u_rotateY;
    uniform mat4 u_rotateZ;
    void main () {
        vec4 mid_position = u_rotateX * u_rotateY * u_rotateZ * a_position;
        // mid_position.xy = mid_position.xy / mid_position.z * 60.0;
        mid_position = vec4(mid_position.xy / u_size.xy * 2.0 - 1.0, mid_position.z, 1.0);
        mid_position.z = mid_position.z / u_size.z * 2.0;
        float divisor = 1.0 + mid_position.z * 2.;
        mid_position.xy = mid_position.xy / divisor;
        gl_Position = mid_position;
        v_color = a_color;
    }
    `,
    fragmentShader: `
    precision mediump float;
    varying vec4 v_color;
    void main () {
        gl_FragColor = v_color;
        // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
    
    `
}
const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2');
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);

const points = new Float32Array([
    0, 0, 200, 1.0, 1.0, 0.0,
    300, 0, 200, 1.0, 1.0, 0.0,
    300, 300, 200, 1.0, 1.0, 0.0,
    300, 300, 200, 1.0, 1.0, 0.0,
    0, 300, 200, 1.0, 1.0, 0.0,
    0, 0, 200, 1.0, 1.0, 0.0,

    
    0, 0, 500, 1.0, 0.0, 1.0,
    300, 0, 500, 1.0, 0.0, 1.0,
    300, 300, 500, 1.0, 0.0, 1.0,
    300, 300, 500, 1.0, 0.0, 1.0,
    0, 300, 500, 1.0, 0.0, 1.0,
    0, 0, 500, 1.0, 0.0, 1.0,

    0, 0, 200,      0.0, 1.0, 1.0,
    0, 300, 200,    0.0, 1.0, 1.0,
    0, 0, 500,      0.0, 1.0, 1.0,
    0, 0, 500,      0.0, 1.0, 1.0,
    0, 300, 200,    0.0, 1.0, 1.0,
    0, 300, 500,      0.0, 1.0, 1.0,

    300, 0, 200,    0.0, 0.5, 0.8,
    300, 0, 500,    0.0, 0.5, 0.8,
    300, 300, 200,  0.0, 0.5, 0.8,
    300, 300, 200,  0.0, 0.5, 0.8,
    300, 0, 500,    0.0, 0.5, 0.8,
    300, 300, 500,  0.0, 0.5, 0.8,

    0, 300, 200,    0.2, 0.5, 0.6,
    300, 300, 200,  0.2, 0.5, 0.6,
    0, 300, 500,    0.2, 0.5, 0.6,
    0, 300, 500,    0.2, 0.5, 0.6,
    300, 300, 200,  0.2, 0.5, 0.6,
    300, 300, 500,  0.2, 0.5, 0.6,

    0, 0, 200,    0.5, 0.5, 0.8,
    0, 0, 500,    0.5, 0.5, 0.8,
    300, 0, 200,  0.5, 0.5, 0.8,
    300, 0, 200,  0.5, 0.5, 0.8,
    0, 0, 500,    0.5, 0.5, 0.8,
    300, 0, 500,  0.5, 0.5, 0.8,



]);
const f32size = Float32Array.BYTES_PER_ELEMENT;

let program = util.initWebGL(gl, shader.vertexShader, shader.fragmentShader);
gl.useProgram(program);

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

const a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, f32size * 6, 0);

const u_size = gl.getUniformLocation(program, 'u_size');
gl.uniform3f(u_size, width, height, 1000);

const a_color = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, f32size * 6, f32size * 3);

const u_rotateX = gl.getUniformLocation(program, 'u_rotateX');
let rotateX = util.createRotateMatrix({x: 150, y: 150, z: 350}, 30, 'x');
gl.uniformMatrix4fv(u_rotateX, false, rotateX);

const u_rotateY = gl.getUniformLocation(program, 'u_rotateY');
let rotateY = util.createRotateMatrix({x: 150, y: 150, z: 350}, 90, 'y');
gl.uniformMatrix4fv(u_rotateY, false, rotateY);

const u_rotateZ = gl.getUniformLocation(program, 'u_rotateZ');
let rotateZ = util.createRotateMatrix({x: 150, y: 150, z: 350}, 0, 'z');
gl.uniformMatrix4fv(u_rotateZ, false, rotateZ);

gl.drawArrays(gl.TRIANGLES, 0, 36);

