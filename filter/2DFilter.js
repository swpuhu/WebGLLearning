import util from '../util.js';

const shader = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;

    uniform mat4 u_projection;
    uniform mat4 u_scale;
    uniform mat4 u_rotate;
    uniform mat4 u_translate;
    void main () {
        gl_Position = u_projection *  u_translate * u_rotate * u_scale * a_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader:  `#version 300 es
    precision mediump float;
    out vec4 out_color;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform float u_alpha;
    void main () {
        vec4 color = texture(u_texture, v_texCoord);
        out_color = vec4(color.rgb, color.a * u_alpha);
        
    }
    `
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Float32Array} projectionMat
 */
export default function (gl, projectionMat) {
    
    let program = util.initWebGL(gl, shader.vertexShader, shader.fragmentShader);
    let f32size = Float32Array.BYTES_PER_ELEMENT;
    gl.useProgram(program);

    const u_projection = gl.getUniformLocation(program, 'u_projection');
    gl.uniformMatrix4fv(u_projection, false, projectionMat);

    const a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);
    const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

    const u_scale = gl.getUniformLocation(program, 'u_scale');
    const u_rotate = gl.getUniformLocation(program, 'u_rotate');
    const u_translate = gl.getUniformLocation(program, 'u_translate');
    
    let scaleMat = util.createScaleMatrix(1, 1, 1, {x: gl.canvas.width / 2, y: gl.canvas.height / 2, z: 1});
    let rotateMat = util.createRotateMatrix({x: gl.canvas.width / 2, y: gl.canvas.height / 2}, 0);
    let translateMat = util.createTranslateMatrix(0, 0);

    gl.uniformMatrix4fv(u_scale, false, scaleMat);
    gl.uniformMatrix4fv(u_rotate, false, rotateMat);
    gl.uniformMatrix4fv(u_translate, false, translateMat);

    const u_alpha = gl.getUniformLocation(program, 'u_alpha');
    gl.uniform1f(u_alpha, 1);

    function setRotate(rotate, center) {
        rotateMat = util.createRotateMatrix({x: center.x, y: center.y}, rotate);
        gl.uniformMatrix4fv(u_rotate, false, rotateMat);
    }

    function setScale(sx, sy, center) {
        scaleMat = util.createScaleMatrix(sx, sy, 1, {x: center.x, y: center.y, z: 1});
        gl.uniformMatrix4fv(u_scale, false, scaleMat);
    }

    function setTranslate(x, y) {
        translateMat = util.createTranslateMatrix(x, y);
        gl.uniformMatrix4fv(u_translate, false, translateMat);
    }

    function setProjection(mat) {
        gl.uniformMatrix4fv(u_projection, false, mat);
    }

    function setAlpha(alpha) {
        gl.uniform1f(u_alpha, alpha);
    }

    function bindMap() {

    }

    return {
        program,
        setScale,
        setRotate,
        setTranslate,
        setProjection,
        bindMap,
        setAlpha
    }
}