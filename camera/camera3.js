import util from '../util.js';
const shader = {
    vertexShader: `#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec4 a_normal;
out vec4 v_color;
out vec4 v_normal;

uniform vec3 u_size;
uniform mat4 u_rotateX;
uniform mat4 u_rotateY;
uniform mat4 u_rotateZ;
uniform mat4 u_translate;
uniform mat4 u_perspective;
uniform mat4 u_camera;
void main () {
    vec4 mid_position = u_perspective * inverse(u_camera) * u_translate * u_rotateX * u_rotateY * u_rotateZ * a_position;
    gl_Position = mid_position;
    v_color = a_color;
    v_normal = u_translate * u_rotateX * u_rotateY * u_rotateZ * a_normal;
}
`,
    fragmentShader: `#version 300 es
precision mediump float;
in vec4 v_color;
in vec4 v_normal;
out vec4 out_color;
void main () {
    vec4 normal = normalize(v_normal);
    vec4 direction = (vec4(0.5, 0.8, 1.0, 1.0));
    float light = dot(normal, direction);
    out_color = v_color;
    out_color.rgb *= light;
}

`
}
const width = 640;
const height = 360;
const near = 200;
const far = 1000;
const canvas = document.createElement('canvas');
canvas.style.border = `1px solid #ccc`;
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);


let cameraX = util.createEditor('cameraX', 'range', -canvas.width, canvas.width, 0, 1);
let cameraY = util.createEditor('cameraY', 'range', -canvas.width, canvas.width, 0, 1);
let cameraZ = util.createEditor('cameraZ', 'range', -1000, 0, 0, 1);

document.body.appendChild(cameraX.ref);
document.body.appendChild(cameraY.ref);
document.body.appendChild(cameraZ.ref);




const gl = canvas.getContext('webgl2');
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);

let l, h, d;
l = 600;
h = 300;
d = 300;


const points = new Float32Array([
    -l / 2, -h / 2, near, 1.0, 1.0, 0.0,
    l / 2, -h / 2, near, 1.0, 1.0, 0.0,
    l / 2, h / 2, near, 1.0, 1.0, 0.0,
    l / 2, h / 2, near, 1.0, 1.0, 0.0,
    -l / 2, h / 2, near, 1.0, 1.0, 0.0,
    -l / 2, -h / 2, near, 1.0, 1.0, 0.0,


    -l / 2, -h / 2, near + d, 1.0, 0.2, 0.0,
    l / 2, h / 2, near + d, 1.0, 0.2, 0.0,
    l / 2, -h / 2, near + d, 1.0, 0.2, 0.0,
    -l / 2, h / 2, near + d, 1.0, 0.2, 0.0,
    l / 2, h / 2, near + d, 1.0, 0.2, 0.0,
    -l / 2, -h / 2, near + d, 1.0, 0.2, 0.0,

    -l / 2, -h / 2, near, 0.0, 1.0, 1.0,
    -l / 2, h / 2, near, 0.0, 1.0, 1.0,
    -l / 2, -h / 2, near + d, 0.0, 1.0, 1.0,
    -l / 2, -h / 2, near + d, 0.0, 1.0, 1.0,
    -l / 2, h / 2, near, 0.0, 1.0, 1.0,
    -l / 2, h / 2, near + d, 0.0, 1.0, 1.0,

    l / 2, -h / 2, near, 0.0, 0.5, 0.8,
    l / 2, -h / 2, near + d, 0.0, 0.5, 0.8,
    l / 2, h / 2, near, 0.0, 0.5, 0.8,
    l / 2, h / 2, near, 0.0, 0.5, 0.8,
    l / 2, -h / 2, near + d, 0.0, 0.5, 0.8,
    l / 2, h / 2, near + d, 0.0, 0.5, 0.8,

    -l / 2, h / 2, near, 0.2, 0.5, 0.6,
    l / 2, h / 2, near, 0.2, 0.5, 0.6,
    -l / 2, h / 2, near + d, 0.2, 0.5, 0.6,
    -l / 2, h / 2, near + d, 0.2, 0.5, 0.6,
    l / 2, h / 2, near, 0.2, 0.5, 0.6,
    l / 2, h / 2, near + d, 0.2, 0.5, 0.6,

    -l / 2, -h / 2, near, 0.5, 0.5, 0.8,
    -l / 2, -h / 2, near + d, 0.5, 0.5, 0.8,
    l / 2, -h / 2, near, 0.5, 0.5, 0.8,
    l / 2, -h / 2, near, 0.5, 0.5, 0.8,
    -l / 2, -h / 2, near + d, 0.5, 0.5, 0.8,
    l / 2, -h / 2, near + d, 0.5, 0.5, 0.8,

]);


let normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
]);
const f32size = Float32Array.BYTES_PER_ELEMENT;

let program = util.initWebGL(gl, shader.vertexShader, shader.fragmentShader);
gl.useProgram(program);

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

const a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, f32size * 6, 0);


const a_color = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, f32size * 6, f32size * 3);


let normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

const a_normal = gl.getAttribLocation(program, 'a_normal');
gl.enableVertexAttribArray(a_normal);
gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, f32size * 3 , 0);


const uniforms = {
    u_perspective: util.createPerspective(200, 2000, -canvas.width / 2, canvas.width / 2, canvas.height / 2, -canvas.height / 2),
    u_rotateX: util.createRotateMatrix({x: 0, y: 0, z: 350}, 0, 'x'),
    u_rotateY: util.createRotateMatrix({x: 0, y: 0, z: 350}, 30, 'y'),
    u_rotateZ: util.createRotateMatrix({x: 0, y: 0, z: 350}, 0, 'z'),
    u_translate: util.createTranslateMatrix(0, 0, 0)
}


const u_perspective = gl.getUniformLocation(program, 'u_perspective');
gl.uniformMatrix4fv(u_perspective, false, uniforms.u_perspective);

const u_rotateX = gl.getUniformLocation(program, 'u_rotateX');
const u_rotateY = gl.getUniformLocation(program, 'u_rotateY');
const u_rotateZ = gl.getUniformLocation(program, 'u_rotateZ');
const u_translate = gl.getUniformLocation(program, 'u_translate');
gl.uniformMatrix4fv(u_rotateX, false, uniforms.u_rotateX);
gl.uniformMatrix4fv(u_rotateY, false, uniforms.u_rotateY);
gl.uniformMatrix4fv(u_rotateZ, false, uniforms.u_rotateZ);
gl.uniformMatrix4fv(u_translate, false, uniforms.u_translate);

let cameraPos = [200, 800, -800];
let cameraMatrix = util.lookAt(cameraPos, [0, 0, 350], [0, 1, 0]);

const u_camera = gl.getUniformLocation(program, 'u_camera');
gl.uniformMatrix4fv(u_camera, false, cameraMatrix);


cameraX.oninput = function () {
    cameraPos = [cameraX.value, cameraY.value, cameraZ.value];
    cameraMatrix = util.lookAt(cameraPos, [0, 0, 350], [0, 1, 0]);
    gl.uniformMatrix4fv(u_camera, false, cameraMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}


cameraY.oninput = function () {
    cameraPos = [cameraX.value, cameraY.value, cameraZ.value];
    cameraMatrix = util.lookAt(cameraPos, [0, 0, 350], [0, 1, 0]);
    gl.uniformMatrix4fv(u_camera, false, cameraMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}


cameraZ.oninput = function () {
    cameraPos = [cameraX.value, cameraY.value, cameraZ.value];
    cameraMatrix = util.lookAt(cameraPos, [0, 0, 350], [0, 1, 0]);
    gl.uniformMatrix4fv(u_camera, false, cameraMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}


gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.drawArrays(gl.TRIANGLES, 0, 36);


