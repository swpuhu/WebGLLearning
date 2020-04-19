import util from '../util.js';

const vertexShader = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform mat4 u_projection;
    uniform mat4 au_rotate;
    void main () {
        gl_Position = u_projection * au_rotate * a_position;
        v_texCoord = a_texCoord;
    }
`

const fragShader = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform sampler2D texture;
    varying vec2 v_texCoord;
    uniform mat4 u_rotate;
    uniform mat4 u_scale;
    void main () {
        vec2 p = v_texCoord;
        p = (u_rotate * u_scale * vec4(p, 1.0, 1.0)).xy / u_resolution;
        if (p.x < 0. || p.y < 0. || p.x > 1. || p.y > 1.0) {
            // return;
        } else {
            vec4 textureColor = texture2D(texture, p);
            gl_FragColor = textureColor;

        }
    }
`
let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let width = 640;
let height = 360;
canvas.width = width;
canvas.height = height;
let gl = canvas.getContext('webgl');
let program = util.initWebGL(gl, vertexShader, fragShader);
gl.useProgram(program);
let scale = 2;

let points = new Float32Array([
    0.0, 0.0,
    width / 2 * 0.8, 0.0,
    width / 2 * 0.8, height,
    width / 2 * 0.8, height,
    0.0, height,
    0.0, 0.0,
]);

let points2 = new Float32Array([
    width / 2, 0.0, 
    width, 0.0,
    width, height,
    width, height,
    width / 2, height,
    width / 2, 0.0
])
points = new Float32Array([...points, ...points2]);

for (let i = 0; i < points.length; i += 2) {
    [points[i], points[i + 1]] = util.scalePoint(points[i], points[i + 1], scale, scale, {x: width / 2, y: height / 2});
}
console.log(points);


let texCoords = new Float32Array(new Array(points.length));
for (let i = 0; i < texCoords.length; i += 2) {
    texCoords[i] = points[i];
    texCoords[i + 1] = points[i + 1];
}
let pointsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let texCoordsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

let attribSetters = util.createAttributeSetters(gl, program);
let uniformSetters = util.createUniformSetters(gl, program);

// 以上程序通用
let attributes = {
    a_position: {
        numComponents: 2,
        stride: 2 * Float32Array.BYTES_PER_ELEMENT,
        offset: 0 * Float32Array.BYTES_PER_ELEMENT,
        buffer: pointsBuffer
    },
    a_texCoord: {
        numComponents: 2,
        stride: 2 * Float32Array.BYTES_PER_ELEMENT,
        offset: 0 * Float32Array.BYTES_PER_ELEMENT,
        buffer: texCoordsBuffer
    }
}

let rotate = 30;
let uniforms = {
    u_projection: util.createProjection(width, height, 50),
    u_resolution: new Float32Array([width, height]),
    u_rotate: util.createRotateMatrix({x: width / 2, y: height / 2}, rotate, 'z'),
    au_rotate: util.createRotateMatrix({x: width / 2, y: height / 2}, rotate, 'z'),
    u_scale: util.createScaleMatrix(1, 1, 1, {x: width / 2, y: height / 2})
}
function draw() {
    util.setAttributes(attribSetters, attributes);
    util.setUniforms(uniformSetters, uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 12);
}



let image = new Image();
let texture = util.createTexture(gl);
image.src = '../assets/gaoda1.jpg';
image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    draw();
}