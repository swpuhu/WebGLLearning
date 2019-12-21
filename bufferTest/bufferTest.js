
import util from '../util.js';
const vertexShader = `
    attribute vec4 a_position;
    uniform mat4 u_projection;
    uniform mat4 u_translate;
    void main () {
        gl_Position = u_projection * u_translate * a_position;
    }
`

const fragmentShader = `
    precision mediump float;
    void main () {
        vec2 resolution = vec2(640.0, 360.0);
        vec2 pos = gl_FragCoord.xy / resolution;
        // float dist = smoothstep(0.0, 1.0, pos.y);
        // gl_FragColor = vec4(vec3(0.0, 1.0, 1.0) * dist, 1.0);
        if (pos.y > 0.7) {
            gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        } else {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }

    }
`
let width = 640;
let height = 360;
let canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.backgroundColor = '#27574B';
document.body.appendChild(canvas);
let gl = canvas.getContext('webgl2');
let program = util.initWebGL(gl, vertexShader, fragmentShader);
gl.useProgram(program);

let points = new Float32Array([
    0.0, 0.0,
    width, 0.0,
    width, height,
    width, height,
    0.0, height,
    0.0, 0.0
]);
let baseLine = [];
let randomLine = [];
for (let i = 0; i < width * 2000; i += 1) {
    baseLine.push(i, 0);
    randomLine.push(i, Math.random() * height);
}



points = util.generateTriangles(baseLine, randomLine);
let pointsNums = points.length / 2;
console.log(pointsNums);


const f32size = Float32Array.BYTES_PER_ELEMENT;

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
points = null;
baseLine = null;
randomLine = null;

let a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 2, 0);
let u_projection = gl.getUniformLocation(program, 'u_projection');
let projectionMat = util.createProjection(width, height, 1);
gl.uniformMatrix4fv(u_projection, false, projectionMat);

let u_translate = gl.getUniformLocation(program, 'u_translate');
let translateMat = util.createTranslateMatrix(0, 0, 0);
gl.uniformMatrix4fv(u_translate, false, translateMat);



let currentOffsetX = 0;
function setTranslate(x, y) {
    let translateMat = util.createTranslateMatrix(x, y, 0);
    gl.uniformMatrix4fv(u_translate, false, translateMat);
}

canvas.onmousedown = function (e) {
    document.onmousemove = function (ev) {
        currentOffsetX = currentOffsetX + ev.movementX;
        setTranslate(currentOffsetX, 0);
        draw();
    }
    document.onmouseup = function () {
        document.onmouseup = null;
        document.onmousemove = null;
    }

}



function draw() {
    gl.drawArrays(gl.TRIANGLES, 0, pointsNums);
}
draw();

