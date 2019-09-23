import util from '../util.js';
const shader = {
    vertexShader: `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 textureCoordinate;

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        textureCoordinate = a_texCoord;
    }
    `,
    fragmentShader:  `
    varying highp vec2 textureCoordinate;

    uniform sampler2D inputImageTexture;
    uniform lowp float rangeReduction;

    // Values from \"Graphics Shaders: Theory and Practice\" by Bailey and Cunningham
    const mediump vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

    void main()
    {
        lowp vec4 textureColor = texture2D(inputImageTexture, textureCoordinate);
        mediump float luminance = dot(textureColor.rgb, luminanceWeighting);
        mediump float luminanceRatio = ((0.5 - luminance) * rangeReduction);

        gl_FragColor = vec4((textureColor.rgb) + (luminanceRatio), textureColor.w);
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

    const a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);
    const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

    const rangeReduction = gl.getUniformLocation(program, 'rangeReduction');
    gl.uniform1f(rangeReduction, 0.6);

    function setRangeReduction (value) {
        gl.uniform1f(rangeReduction, value);
    }
    
    gl.uniformMatrix4fv(u_projection, false, projectionMat);

    return {
        program,
        setRangeReduction
    }
}