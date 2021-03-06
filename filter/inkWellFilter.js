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
    uniform sampler2D inputImageTexture2;

    void main()
    {
        highp vec4 origin_texel = texture2D(inputImageTexture, textureCoordinate); 
        highp vec3 texel = origin_texel.rgb;
        texel = vec3(dot(vec3(0.3, 0.6, 0.1), texel));
        texel = vec3(texture2D(inputImageTexture2, vec2(texel.r, .8334)).r);
        gl_FragColor = vec4(texel, origin_texel.a);
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


    const inputImageTexture = gl.getUniformLocation(program, 'inputImageTexture');
    const inputImageTexture2 = gl.getUniformLocation(program, 'inputImageTexture2');
    gl.uniform1i(inputImageTexture, 0);
    gl.uniform1i(inputImageTexture2, 1);
    gl.activeTexture(gl.TEXTURE1);

    let inkWellMap = new Image();
    inkWellMap.src = './maskImg/inkwellmap.png';
    let inkWellTexture = util.createTexture(gl);

    inkWellMap.onload = function () {
        gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(inkWellTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inkWellMap);
        gl.activeTexture(gl.TEXTURE0);
    }

    function bindMap() {
        gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(gl.TEXTURE_2D, inkWellTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inkWellMap);
        gl.activeTexture(gl.TEXTURE0);
    }
    return {
        program,
        bindMap
    };
}