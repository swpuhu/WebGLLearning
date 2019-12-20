import util from '../util.js';

const vertexShader = `
    attribute vec4 a_position;
    uniform mat4 u_projection;
    uniform mat4 u_translate;
    uniform mat4 u_scale;
    void main () {
        gl_Position = u_projection * u_translate * u_scale * a_position;
    }

`

const fragmentShader = `
    precision mediump float;
    uniform vec2 u_resolution;
    float circle(vec2 pos, vec2 center, float radius) {
        vec2 vector = pos - center;
        return smoothstep(0.0, radius * 5.0, pow(radius, 2.0) - dot(vector, vector));
    }
    void main () {
        gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    }
`;




let canvas = document.createElement('canvas');
let width = 640;
let height = 360;
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
let gl = canvas.getContext('webgl2');

let program = util.initWebGL(gl, vertexShader, fragmentShader);
gl.useProgram(program);


let f32size = Float32Array.BYTES_PER_ELEMENT;

let a_position = gl.getAttribLocation(program, 'a_position');

let circleVAO = gl.createVertexArray();
gl.bindVertexArray(circleVAO);
let circleBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
let [circleDrawType, circlePoints] = util.createCirclePoints(width / 2, height / 2, 20);
gl.bufferData(gl.ARRAY_BUFFER, circlePoints, gl.STATIC_DRAW);
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 2, 0);


let rectVAO = gl.createVertexArray();
gl.bindVertexArray(rectVAO);
let rectBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rectBuffer);
let [rectDrawType, rectPoints] = util.createRectPoints(width / 2, height / 2, 100, 100);
gl.bufferData(gl.ARRAY_BUFFER, rectPoints, gl.STATIC_DRAW);
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 2, 0);



let u_projection = gl.getUniformLocation(program, 'u_projection');
let projectionMat = util.createProjection(width, height, 1);
gl.uniformMatrix4fv(u_projection, false, projectionMat);

let u_resolution = gl.getUniformLocation(program, 'u_resolution');
gl.uniform2f(u_resolution, width, height);

let u_translate = gl.getUniformLocation(program, 'u_translate');
let translateMat = util.createTranslateMatrix(0, 0, 0);
gl.uniformMatrix4fv(u_translate, false, translateMat);

let u_scale = gl.getUniformLocation(program, 'u_scale');
let scaleMat = util.createScaleMatrix(1, 1, 1);
gl.uniformMatrix4fv(u_scale, false, scaleMat);




let framebuffer = gl.createFramebuffer();




gl.bindVertexArray(circleVAO);
scaleMat = util.createScaleMatrix(5, 1, 1, {x: width / 2, y: height / 2, z: 1});
gl.uniformMatrix4fv(u_scale, false, scaleMat);
gl.drawArrays(circleDrawType, 0, circlePoints.length / 2);


gl.bindVertexArray(rectVAO);
translateMat = util.createTranslateMatrix(100, 50, 0);
scaleMat = util.createScaleMatrix(1, 1, 1);
gl.uniformMatrix4fv(u_scale, false, scaleMat);
gl.uniformMatrix4fv(u_translate, false, translateMat);
gl.drawArrays(rectDrawType, 0, rectPoints.length / 2);