import util from '../util.js'
const vertexShader = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    attribute vec3 a_normal;
    varying vec2 v_texCoord;
    varying vec4 v_normal;
    uniform mat4 u_perspective;
    uniform mat4 u_camera;
    uniform mat4 u_rotateX;
    uniform mat4 u_translate;
    void main () {
        gl_Position = u_perspective * u_camera * u_translate * u_rotateX * a_position;
        v_normal = u_translate * u_rotateX * vec4(a_normal, 1.0);
        v_texCoord = a_texCoord;
    }
`
const fragmentShader = `
    precision mediump float;
    varying vec2 v_texCoord;
    varying vec4 v_normal;
    void main () {
        vec3 direction_ref = normalize(vec3(0.0, 0.0, 1.0));
        vec3 normal = normalize(v_normal.xyz);
        float light = dot(normal, direction_ref);
        if (light > 0.0) {
            gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
        } else {
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            // gl_FragColor = vec4(vec3(-dot(normal, direction_ref)), 1.0);
        }
        
    }

`

const canvas = document.createElement('canvas');
canvas.style.border = `1px solid #ccc`;
const width = 640;
const height = 360;
canvas.width = width;
canvas.height = height;
const gl = canvas.getContext('webgl');
gl.clearColor(0.0, 0.0, 0.0, 0.0);
document.body.appendChild(canvas);

let program = util.initWebGL(gl, vertexShader, fragmentShader);
gl.useProgram(program);

let attribSetter = util.createAttributeSetters(gl, program);
let uniformSetter = util.createUniformSetters(gl, program);
let near = 600;
let far = 2000;
let zPos = 1000;

let _width = 2 * width;
let _height = 2 * height;

const attributeDatas = {
    a_position: new Float32Array([
        0.0, 0.0, zPos, 1.0,
        _width, 0.0, zPos, 1.0,
        _width, _height, zPos, 1.0,
        _width, _height, zPos, 1.0,
        0.0, _height, zPos, 1.0,
        0.0, 0.0, zPos, 1.0
    ]),
    a_normal: [],
    a_texCoord: new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0
    ])
};
let vec1 = [_width, 0.0, 0.0];
let vec2 = [0.0, _height, 0.0];
let normal = util.cross(vec1, vec2);

for (let i = 0; i < attributeDatas.a_position.length; i++) {
    attributeDatas.a_normal.push(...normal);
}
attributeDatas.a_normal = new Float32Array(attributeDatas.a_normal);

console.log(attributeDatas.a_normal);




let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, attributeDatas.a_position, gl.STATIC_DRAW);

let normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, attributeDatas.a_normal, gl.STATIC_DRAW);

let texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, attributeDatas.a_texCoord, gl.STATIC_DRAW);

let cameraPos_x = 0.0;
let cameraPos_y = 0.0;
let cameraPos_z = 0.0;
let rotateX = 0;
let tx = -zPos / near * width / 2;
let ty = -zPos / near * height / 2;
let tz = 0;
let cameraPos = [cameraPos_x, cameraPos_y, cameraPos_z];
let cameraMat = util.lookAt(cameraPos, [0.0, 0.0, zPos], [0.0, 1.0, 0.0]);
let rotateXMat = util.createRotateMatrix({y: _height / 2, z: zPos}, rotateX, 'x');
let translateMat = util.createTranslateMatrix(tx, ty, tz);
const attributes = {
    a_position: {
        numComponents: 4,
        stride: Float32Array.BYTES_PER_ELEMENT * 4,
        offset: 0,
        buffer: positionBuffer
    },
    a_normal: {
        numComponents: 3,
        stride: Float32Array.BYTES_PER_ELEMENT * 3,
        offset: 0,
        buffer: normalBuffer
    },
    a_texCoord: {
        numComponents: 2,
        stride: Float32Array.BYTES_PER_ELEMENT * 2,
        offset: 0,
        buffer: texCoordBuffer
    }
}

const uniforms = {
    u_perspective: util.createPerspective(near, far, -width, width, -height, height),
    u_camera: util.inverse(cameraMat),
    u_rotateX: rotateXMat,
    u_translate: translateMat
}

util.setAttributes(attribSetter, attributes);
util.setUniforms(uniformSetter, uniforms);
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
draw();


document.onmousedown = function (e) {
    let initX = cameraPos_x;
    let initY = cameraPos_y;
    document.onmousemove = function (ev) {
        let offsetX = ev.clientX - e.clientX;
        let offsetY = ev.clientY - e.clientY;
        cameraPos_x = initX + offsetX;
        cameraPos_y = initY + offsetY;
        cameraPos = [cameraPos_x, cameraPos_y, cameraPos_z];
        cameraMat = util.lookAt(cameraPos, [cameraPos_x, cameraPos_y, zPos], [0.0, 1.0, 0.0]);
        uniforms.u_camera = util.inverse(cameraMat)
        util.setUniforms(uniformSetter, uniforms);
        draw();
    }
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}

document.onwheel = function (e) {
    rotateX += e.deltaY / 50;
    uniforms.u_rotateX = util.createRotateMatrix({ y: _height / 2, z: zPos}, rotateX, 'x');
    util.setUniforms(uniformSetter, uniforms);
    draw();
}