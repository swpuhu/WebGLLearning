import util from '../util.js';
import ColorOffsetFilter from './colorOffset.js';
import NegativeFilter from './negativeFilter.js';
import SketchFilter from './sketchFilter.js';
import BeautifyFilter from './beautify.js';
import WuhuaFilter from './wuhua.js';
import DoubleFilter from './2DFilter.js';
import CircleFilter from './circleBorder.js';
import MaskFilter from './maskFilter.js';
import BinaryFilter from './binaryFilter.js';

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
const wuhuaFilter = new WuhuaFilter(gl, projectionMat);
const doubleFilter = new DoubleFilter(gl, projectionMat);
const circleFilter = new CircleFilter(gl, projectionMat);
const maskFilter = new MaskFilter(gl, projectionMat);
const binaryFilter = new BinaryFilter(gl, projectionMat);


function test() {
    let img = new Image();
    let templateImg = new Image();
    templateImg.src = '../assets/template.png';
    img.src = '../assets/4ktest.jpeg';
    
        
    loadImages(['../assets/template.png', '../assets/gaoda2.jpg'])
    .then(([mask, img]) => {    

        gl.useProgram(binaryFilter.program);
        let originTexture = util.createTexture(gl);
        let maskTexture = util.createTexture(gl);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, originTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, maskTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask)
        gl.activeTexture(gl.TEXTURE0);

        let renderFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderFramebuffer);
        let renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 8, gl.RGBA8, canvas.width, canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, renderFramebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffers[0]);
        gl.blitFramebuffer(
            0, 0, canvas.width, canvas.height, 
            0, 0, canvas.width, canvas.height, 
            gl.COLOR_BUFFER_BIT, gl.LINEAR
        );
        
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.useProgram(doubleFilter.program);
        doubleFilter.setRotate(0, {x: canvas.width / 2, y: canvas.height / 2});
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    })
    
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