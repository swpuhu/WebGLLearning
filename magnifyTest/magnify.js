import util from '../util.js';


let width = 640;
let height = 360;
let canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
const vertexShader = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform mat4 u_projection;
    uniform mat4 u_scale;
    void main () {
        gl_Position = u_projection * u_scale * a_position;
        v_texCoord = a_texCoord;
    }
`

const fragmentShader = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main () {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`
let scale = 10;
let points = new Float32Array([
    0, 0,
    width / scale, 0,
    width / scale, height / scale,
    width / scale, height / scale,
    0, height /scale,
    0, 0
]);

let texCoord = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    1, 1,
    0, 1,
    0, 0
])

const f32size = Float32Array.BYTES_PER_ELEMENT;
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoord, gl.STATIC_DRAW);


let program = util.initWebGL(gl, vertexShader, fragmentShader);
gl.useProgram(program);

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
let a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 2 * f32size, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
gl.enableVertexAttribArray(a_texCoord);
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 2 * f32size, 0);

let u_projection = gl.getUniformLocation(program, 'u_projection');
let projectionMat = util.createProjection(width, height, 1);
gl.uniformMatrix4fv(u_projection, false, projectionMat);

let u_scale = gl.getUniformLocation(program, 'u_scale');
let scaleMat = util.createScaleMatrix(1, 1, 1, {x: 0, y: 0, z: 0});
gl.uniformMatrix4fv(u_scale, false, scaleMat);

let texture = util.createTexture(gl);
let image = new Image();
image.src = '../assets/4ktest.jpeg';



image.onload = function () {
    
    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    
    let texture1 = util.createTexture(gl);
    gl.viewport(0, 0, width * scale, height * scale);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width * scale, height * scale, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);


    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    // let points2 = new Float32Array([
    //     0, 0,
    //     width, 0,
    //     width, height,
    //     width, height,
    //     0, height,
    //     0, 0
    // ]);
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, points2, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    
    let points = new Float32Array([
        0, 0,
        width, 0,
        width, height,
        width, height,
        0, height,
        0, 0
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    gl.viewport(0, 0, width, height);
    let scaleMat = util.createScaleMatrix(scale, scale, 1, {x: 0, y: 0, z: 0});
    gl.uniformMatrix4fv(u_scale, false, scaleMat);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

