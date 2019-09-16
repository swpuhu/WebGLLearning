import util from '../util.js';
import shaders from './multiTexture_shader.js';

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
let projectionMatrix = util.createProjection(canvas.width, canvas.height, 1);
let rotateMatrix = util.createRotateMatrix({ x: canvas.width / 2, y: canvas.height / 2 }, 10);
let u_imageLocation1 = gl.getUniformLocation(program, 'u_texture');
let u_imageLocation2 = gl.getUniformLocation(program, 'u_texture2');

gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
gl.uniformMatrix4fv(u_rotate, false, rotateMatrix);
// gl.uniform2fv(u_aspect, aspect);
gl.uniform1i(u_imageLocation1, 0);
gl.uniform1i(u_imageLocation2, 1);


loadImages(['../../assets/gaoda1.jpg', '../../assets/gaoda2.jpg'])
    .then(([image1, image2]) => {
        let texture1 = util.createTexture(gl);
        let texture2 = util.createTexture(gl);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    })

function loadImages(srcs) {
    let promises = [];
    for (let src of srcs) {
        let image = new Image();
        let p = new Promise((resolve, reject) => {
            image.onload = function () {
                resolve(image);
            }
            image.src = src;
        });
        promises.push(p);
    }
    return Promise.all(promises)
}

