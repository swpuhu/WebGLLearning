import glUtil from '../../util.js';
import {vertexShader, fragmentShader} from './normalShader.js';
import util from '../../util.js';
const width = 640;
const height = 360;
let canvas2d = document.createElement('canvas');
canvas2d.classList.add('canvas2d');
let canvasgl = document.createElement('canvas');
canvasgl.classList.add('webgl');
canvas2d.width = width;
canvas2d.height = height;
canvasgl.width = width;
canvasgl.height = height;

let ctx = canvas2d.getContext('2d');
let gl = canvasgl.getContext('webgl');

document.body.appendChild(canvas2d);
document.body.appendChild(canvasgl);

const rectWidth = width / 2;
const rectHeight = height / 2;

function ctxDraw() {
    ctx.fillStyle = '#f60';
    ctx.fillRect((width - rectWidth) / 2, (height - rectHeight) / 2, rectWidth, rectHeight);
}

function glDraw() {
    let program = util.initWebGL(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    let points = new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        0.5, 0.5,
        0.5, 0.5,
        -0.5, 0.5,
        -0.5, -0.5
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


ctxDraw();
glDraw();