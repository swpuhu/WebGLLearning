import util from '../util.js';

const shader = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
    }
    `,
    fragmentShader:  `#version 300 es
    precision mediump float;
    out vec4 out_color;
    uniform sampler2D u_texture;
    uniform float params[3];
    uniform vec2 u_resolution;
    void main () {
        float centerX = params[0], centerY = params[1], k = params[2];
        float offsetX = gl_FragCoord.x - centerX;
        float offsetY = gl_FragCoord.y - centerY;
        float radian = atan(offsetY, offsetX);
        float radius = length(vec2(offsetX, offsetY));
        float newX = radius * cos(radian + k * radius) + centerX;
        float newY = radius * sin(radian + k * radius) + centerY;
        vec4 color = texture(u_texture, vec2(newX, newY) / u_resolution);
        out_color = color;
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
    // const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
    // gl.enableVertexAttribArray(a_texCoord);
    // gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

    const u_texture = gl.getUniformLocation(program, 'u_texture');
    gl.uniform1i(u_texture, 0);

    const params = gl.getUniformLocation(program, 'params');
    gl.uniform1fv(params, [gl.canvas.width / 2, gl.canvas.height / 2, 0 / 3600]);


    function setRotate(value) {
        gl.uniform1fv(params, [gl.canvas.width / 2, gl.canvas.height / 2,  value / 3600]);
    }

    


    return {
        program,
        setRotate
    }
}