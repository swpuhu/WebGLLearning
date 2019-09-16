import util from '../util.js';
import shaders from './imageProcess_shader.js';
import panel from './effectModule.js';

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;
document.body.appendChild(canvas);
// document.body.appendChild(panel);

const gl = canvas.getContext('webgl2');
const program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);
let points = util.createClipPath(canvas, 0.2, 0.2, 0.1, 0.5);

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
const u_type = gl.getUniformLocation(program, 'u_type')
const uniforms = {
    u_projection: util.createProjection(canvas.width, canvas.height, 1),
    u_flipY: 1.0,
    u_resolution: null,
    u_type: 1
}

gl.uniformMatrix4fv(u_projection, false, uniforms.u_projection);
gl.uniform1f(u_flipY, 1.0);
gl.uniform1i(u_type, uniforms.u_type);

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
image.src = '../../assets/gaoda1.jpg';

image.onload = function () {
    const originTexture = util.createTexture(gl);
    uniforms.u_resolution = new Float32Array([image.width, image.height]);
    gl.uniform2fv(u_resolution, uniforms.u_resolution);
    gl.bindTexture(gl.TEXTURE_2D, originTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    uniforms.u_flipY = 0;
    uniforms.u_type = 2;
    gl.uniform1i(u_type, uniforms.u_type);
    gl.uniform1f(u_flipY, uniforms.u_flipY);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[0]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);

    points = util.createClipPath(canvas);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, fsize * 4, 0);
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2);
    gl.enableVertexAttribArray(a_texCoord);


    // uniforms.u_type = 0;
    // gl.uniform1i(u_type, uniforms.u_type);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[1]);
    uniforms.u_type = 1;
    gl.uniform1i(u_type, uniforms.u_type);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);

    uniforms.u_type = 0;
    gl.uniform1i(u_type, uniforms.u_type);


    uniforms.u_flipY = 1;
    gl.uniform1f(u_flipY, uniforms.u_flipY);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, 6);


}


