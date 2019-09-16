import util from '../util.js';
import shaders from './shader_es200.js';

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2', {
    preserveDrawingBuffer: true
});
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
let program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);

let points = new Float32Array([
    0, 0,
    canvas.width, 0,
    canvas.width, canvas.height,
    canvas.width, canvas.height,
    0, canvas.height,
    0, 0
]);

let texCoordPoints = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    1, 1,
    0, 1,
    0, 0
]);
let fsize = points.BYTES_PER_ELEMENT;

let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let texPointsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texPointsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoordPoints, gl.STATIC_DRAW);

let a_position = gl.getAttribLocation(program, 'a_position');
let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, fsize * 2, 0);
gl.enableVertexAttribArray(a_position);
gl.bindBuffer(gl.ARRAY_BUFFER, texPointsBuffer);
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, fsize * 2, 0);
gl.enableVertexAttribArray(a_texCoord);

let u_projection = gl.getUniformLocation(program, 'u_projection');
let u_rotate = gl.getUniformLocation(program, 'u_rotate');
let u_aspect = gl.getUniformLocation(program, 'u_aspect');
let projectionMatrix = util.createProjection(canvas.width, canvas.height, 1);
let rotateMatrix = util.createRotateMatrix({x: canvas.width / 2, y: canvas.height / 2}, 10);
let aspect = new Float32Array([canvas.width, canvas.height]);

gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
gl.uniformMatrix4fv(u_rotate, false, rotateMatrix);
gl.uniform2fv(u_aspect, aspect);




let image = new Image();
image.src = '../../assets/gaoda1.jpg';
image.onload = function () {
    let texture = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    let textures = [];
    let framebuffers = [];

    for (let i = 0; i < 2; ++i) {
        let texture = util.createTexture(gl);
        textures.push(texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        let fbo = gl.createFramebuffer();
        framebuffers.push(fbo);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    let count = 0;
    for (let i = 0; i < 6; i++) {
        // gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[count % 2]);
        setFrameBuffer(framebuffers[count % 2], canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
        ++count;
    }

    setFrameBuffer(null, canvas.width, canvas.height);  
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


function setFrameBuffer(fbo, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    // gl.viewport(0, 0, width, height);
}