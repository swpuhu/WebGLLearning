import glUtil from '../../util.js';
import {vertexShader, fragmentShader} from './normalShader.js';
import {vertexShader as lightingVertex, fragmentShader as lightingFragment} from '../../shaders/profileLighting.js';
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
    let a_positionLocation;
    let program = util.initWebGL(gl, vertexShader, fragmentShader);
    let lightingProgram = util.initWebGL(gl, lightingVertex, lightingFragment);
    a_positionLocation = gl.getAttribLocation(program, 'a_position');
    console.log(a_positionLocation);
    a_positionLocation = 3;
    gl.bindAttribLocation(program, a_positionLocation, 'a_position');
    gl.linkProgram(program);
    gl.useProgram(program);

    let points = new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        0.5, 0.5,
        0.5, 0.5,
        -0.5, 0.5,
        -0.5, -0.5
    ]);

    let texCoordPoints = new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(a_positionLocation);
    gl.vertexAttribPointer(a_positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordBuffer, gl.STATIC_DRAW);

    const u_test = gl.getUniformLocation(program, 'u_test');
    console.log(u_test);
    gl.uniform1f(u_test, 0.5);
    a_positionLocation = gl.getAttribLocation(program, 'a_position');
    console.log(a_positionLocation);
    


    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0 ,6);
}


ctxDraw();
glDraw();