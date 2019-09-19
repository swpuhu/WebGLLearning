import shaders from './LUT_shader.js';
import util from '../util.js';

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 540;
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
const program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);

const a_position = gl.getAttribLocation(program, 'a_position');
const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
const u_canvas_size = gl.getUniformLocation(program, 'u_canvas_size');
const u_rotate = gl.getUniformLocation(program, 'u_rotate');
const u_projection = gl.getUniformLocation(program, 'u_projection');
const uniforms = {
    u_canvas_size: new Float32Array([canvas.width, canvas.height]),
    u_rotate: util.createRotateMatrix({
        x: canvas.width / 2,
        y: canvas.height / 2
    }, 10),
    u_projection: util.createProjection(canvas.width, canvas.height, 1)
}

const points = new Float32Array([
    0, 0,
    canvas.width, 0,
    canvas.width, canvas.height,
    canvas.width, canvas.height,
    0, canvas.height,
    0, 0
]);


const texCoordPoints = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    1, 1,
    0, 1,
    0, 0
]);
const f32size = Float32Array.BYTES_PER_ELEMENT;

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 2, 0);
gl.enableVertexAttribArray(a_texCoord);

let texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoordPoints, gl.STATIC_DRAW);
gl.enableVertexAttribArray(a_texCoord);
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 2, 0);
gl.uniform2fv(u_canvas_size, uniforms.u_canvas_size);
gl.uniformMatrix4fv(u_rotate, false, uniforms.u_rotate);
gl.uniformMatrix4fv(u_projection, false, uniforms.u_projection);

let image = new Image();
image.src = '../assets/gaoda2.jpg';

let image2 = new Image();
image.src = '../assets/gaoda1.jpg';


let texture1 = util.createTexture(gl);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
let framebuffer1 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer1);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);


const u_resolution = gl.getUniformLocation(program, 'u_resolution');
const u_texture = gl.getUniformLocation(program, 'u_texture');
const u_lut = gl.getUniformLocation(program, 'u_lut');
gl.uniform1i(u_texture, 0);
gl.uniform1i(u_lut, 1);


let textures = [];
let colorFramebuffers = [];
let renderFramebuffers = [];
for (let i = 0; i < 2; ++i) {
    

    let colorRenderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, colorRenderbuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, canvas.width, canvas.height);
    let renderFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderFramebuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorRenderbuffer);

    let texture1 = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    let colorFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, colorFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    textures.push(texture1);
    colorFramebuffers.push(colorFramebuffer);
    renderFramebuffers.push(renderFramebuffer);
}




loadImages(['../assets/gaoda1.jpg', './LUT2.png'])
    .then(([img1, img2]) => {
        gl.uniform2f(u_resolution, img1.width, img1.height);
        gl.activeTexture(gl.TEXTURE0);
        let originTexture = util.createTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img1);

        gl.activeTexture(gl.TEXTURE1);
        let lutTexture = util.createTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img2);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, colorFramebuffers[0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderFramebuffers[0]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, renderFramebuffers[0]);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, colorFramebuffers[0]);
        gl.blitFramebuffer(
            0, 0, canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height,
            gl.COLOR_BUFFER_BIT, gl.NEAREST
        )
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);

        uniforms.u_rotate = util.createRotateMatrix({
            x: canvas.width / 2,
            y: canvas.height / 2
        }, 0);
        gl.uniformMatrix4fv(u_rotate, false, uniforms.u_rotate)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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