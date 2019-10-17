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
    fragmentShader: `
    precision highp float;
    uniform sampler2D inputImageTexture1;               /**< =InputVideoBuffer*/
    uniform sampler2D inputImageTexture2;               /**< =Texture19.png*/
    uniform sampler2D inputImageTexture3;               /**< =Texture20.png*/
    varying lowp vec2 textureCoordinate;
    uniform float leftIntensity;                        /**< =0.77, ParamIn.UICtrl */
    uniform float rightIntensity;                       /**< =0.77, ParamIn.UICtrl, ==leftIntensity */
    uniform float mposition;                            /**< =1.0 */
    void main()
    {
        highp vec4 textureColor1 = texture2D(inputImageTexture1, textureCoordinate);
        textureColor1 = clamp(textureColor1, 0.0, 1.0);
        
        highp float blueColor = textureColor1.b * 63.0;
        
        highp vec2 quad1;
        quad1.y = floor(floor(blueColor) / 8.0);
        quad1.x = floor(blueColor) - (quad1.y * 8.0);
        highp vec2 quad2;
        quad2.y = floor(ceil(blueColor) / 8.0);
        quad2.x = ceil(blueColor) - (quad2.y * 8.0);
        
        highp vec2 texPos1;
        texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor1.r);
        texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor1.g);
        highp vec2 texPos2;
        texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor1.r);
        texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor1.g);
        texPos1.y = 1.0 - texPos1.y;
        texPos2.y = 1.0 - texPos2.y;
        
        if(textureCoordinate.x<mposition){
            gl_FragColor = vec4(1.0);
            lowp vec4 newColor2_1 = texture2D(inputImageTexture2, texPos1);
            lowp vec4 newColor2_2 = texture2D(inputImageTexture2, texPos2);
            lowp vec4 newColor22 = mix(newColor2_1, newColor2_2, fract(blueColor));
            gl_FragColor = mix(textureColor1, vec4(newColor22.rgb, textureColor1.w), leftIntensity);
        }else{
            lowp vec4 newColor3_1 = texture2D(inputImageTexture3, texPos1);
            lowp vec4 newColor3_2 = texture2D(inputImageTexture3, texPos2);
            lowp vec4 newColor33 = mix(newColor3_1, newColor3_2, fract(blueColor));
            gl_FragColor = mix(textureColor1, vec4(newColor33.rgb, textureColor1.w), rightIntensity);
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

    const leftIntensity = gl.getUniformLocation(program, 'leftIntensity');
    gl.uniform1f(leftIntensity, 0.77);

    const rightIntensity = gl.getUniformLocation(program, 'rightIntensity');
    gl.uniform1f(rightIntensity, 0.77);

    const mposition = gl.getUniformLocation(program, 'mposition');
    gl.uniform1f(mposition, 1.0);


    const inputImageTexture2 = gl.getUniformLocation(program, 'inputImageTexture2');
    gl.uniform1i(inputImageTexture2, 1);
    const inputImageTexture3 = gl.getUniformLocation(program, 'inputImageTexture3');
    gl.uniform1i(inputImageTexture3, 2);

    const texture2Image = new Image();
    const texture2ImageTexture = util.createTexture(gl);
    texture2Image.src = '../assets/Texture35.png';
    texture2Image.onload = function () {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture2Image);
        gl.activeTexture(gl.TEXTURE0);
    }

    const texture3Image = new Image();
    const texture3ImageTexture = util.createTexture(gl);
    texture3Image.src = '../assets/Texture36.png';
    texture3Image.onload = function () {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texture3ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture3Image);
        gl.activeTexture(gl.TEXTURE0);
    }

    
    function bindMap() {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture2Image);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texture3ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture3Image);
        
        gl.activeTexture(gl.TEXTURE0);
    }

    return {
        program,
        bindMap
    }
}