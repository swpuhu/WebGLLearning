import util from '../util.js';

const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;

document.body.appendChild(canvas);

const vertexShader = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    uniform mat4 u_world;
    uniform mat4 u_camera;
    
    // uniform vec4 u_camera;
    void main () {
        gl_Position = u_world * u_camera * a_position;
        v_color = a_color;
    }
`

const fragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    void main () {
        gl_FragColor = v_color;
        // gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    }

`


let gl = canvas.getContext('webgl');
let program = util.initWebGL(gl, vertexShader, fragmentShader);
gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

let uniformSetters = util.createUniformSetters(gl, program);
let attributeSetters = util.createAttributeSetters(gl, program);


let left = -320;
let right = 320;
let top = 180;
let bottom = -180;
let near = 100;
let far = 1000;

let uniforms = {
    u_world: util.createPerspective(near, far, left, right, top, bottom)
}

let line = [];
let r = left / 2;
for (let a = 90; a <= 270; a += 10) {
    let cos = r * Math.cos(a * Math.PI / 180);
    let sin = r * Math.sin(a * Math.PI / 180);
    line.push(cos, sin, far / 2, 1);
}
// let line = [
//     0, 0, far / 2, 1,
//     left / 2, 0, far / 2, 1,
//     left / 2, top / 2, far / 2, 1,
//     0, top / 2, far / 2, 1
// ]

let lines = [line];
let steps = 50;
for (let i = 1; i < steps; i++) {
    let rotateMatrix = util.createRotateMatrix({ x: 0, z: far / 2 }, (360 / (steps - 1)) * i, 'y');
    let newLine = [];
    for (let i = 0; i < line.length; i += 4) {
        let points = line.slice(i, i + 4);
        let newPoints = util.MatMultiVec(points, rotateMatrix);
        newLine.push(...newPoints);
    }
    lines.push(newLine);
}
let points = util.generateTrianglesByLines(lines);
points = new Float32Array(points)

let colors = [];
let optionColors = [[0.0, 1.0, 1.0, 1.0], [0.0, 0.5, 0.5, 1.0]]
let count = 0
for (let i = 0; i < points.length; i += 24) {
    let r = Math.random();
    let g = Math.random();
    let b = Math.random();
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    count++;

}

colors = new Float32Array(colors);

let f32size = Float32Array.BYTES_PER_ELEMENT;

let pointsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 4, gl.FLOAT, false, f32size * 4, 0);


let colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

let a_color = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, f32size * 4, 0);



let u_world = gl.getUniformLocation(program, 'u_world');
let worldMat = util.createPerspective(near, far, left, right, top, bottom)
gl.uniformMatrix4fv(u_world, false, worldMat);

let u_camera = gl.getUniformLocation(program, 'u_camera');
let cameraPos = [0, top / 4, near + 100];
let cameraMat = util.lookAt(cameraPos, [0, 0, far / 2], [0, 1, 0]);
cameraMat = util.inverse(cameraMat);
gl.uniformMatrix4fv(u_camera, false, cameraMat);

gl.drawArrays(gl.TRIANGLES, 0, points.length / 4)