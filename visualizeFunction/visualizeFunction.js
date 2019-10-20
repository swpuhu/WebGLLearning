import util from '../util.js';
const shaders = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec4 a_color;
    out vec4 v_color;
    uniform mat4 u_perspective, u_camera, u_rotateX, u_rotateY, u_rotateZ, u_translate;
    void main () {
        gl_Position = (u_perspective * inverse(u_camera)) * ( u_translate * u_rotateX * u_rotateY * u_rotateZ * a_position);
        v_color = a_color;
    }
    `,
    fragmentShader: `#version 300 es
    precision highp float;
    in vec4 v_color;
    out vec4 out_color;
    void main () {
        out_color = v_color;
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
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);
const zPlate = 1000;

let points = new Float32Array([
    0.0, 0.0, zPlate,
    width, 0, zPlate,
    width, height, zPlate
]);

let colors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0
]);

let f32size = Float32Array.BYTES_PER_ELEMENT;
let pointbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointbuffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
let a_position = gl.getAttribLocation(program, 'a_position');
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, f32size * 3, 0);
gl.enableVertexAttribArray(a_position);

let colorbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
let a_color = gl.getAttribLocation(program, 'a_color');
gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, f32size * 4, 0);
gl.enableVertexAttribArray(a_color);

let u_perspective = gl.getUniformLocation(program, 'u_perspective');
let perspectiveMat = util.createPerspective(40, 3000, -width / 2, width / 2, height / 2, -height / 2);
gl.uniformMatrix4fv(u_perspective, false, perspectiveMat);



let cameraPos = [0, 0, 0];
let targetPos = [0.0, 0.0, zPlate];
let u_camera = gl.getUniformLocation(program, 'u_camera');
let cameraMat = util.lookAt(cameraPos, targetPos, [0.0, 1.0, 0.0]);
gl.uniformMatrix4fv(u_camera, false, cameraMat);


let currentXAngle = 0;
let currentYAngle = 0;
let currentZAngle = 0;
let u_rotateX = gl.getUniformLocation(program, 'u_rotateX');
let u_rotateY = gl.getUniformLocation(program, 'u_rotateY');
let u_rotateZ = gl.getUniformLocation(program, 'u_rotateZ');
let rotateXMat = util.createRotateMatrix({ x: 0, y: 0, z: zPlate }, currentXAngle, 'x');
let rotateYMat = util.createRotateMatrix({ x: 0, y: 0, z: zPlate }, currentYAngle, 'y');
let rotateZMat = util.createRotateMatrix({ x: 0, y: 0, z: zPlate }, currentZAngle, 'z');
gl.uniformMatrix4fv(u_rotateX, false, rotateXMat);
gl.uniformMatrix4fv(u_rotateY, false, rotateYMat);
gl.uniformMatrix4fv(u_rotateZ, false, rotateZMat);

let currentTranslateZ= 0;
let u_translate = gl.getUniformLocation(program, 'u_translate');
let translateMat = util.createTranslateMatrix(0, 0, currentZAngle);
gl.uniformMatrix4fv(u_translate, false, translateMat);


gl.drawArrays(gl.TRIANGLES, 0, 3);


function drawCoord() {
    let linePoints = new Float32Array([
        -width * 100, 0, zPlate, 1.0, 1.0, 1.0, 1.0,
        width * 100, 0, zPlate, 1.0, 1.0, 1.0, 1.0,
        0, -height * 100, zPlate, 1.0, 1.0, 1.0, 1.0,
        0, height * 100, zPlate, 1.0, 1.0, 1.0, 1.0,
        0, 0, -2000 * 100, 1.0, 1.0, 1.0, 1.0,
        0, 0, 2000 * 10, 1.0, 1.0, 1.0, 1.0,
    ]);
    let lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, linePoints, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, f32size * 7, 0);

    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, f32size * 7, f32size * 3);
    gl.drawArrays(gl.LINES, 0, 6);
    gl.deleteBuffer(lineBuffer);
}

function draw() {   
    gl.bindBuffer(gl.ARRAY_BUFFER, pointbuffer);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, f32size * 3, 0);
    gl.enableVertexAttribArray(a_position);


    gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, f32size * 4, 0);
    gl.enableVertexAttribArray(a_color);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    drawCoord();
}

draw();

document.oncontextmenu = function (e) {
    e.preventDefault();
}
canvas.onmousedown = function (e) {
    // let startX = e.clientX;
    // let startY = e.clientY;
    document.onmousemove = function (ev) {
        // let dX = ev.clientX - startX;
        // let dY = ev.clientY - startY;
        currentYAngle += ev.movementX * 0.1;
        currentXAngle -= ev.movementY * 0.1;

        rotateXMat = util.createRotateMatrix({ x: 0, y: 0, z: zPlate }, currentXAngle, 'x');
        rotateYMat = util.createRotateMatrix({ x: 0, y: 0, z: zPlate }, currentYAngle, 'y');
        gl.uniformMatrix4fv(u_rotateX, false, rotateXMat);
        gl.uniformMatrix4fv(u_rotateY, false, rotateYMat);
        draw();

    }

    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}


canvas.onwheel = function (e) {
    let dY = e.deltaY;
    currentTranslateZ += dY * 0.5;
    translateMat = util.createTranslateMatrix(0, 0, currentTranslateZ);
    gl.uniformMatrix4fv(u_translate, false, translateMat);
    draw();
}