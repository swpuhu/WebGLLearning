import util from '../util.js';
import Program from './program.js';


const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2');


gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);


const points = new Float32Array([
    0, 0, 0, 0,
    width, 0, 0, 0,
    width, height, 0, 0,
    width, height, 0, 0,
    0, height, 0, 0,
    0, 0, 0, 0
]);

for (let i = 0; i < points.length; i += 4) {
    points[i + 2] = points[i] / width;
    points[i + 3] = points[i + 1] / height;
}

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

const projectionMat = util.createProjection(width, height, 1);
const program = new Program(gl, projectionMat);

function test() {
    let texture = util.createTexture(gl);
    const data = new Uint8Array(canvas.width * canvas.height * 2);
    for (let i = 0; i < data.length; i += 2) {
        data[i] = 255 * Math.random();
        data[i + 1] = 255 * Math.random();
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, canvas.width, canvas.height, 0, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, data);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

test();



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