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
    attribute vec3 a_normals;
    varying vec4 v_normals;
    varying vec4 v_color;
    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_rotateX;
    uniform mat4 u_rotateY;
    uniform mat4 u_translate;
    void main () {
        gl_Position = u_world * u_camera * u_translate * u_rotateY * u_rotateX * a_position;
        v_color = a_color;
        v_normals = u_translate * u_rotateY * u_rotateX * vec4(a_normals, 1.0);
    }
`

const fragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    varying vec4 v_normals;
    uniform vec3 u_lightDirection;
    void main () {
        vec3 normal = normalize(v_normals.xyz);
        float light = dot(normal, u_lightDirection);
        gl_FragColor = v_color;
        gl_FragColor.rgb *= light;
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
let centerX = 0;
let centerY = 0;
let centerZ = far / 2;

let r = 200;
let line = [
    centerX, centerY - r / 2, centerZ, 1,
    r + centerX, centerY - r / 2, centerZ, 1,
    r + centerX, r / 2 + centerY, centerZ, 1,
    centerX, r / 2 + centerY, centerZ, 1,
];

let lines = [line];
for (let i = 1; i < 5; i++) {
    let rotateMatrix = util.createRotateMatrix({ x: centerX, z: centerZ }, 90 * i, 'y');
    let newLine = [];
    for (let i = 0; i < line.length; i += 4) {
        let points = line.slice(i, i + 4);
        let newPoints = util.MatMultiVec(points, rotateMatrix);
        newLine.push(...newPoints);
    }
    lines.push(newLine);
}
let [points, normals] = util.generateTrianglesByLines(lines, true);


let colors = [];
let optionColors = [[0.0, 1.0, 1.0, 1.0], [0.0, 0.8, 0.8, 1.0]]
let count = 0
for (let i = 0; i < points.length; i += 24) {
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[count % 2]);
    colors.push(...optionColors[(count + 0) % 2]);
    colors.push(...optionColors[(count + 0) % 2]);
    colors.push(...optionColors[(count + 0) % 2]);
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
console.log(normals);

let cameraPos = [0, 0, 0];
let cameraMat = util.lookAt(cameraPos, [0, 0, far], [0, 1, 0]);
cameraMat = util.inverse(cameraMat);



let uniforms = {
    u_world: util.createPerspective(near, 2 * far, left, right, top, bottom),
    u_camera: cameraMat,
    u_rotateX: util.createRotateMatrix({ y: centerY, z: centerZ}, 0, 'x'),
    u_rotateY: util.createRotateMatrix({ x: centerX, z: centerZ}, 0, 'y'),
    u_translate: util.createTranslateMatrix(0, 0, 0),
    u_lightDirection: new Float32Array([0.0, 0.0, 1.2])
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
    a_normals: {
        buffer: normalBuffer,
        numComponents: 3
    }
}

util.setAttributes(attributeSetters, attribs);
util.setUniforms(uniformSetters, uniforms);


gl.drawArrays(gl.TRIANGLES, 0, points.length / 4);

let rotateX = 0;
let rotateY = 0;
let rotateXStep = 0.5;
let rotateYStep = 0.5;
function animate () {
    requestAnimationFrame(animate);
    rotateX += rotateXStep;
    rotateY += rotateYStep;
    uniforms.u_rotateX = util.createRotateMatrix({ y: centerY, z: centerZ}, rotateX, 'x');
    uniforms.u_rotateY = util.createRotateMatrix({ x: centerX, z: centerZ }, rotateY, 'y');
    util.setUniforms(uniformSetters, uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, points.length / 4);
}

animate();

let translateZ = 0;
canvas.onwheel = function (e) {
    translateZ += e.deltaY / 10;
    uniforms.u_translate = util.createTranslateMatrix(0, 0, translateZ);
    // util.setUniforms(uniformSetters, uniforms);
    // gl.drawArrays(gl.TRIANGLES, 0, points.length / 4);
}