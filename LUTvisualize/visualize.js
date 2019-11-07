import shaders from './shader.js';
import util from '../util.js';


const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
let nums = 64;
let points = [];
let zNear = 200;
let zStep = 150;
let zFar = zNear + nums * zStep;
gl.enable(gl.DEPTH_TEST);
// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

for (let i = 0; i < nums; i++) {
    points.push(
        0.0, 0.0, zNear + i * zStep,
        width, 0.0, zNear + i * zStep,
        width, height, zNear + i * zStep,
        width, height, zNear + i * zStep,
        0.0, height, zNear + i * zStep,
        0.0, 0.0,  zNear + i * zStep
    );
}
points = new Float32Array(points);
let texCoords = [];
for (let i = 0; i < nums; i++) {
    let row = Math.floor(i / 8);
    let col = nums % 8;
    let midRow = (row / 8 + 1 / 8) / 2;
    texCoords.push(
        col / 8 + 0.0 / 8 - 0.5 / 512, 2 * 2 * midRow - (row / 8 + 0.0 / 8),
        col / 8 + 1.0 / 8 - 0.5 / 512, 2 * 2 * midRow - (row / 8 + 0.0 / 8),
        col / 8 + 1.0 / 8 - 0.5 / 512, 2 * 2 * midRow - (row / 8 + 1.0 / 8),
        col / 8 + 1.0 / 8 - 0.5 / 512, 2 * 2 * midRow - (row / 8 + 1.0 / 8),
        col / 8 + 0.0 / 8 - 0.5 / 512, 2 * 2 * midRow - (row / 8 + 1.0 / 8),
        col / 8 + 0.0 / 8 - 0.5 / 512, 2 * 2 * midRow - (row / 8 + 0.0 / 8)
    );
}

texCoords = new Float32Array(texCoords);
console.log(texCoords);

const program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);
let f32size = Float32Array.BYTES_PER_ELEMENT;

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

const a_position = gl.getAttribLocation(program, 'a_position');
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, f32size * 3, 0);
gl.enableVertexAttribArray(a_position);


let texCoordsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 2, 0);
gl.enableVertexAttribArray(a_texCoord);

const u_perspective = gl.getUniformLocation(program, 'u_perspective');
const perspectiveMat = util.createPerspective(90, 5000, -width / 2, width / 2, height / 2, -height / 2);
gl.uniformMatrix4fv(u_perspective, false, perspectiveMat);

const u_camera = gl.getUniformLocation(program, 'u_camera');
const cameraMat = util.lookAt([1000, 300, 5100], [0.0, 0.0, 5000], [0.0, 1.0, 0.0]);
// const cameraMat = util.lookAt([0.0, 200, 0.0], [0.0, 0.0, width * 2], [0.0, 1.0, 0.0]);
gl.uniformMatrix4fv(u_camera, false, cameraMat);

let texture = util.createTexture(gl);

let image = new Image();
image.onload = function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, nums * 6);
}
image.src = '../assets/gaodaLUT.png';