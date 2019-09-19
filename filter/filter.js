import util from '../util.js';
import ColorOffsetFilter from './colorOffset.js';
import NegativeFilter from './negativeFilter.js';
import SketchFilter from './sketchFilter.js';
import BeautifyFilter from './beautify.js';

const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2');


gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

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

const textures = [];
const frameBuffers = [];
for (let i = 0; i < 2; i++) {
    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let texture = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    textures.push(texture);
    frameBuffers.push(framebuffer);
}

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindTexture(gl.TEXTURE_2D, null);

const projectionMat = util.createProjection(width, height, 1);
const colorOffsetFilter = new ColorOffsetFilter(gl, projectionMat);
const negativeFilter = new NegativeFilter(gl, projectionMat);
const sketchFilter = new SketchFilter(gl, projectionMat);
const beautifyFilter = new BeautifyFilter(gl, projectionMat);

function test() {
    let img = new Image();
    img.src = '../assets/lena.jpg';
    img.onload = function () {
        gl.useProgram(colorOffsetFilter.program);
        let originTexture = util.createTexture(gl);
        colorOffsetFilter.setProjection(projectionMat);
        colorOffsetFilter.setResolution(img.width, img.height);
        colorOffsetFilter.setOffset(2, 2);
        
        // gl.useProgram(beautifyFilter.program);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
    }
}

test();