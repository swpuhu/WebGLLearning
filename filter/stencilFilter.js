import util from '../util.js';

const shader = {
    vertexShader: `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 textureCoordinate;
    varying vec2 textureCoordinate2;
    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        textureCoordinate = a_texCoord;
        textureCoordinate2 = a_texCoord;
    }
    `,
    fragmentShader: `
    varying highp vec2 textureCoordinate;
    varying highp vec2 textureCoordinate2;

    uniform sampler2D inputImageTexture;
    uniform sampler2D inputImageTexture2;
    uniform int keepAlpha;

    void main()
    {
        highp vec4 tex = texture2D(inputImageTexture, textureCoordinate);
        highp vec4 texMask = texture2D(inputImageTexture2, textureCoordinate2);
        highp vec4 textureColor = tex*(1.0-texMask.a);

        if (keepAlpha == 1){
            gl_FragColor = vec4(textureColor.rgb, 1.0 - texMask.a);
        } else {
            gl_FragColor = vec4(textureColor.rgb, 1.0);
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

    const keepAlpha = gl.getUniformLocation(program, 'keepAlpha');
    gl.uniform1i(keepAlpha, 0);

    const inputImageTexture2 = gl.getUniformLocation(program, 'inputImageTexture2');
    gl.uniform1i(inputImageTexture2, 1);
    gl.activeTexture(gl.TEXTURE1);

    let templateImg = new Image();
    templateImg.src = './template/shark.png';
    const templateTexture = util.createTexture(gl);
    templateImg.onload = function () {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, templateTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, templateImg);
        gl.activeTexture(gl.TEXTURE0);
    }
    
    function bindMap() {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, templateTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, templateImg);
        gl.activeTexture(gl.TEXTURE0);
    }

    function setImage(img) {
        templateImg = img;
        bindMap();
    }

    
    
    return {
        program,
        setImage,
        bindMap
    }
}