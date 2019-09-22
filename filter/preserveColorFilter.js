import util from '../util.js';

const shader = {
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
    fragmentShader:  `#version 300 es
    precision mediump float;
    out vec4 out_color;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec4 u_color;

    int getType(vec3 color) {
        int type;
        float r = color.r, g = color.g, b = color.b;
        if (r >= g && r >= b) {
            type = 0;
        } else if (r >= b && r>= g) {
            type = 1;
        } else if (b >= r && b >= g) {
            type = 2;
        } else if (b >= g && b >= r) {
            type = 3;
        } else if (g >= r && g >= b) {
            type = 4;
        } else if (g >= b && g >= r) {
            type = 5;
        }
        return type;
    }
    void main () {

        vec4 color = texture(u_texture, v_texCoord);
        int preserveType = getType(u_color.rgb);
        int type = getType(color.rgb);
        if (preserveType == type) {
            out_color = color;
        } else {
            float avg = (color.r + color.g + color.b) / 3.0;
            out_color = vec4(avg, avg, avg, color.a);
        }
        
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


    const u_color = gl.getUniformLocation(program, 'u_color');
    gl.uniform4fv(u_color, new Float32Array([25, 255, 255, 255]));
    


    return {
        program,
    }
}