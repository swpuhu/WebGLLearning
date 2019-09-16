import util from '../util.js';
import shaders from './imageProcess_shader.js';
import panel from './effectModule.js';
import enum_effectType from './enum_effectType.js';

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;
document.body.appendChild(canvas);
// document.body.appendChild(panel);

const gl = canvas.getContext('webgl2', {
    // premultipliedAlpha: false
});
// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
// gl.clearColor(0.0, 0.0, 0.0, 1.0);
const program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);
let points = util.createClipPath(canvas);
// let points = util.createTriangleClipPath(canvas, 0.5)
// for (let i = 0; i < points.length; i += 4) {
//     [points[i], points[i + 1]] = util.rotate({x: canvas.width / 2, y: canvas.height / 2}, points[i], points[i + 1], 30);
// }

let fsize = Float32Array.BYTES_PER_ELEMENT;

let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let a_position = gl.getAttribLocation(program, 'a_position');
let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');

gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, fsize * 4, 0);
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2);
gl.enableVertexAttribArray(a_texCoord);

const u_projection = gl.getUniformLocation(program, 'u_projection');
const u_flipY = gl.getUniformLocation(program, 'u_flipY');
const u_resolution = gl.getUniformLocation(program, 'u_resolution');
const u_type = gl.getUniformLocation(program, 'u_type');
const u_gaussian_radius = gl.getUniformLocation(program, 'u_gaussian_radius');
const u_translate = gl.getUniformLocation(program, 'u_translate');
const u_scale = gl.getUniformLocation(program, 'u_scale');
const u_rotate = gl.getUniformLocation(program, 'u_rotate');

const uniforms = {
    u_projection: util.createProjection(canvas.width, canvas.height, 1),
    u_flipY: 1.0,
    u_resolution: null,
    u_type: 0,
    u_gaussian_radius: 1,
    u_translate: util.createTranslateMatrix(0, 0),
    u_scale: util.createScaleMatrix(1, 1, {
        x: canvas.width / 2,
        y: canvas.height / 2
    }),
    u_rotate: util.createRotateMatrix({
        x: canvas.width / 2,
        y: canvas.height / 2
    }, 0)
}

gl.uniformMatrix4fv(u_projection, false, uniforms.u_projection);
gl.uniform1i(u_flipY, 1);
gl.uniform1i(u_type, uniforms.u_type);
gl.uniform1f(u_gaussian_radius, uniforms.u_gaussian_radius);
gl.uniformMatrix4fv(u_translate, false, uniforms.u_translate);
gl.uniformMatrix4fv(u_scale, false, uniforms.u_scale);
gl.uniformMatrix4fv(u_rotate, false, uniforms.u_rotate);


let textures = [];
let frameBuffers = [];
for (let i = 0; i < 2; i++) {
    let texture = util.createTexture(gl);
    let frameBuffer = gl.createFramebuffer();
    textures.push(texture);
    frameBuffers.push(frameBuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
}
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindTexture(gl.TEXTURE_2D, null);

let image = new Image();
image.src = '../assets/test2.png';

const effectList = [
    // enum_effectType.negative,
    enum_effectType.colorOffset,
    // enum_effectType.monochroma,
    // enum_effectType.transform2d,

    // enum_effectType.gaussian,
];
let currentIndex = 0;
let count = 0;
image.onload = function () {
    const originTexture = util.createTexture(gl);
    uniforms.u_resolution = new Float32Array([image.width, image.height]);
    // gl.uniform2fv(u_resolution, uniforms.u_resolution);
    // gl.bindTexture(gl.TEXTURE_2D, originTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    uniforms.u_flipY = 0;
    gl.uniform1i(u_flipY, uniforms.u_flipY);
    count = 0;

    for (let i = 0; i < effectList.length; i++) {
        let effectType = effectList[i];
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[count % 2]);
        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0])
        drawWithFilter(effectType);
        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
        if (i === 0) {
            points = util.createClipPath(canvas);
            gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
        }
        currentIndex = (count + 1) % 2;
        ++count;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    uniforms.u_flipY = 1;
    gl.uniform1i(u_flipY, uniforms.u_flipY);
    drawWithFilter();
}

function drawWithFilter(effectType) {
    switch (effectType) {
        case enum_effectType.negative:
            uniforms.u_type = enum_effectType.negative;
            gl.uniform1i(u_type, uniforms.u_type);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            uniforms.u_type = enum_effectType.normal;
            gl.uniform1i(u_type, uniforms.u_type);
            break;
        case enum_effectType.monochroma:
            uniforms.u_type = enum_effectType.monochroma;
            gl.uniform1i(u_type, uniforms.u_type);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            uniforms.u_type = enum_effectType.normal;
            gl.uniform1i(u_type, uniforms.u_type);
            break;
        case enum_effectType.colorOffset:
            uniforms.u_type = enum_effectType.colorOffset;
            gl.uniform1i(u_type, uniforms.u_type);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            uniforms.u_type = enum_effectType.normal;
            gl.uniform1i(u_type, uniforms.u_type);
            break;
        case enum_effectType.gaussian:
            uniforms.u_type = enum_effectType.gaussian;
            gl.uniform1i(u_type, uniforms.u_type);
            let gaussianRadius = 1;
            for (let i = 0; i < 10; i++) {
                uniforms.u_gaussian_radius = gaussianRadius++;
                gl.uniform1f(u_gaussian_radius, uniforms.u_gaussian_radius);
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[count % 2]);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
                ++count;
            }
            uniforms.u_type = enum_effectType.normal;
            gl.uniform1i(u_type, uniforms.u_type);
            break;
        case enum_effectType.transform2d:
            uniforms.u_type = enum_effectType.transform2d;
            gl.uniform1i(u_type, uniforms.u_type);
            uniforms.u_rotate = util.createRotateMatrix({
                x: canvas.width / 2,
                y: canvas.height / 2
            }, 30);
            gl.uniformMatrix4fv(u_rotate, false, uniforms.u_rotate);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            uniforms.u_type = enum_effectType.normal;
            uniforms.u_rotate = util.createRotateMatrix({x: canvas.width / 2, y: canvas.height / 2}, 0);
            gl.uniformMatrix4fv(u_rotate, false, uniforms.u_rotate);
            gl.uniform1i(u_type, uniforms.u_type);
            break;
        default:
            uniforms.u_type = enum_effectType.normal;
            gl.uniform1i(u_type, uniforms.u_type);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            break;
    }
}