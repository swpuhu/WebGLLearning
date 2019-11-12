import util from '../util.js';
import DoubleFilter from '../filter/2DFilter.js';
import BlendFilter from './Blend.js';
const shader = {
    vertexShader: `
        attribute vec4 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        uniform mat4 u_projection;
        void main () {
            gl_Position = u_projection * a_position;
            v_texCoord = a_texCoord;
        }
    `,
    fragmentShader: `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;
        void main () {
            gl_FragColor = texture2D(u_texture, v_texCoord);
        }
    `
}

const width = 640;
const height = 360;
const f32size = Float32Array.BYTES_PER_ELEMENT;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2', {
    preserveDrawingBuffer: true
});
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);






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


const projectionMat = util.createProjection(width, height, 1);
const doubleFilter = DoubleFilter(gl, projectionMat);
const blendFilter = BlendFilter(gl, projectionMat);
const program = util.initWebGL(gl, shader.vertexShader, shader.fragmentShader);
gl.useProgram(program);


gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
const a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);

const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
gl.enableVertexAttribArray(a_texCoord);
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

const u_projection = gl.getUniformLocation(program, 'u_projection');
gl.uniformMatrix4fv(u_projection, false, projectionMat);



let originTexture = util.createTexture(gl);

let image = new Image();
image.src = '../assets/gaoda1.jpg';

let framebuffers = [];
let textures = [];
for (let i = 0; i < 2; i++) {
    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let texture = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    framebuffers.push(framebuffer);
    textures.push(texture);
}



let overLayFramebuffers = [];
let overLayTextures = [];
for (let i = 0; i < 2; i++) {
    let overLayFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, overLayFramebuffer);
    let overLayTexture = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, overLayTexture, 0)
    overLayFramebuffers.push(overLayFramebuffer);
    overLayTextures.push(overLayTexture);
}


loadImages(['../assets/gaoda1.jpg', '../assets/gaoda2.jpg', '../assets/4ktest.jpeg', '../assets/jy-1970.png', '../assets/pianse.jpg']).then(images => {
    gl.useProgram(doubleFilter.program);
    let count = 0;
    let resultFramebuffers = [];
    let resultTextures = [];
    for (let i = 0; i < images.length; i++) {
        let framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        let texture = util.createTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
        resultFramebuffers.push(framebuffer);
        resultTextures.push(texture);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    for (let j = 0; j < images.length; j++) {
        gl.bindTexture(gl.TEXTURE_2D, originTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[j]);
        for (let i = 0; i < 5; i++) {
            if (!i) {
                // doubleFilter.setAlpha(0.5);
            } else {
                doubleFilter.setAlpha(1);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[count % 2]);
            doubleFilter.setRotate(5 * i * j, {
                x: width / 2,
                y: height / 2
            });
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
            ++count;
        }
        doubleFilter.setRotate(0, {
            x: width / 2,
            y: height / 2
        })
        gl.bindFramebuffer(gl.FRAMEBUFFER, resultFramebuffers[j]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.useProgram(blendFilter.program);
    let targetTexture = resultTextures[0];
    for (let i = 1; i < resultTextures.length; i++) {
        let srcTexture = resultTextures[i];
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, srcTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, overLayFramebuffers[i % 2]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        targetTexture = overLayTextures[i % 2];
    }
    gl.useProgram(doubleFilter.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

})


image.onload = function () {}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = function () {
            resolve(image);
        }
        image.src = src;
    })
}

function loadImages(images) {
    let imagePromises = [];
    for (let img of images) {
        imagePromises.push(loadImage(img));
    }
    return Promise.all(imagePromises);
}