import util from '../util.js';

const shader = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    out vec2 v_position;

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader:  `#version 300 es
    precision mediump float;
    out vec4 out_color;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform float u_params[3];
    void main () {
        float centerX = u_params[0];
        float centerY = u_params[1];
        float radius = u_params[2];
        float len = length(gl_FragCoord.xy - vec2(centerX, centerY));
        vec4 light = vec4(0.0, 0.0, 0.0, 1.0);
        if (len <= radius) {
            light = (1.0 - (len / radius)) * vec4(1.0, 1.0, 1.0, 1.0);
            // light = mix(light, vec4(1.0, 1.0, 1.0, 1.0), 1.0 - len / radius);
        }
        vec4 color = texture(u_texture, v_texCoord);
        out_color = vec4((color + light).rgb, color.a);
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

    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

    const u_texture = gl.getUniformLocation(program, 'u_texture');
    gl.uniform1i(u_texture, 0);

    const params = gl.getUniformLocation(program, 'u_params');
    gl.uniform1fv(params,new Float32Array([600, 300, 200]));


    return {
        program,
    }
}