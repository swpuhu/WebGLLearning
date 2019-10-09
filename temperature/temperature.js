import util from '../util.js';

const shaders = {
    vertexShader: `#version 300 es

    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;
    out vec4 out_color;
    uniform sampler2D u_texture;
    uniform float u_temp;
    void main () {
        vec4 color = texture(u_texture, v_texCoord);
        out_color = vec4(color.r + u_temp, color.g, color.b - u_temp, color.a);
        
    }
    `
}

const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2');
const program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);


const points = new Float32Array([
    0, 0, 0, 0,
    width, 0, 1, 0,
    width, height, 1, 1,
    width, height, 1, 1,
    0, height, 0, 1,
    0, 0, 0, 0,
]);
const f32size = Float32Array.BYTES_PER_ELEMENT;


let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let texture = util.createTexture(gl);

let a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);


let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
gl.enableVertexAttribArray(a_texCoord);
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

let u_projection = gl.getUniformLocation(program, 'u_projection');
let projectionMat = util.createProjection(width, height, 1);
gl.uniformMatrix4fv(u_projection, false, projectionMat);

let u_temp = gl.getUniformLocation(program, 'u_temp');
gl.uniform1f(u_temp, 0 / 255);


let img = new Image();
img.src = '../assets/4ktest.jpeg';

img.onload = function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


let temperature = util.createEditor('Temperature', 'range', -100, 100, 0, 1);
document.body.appendChild(temperature.ref);

temperature.oninput = function (e) {
    gl.uniform1f(u_temp, this.value / 255);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

