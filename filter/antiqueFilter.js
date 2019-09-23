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
    precision highp float;

    uniform sampler2D inputImageTexture;
    uniform sampler2D inputImageTexture2;
    uniform sampler2D inputImageTexture3;
    uniform sampler2D inputImageTexture4;
    //uniform sampler2D curve;
    //uniform sampler2D greyFrame;
    //uniform sampler2D layerImage;

    void main()
    {
        lowp vec4 textureColor;
        vec4 greyColor;
        vec4 layerColor;

        float xCoordinate = textureCoordinate.x;
        float yCoordinate = textureCoordinate.y;

        highp float redCurveValue;
        highp float greenCurveValue;
        highp float blueCurveValue;

        textureColor = texture2D( inputImageTexture, vec2(xCoordinate, yCoordinate));

        greyColor = texture2D(inputImageTexture3, vec2(xCoordinate, yCoordinate));
        layerColor = texture2D(inputImageTexture4, vec2(xCoordinate, yCoordinate));

        // step1 curve
        redCurveValue = texture2D(inputImageTexture2, vec2(textureColor.r, 0.0)).r;
        greenCurveValue = texture2D(inputImageTexture2, vec2(textureColor.g, 0.0)).g;
        blueCurveValue = texture2D(inputImageTexture2, vec2(textureColor.b, 0.0)).b;

        // step2 curve with mask
        textureColor = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);

        redCurveValue = texture2D(inputImageTexture2, vec2(textureColor.r, 0.0)).a;
        greenCurveValue = texture2D(inputImageTexture2, vec2(textureColor.g, 0.0)).a;
        blueCurveValue = texture2D(inputImageTexture2, vec2(textureColor.b, 0.0)).a;

        lowp vec4 textureColor2 = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);

        // step3 screen with 60%
        lowp vec4 base = vec4(mix(textureColor.rgb, textureColor2.rgb, 1.0 - greyColor.r), textureColor.a);
        lowp vec4 overlayer = vec4(layerColor.r, layerColor.g, layerColor.b, 1.0);

        // screen blending
        textureColor = 1.0 - ((1.0 - base) * (1.0 - overlayer));
        textureColor = (textureColor - base) * 0.6 + base;

        redCurveValue = texture2D(inputImageTexture2, vec2(textureColor.r, 1.0)).r;
        greenCurveValue = texture2D(inputImageTexture2, vec2(textureColor.g, 1.0)).g;
        blueCurveValue = texture2D(inputImageTexture2, vec2(textureColor.b, 1.0)).b;
        textureColor = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);

        gl_FragColor = vec4(textureColor.r, textureColor.g, textureColor.b, 1.0);
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
    const a_texCoord = gl.getAttribLocation(program, 'textureCoordinate');
    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);


    return {
        program
    }
}