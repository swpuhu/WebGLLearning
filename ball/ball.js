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
    attribute vec4 a_normal;
    varying vec4 v_color;
    varying vec4 v_normal;
    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_rotateX;
    uniform mat4 u_rotateY;
    uniform mat4 u_translate;
    // uniform vec4 u_camera;
    void main () {
        gl_Position = u_world * u_camera * u_translate * u_rotateX * u_rotateY * a_position;
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
gl.enable(gl.CULL_FACE);
let uniformSetters = util.createUniformSetters(gl, program);
let attributeSetters = util.createAttributeSetters(gl, program);


let left = -320;
let right = 320;
let top = 180;
let bottom = -180;
let near = 100;
let far = 1000;


let line = [];
let r = left;
let a = 0;
for (a = 90; a <= 270; a += 11) {
    let cos = r * Math.cos(a * Math.PI / 180);
    let sin = r * Math.sin(a * Math.PI / 180);
    line.push(cos, sin, far / 2, 1);
}
if (a > 270) {
    a = 270;
    let cos = r * Math.cos(a * Math.PI / 180);
    let sin = r * Math.sin(a * Math.PI / 180);
    line.push(cos, sin, far / 2, 1);
}

let lines = [line];
let steps = 31;
for (let i = 1; i < steps; i++) {
    let rotateMatrix = util.createRotateMatrix({ x: 0, z: far / 2 }, (360 / (steps - 1)) * i, 'y');
    let newLine = [];
    for (let i = 0; i < line.length; i += 4) {
        let points = line.slice(i, i + 4);
        let newPoints = util.vecMultiMat(points, rotateMatrix);
        newLine.push(...newPoints);
    }
    lines.push(newLine);
}
let [points, normals] = util.generateTrianglesByLines(lines, true);
points = new Float32Array(points);
normals = new Float32Array(normals);
console.log(normals.length, points.length);

let colors = [];
let optionColors = [[0.0, 1.0, 1.0, 1.0], [0.0, 0.5, 0.5, 1.0]]
let count = 0
for (let i = 0; i < points.length; i += 24) {
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[(count + 1) % 2]);
    colors.push(...optionColors[(count + 1) % 2]);
    colors.push(...optionColors[(count + 1) % 2]);
    count++;
}

colors = new Float32Array(colors);

let f32size = Float32Array.BYTES_PER_ELEMENT;

let pointsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);


let colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

let normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

let cameraPos = [0, 0, 0];
let cameraMat = util.lookAt(cameraPos, [0, 0, far], [0, 1, 0]);
cameraMat = util.inverse(cameraMat);



let uniforms = {
    u_world: util.createPerspective(near, 2 * far, left, right, top, bottom),
    u_camera: cameraMat,
    u_rotateX: util.createRotateMatrix({ y: 0, z: far / 2 }, 0, 'x'),
    u_rotateY: util.createRotateMatrix({ x: 0, z: far / 2 }, 0, 'y'),
    u_translate: util.createTranslateMatrix(0, 0, 0)
}

let attribs = {
    a_position: {
        buffer: pointsBuffer,
        numComponents: 4
    },
    a_color: {
        buffer: colorBuffer,
        numComponents: 4
    },
    a_normal: {
        buffer: normalBuffer,
        numComponents: 4
    }
}

util.setAttributes(attributeSetters, attribs);
util.setUniforms(uniformSetters, uniforms);


gl.drawArrays(gl.TRIANGLES, 0, points.length / 4);

let rotateX = 0;
let rotateY = 0
let rotateXStep = 0.5;
let rotateYStep = 0.5;
function animate () {
    requestAnimationFrame(animate);
    rotateX += rotateXStep;
    rotateY += rotateYStep;
    uniforms.u_rotateX = util.createRotateMatrix({ y: 0, z: far / 2 }, rotateX, 'x');
    uniforms.u_rotateY = util.createRotateMatrix({ x: 0, z: far / 2 }, rotateY, 'y');
    util.setUniforms(uniformSetters, uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, points.length / 4);
}

animate();

let translateZ = 0;
canvas.onwheel = function (e) {
    translateZ += e.deltaY / 10;
    uniforms.u_translate = util.createTranslateMatrix(0, 0, translateZ);
}