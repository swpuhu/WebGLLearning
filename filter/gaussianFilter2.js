import util from '../util.js';
const shader = {
    vertexShader: `
    attribute vec4 position;
    attribute vec4 inputTextureCoordinate;

    const int GAUSSIAN_SAMPLES = 9;

    uniform float texelWidthOffset;
    uniform float texelHeightOffset;
    uniform mat4 u_projection;
    varying vec2 textureCoordinate;
    varying vec2 blurCoordinates[GAUSSIAN_SAMPLES];

    void main(){

        gl_Position = u_projection * position;
        textureCoordinate = inputTextureCoordinate.xy;

        // Calculate the positions for the blur
        int multiplier = 0;
        vec2 blurStep;
        vec2 singleStepOffset = vec2(texelHeightOffset, texelWidthOffset);

        for (int i = 0; i < GAUSSIAN_SAMPLES; i++){
            multiplier = (i - ((GAUSSIAN_SAMPLES - 1) / 2));
            // Blur in x (horizontal)
            blurStep = float(multiplier) * singleStepOffset;
            blurCoordinates[i] = inputTextureCoordinate.xy + blurStep;
        }
    }
    `,
    fragmentShader:  `
    uniform sampler2D inputImageTexture;

    const lowp int GAUSSIAN_SAMPLES = 9;

    varying highp vec2 textureCoordinate;
    varying highp vec2 blurCoordinates[GAUSSIAN_SAMPLES];

    void main(){

        lowp vec3 sum = vec3(0.0);
        lowp vec4 fragColor=texture2D(inputImageTexture,textureCoordinate);

        sum += texture2D(inputImageTexture, blurCoordinates[0]).rgb * 0.05;
        sum += texture2D(inputImageTexture, blurCoordinates[1]).rgb * 0.09;
        sum += texture2D(inputImageTexture, blurCoordinates[2]).rgb * 0.12;
        sum += texture2D(inputImageTexture, blurCoordinates[3]).rgb * 0.15;
        sum += texture2D(inputImageTexture, blurCoordinates[4]).rgb * 0.18;
        sum += texture2D(inputImageTexture, blurCoordinates[5]).rgb * 0.15;
        sum += texture2D(inputImageTexture, blurCoordinates[6]).rgb * 0.12;
        sum += texture2D(inputImageTexture, blurCoordinates[7]).rgb * 0.09;
        sum += texture2D(inputImageTexture, blurCoordinates[8]).rgb * 0.05;
        gl_FragColor = vec4(sum,fragColor.a);
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

    const a_position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);
    const a_texCoord = gl.getAttribLocation(program, 'inputTextureCoordinate');
    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

    

    const texelWidthOffset = gl.getUniformLocation(program, 'texelWidthOffset');
    const texelHeightOffset = gl.getUniformLocation(program, 'texelHeightOffset');
    gl.uniform1f(texelWidthOffset, 0.01);
    gl.uniform1f(texelHeightOffset, 0.01);

    function setParams(width, height) {
        gl.uniform1f(texelWidthOffset, width / gl.canvas.width);
        gl.uniform1f(texelHeightOffset, height / gl.canvas.height);
    }
    return {
        program,
        setParams
    }
}