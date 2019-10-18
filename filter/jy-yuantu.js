import util from '../util.js';

const shader = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 texture_coordinates;

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        texture_coordinates = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision highp float;
    uniform sampler2D inputImageTexture1; /**< =InputVideoBuffer*/
    uniform sampler2D inputImageTexture2; /**< =Texture19.png*/
    uniform sampler2D inputImageTexture3; /**< =Texture20.png*/
    
    uniform float leftIntensity;  /**< =0.5, ParamIn.UICtrl */
    uniform float rightIntensity; /**< =0.5, ParamIn.UICtrl, ==leftIntensity */
    uniform float mposition;      /**< =1.0 */
    
    in vec2 texture_coordinates;
    out vec4 frag_colour;
    
    void main() {
      highp vec4 textureColor1 = texture( inputImageTexture1, texture_coordinates );
      // textureColor1            = clamp( textureColor1, 0.0, 1.0 );
    
      highp float blueColor = textureColor1.b * 63.0;
      highp vec2 blueIndex = vec2(floor( blueColor ), ceil( blueColor ));
    
      highp vec4 quad;
      quad.yw = floor(blueIndex/8.0);
      quad.xz = blueIndex - quad.yw*8.0;
    
      highp vec2 texPos;
      texPos.x = ( quad.x * 0.125 ) + 0.5 / 512.0 + ( ( 0.125 - 1.0 / 512.0 ) * textureColor1.r);
      texPos.y = ( quad.y * 0.125 ) + 0.5 / 512.0 + ( ( 0.125 - 1.0 / 512.0 ) * textureColor1.g);
      texPos.y = 1.0 - texPos.y;
      
    
      if ( texture_coordinates.x < mposition ) {
        frag_colour          = vec4( 1.0 );
        lowp vec4 newColor2_1 = texture( inputImageTexture2, texPos);
        lowp vec4 newColor2_2 = texture( inputImageTexture2, texPos );
        lowp vec4 newColor22  = mix( newColor2_1, newColor2_2, fract( blueColor ) );
        frag_colour          = mix( textureColor1, vec4( newColor22.rgb, textureColor1.w ), leftIntensity );
      } else {
        lowp vec4 newColor3_1 = texture( inputImageTexture3, texPos);
        lowp vec4 newColor3_2 = texture( inputImageTexture3, texPos);
        lowp vec4 newColor33  = mix( newColor3_1, newColor3_2, fract( blueColor ) );
        frag_colour          = mix( textureColor1, vec4( newColor33.rgb, textureColor1.w ), rightIntensity );
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
    gl.uniform1f(leftIntensity, 1.0);

    const rightIntensity = gl.getUniformLocation(program, 'rightIntensity');
    gl.uniform1f(rightIntensity, 1.0);

    const mposition = gl.getUniformLocation(program, 'mposition');
    gl.uniform1f(mposition, 1.0);


    const inputImageTexture2 = gl.getUniformLocation(program, 'inputImageTexture2');
    gl.uniform1i(inputImageTexture2, 1);
    const inputImageTexture3 = gl.getUniformLocation(program, 'inputImageTexture3');
    gl.uniform1i(inputImageTexture3, 2);

    const texture2Image = new Image();
    const texture2ImageTexture = util.createTexture(gl);
    texture2Image.src = '../assets/jy-yuantu.png';
    texture2Image.onload = function () {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture2Image);
        gl.activeTexture(gl.TEXTURE0);
    }

    const texture3Image = new Image();
    const texture3ImageTexture = util.createTexture(gl);
    texture3Image.src = '../assets/jy-yuantu.png';
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

    let ui;
    function createUI () {
        ui = document.createElement('div');
        ui.classList.add('ui');
        let editor = util.createEditor('程度', 'range', 0, 1.0, 1.0, 0.01);
        ui.appendChild(editor.ref);
        editor.oninput = function () {
            if (program !== gl.CURRENT_PROGRAM) {
                gl.useProgram(program);
            }
            const leftIntensity = gl.getUniformLocation(program, 'leftIntensity');
            gl.uniform1f(leftIntensity, editor.value);

            const rightIntensity = gl.getUniformLocation(program, 'rightIntensity');
            gl.uniform1f(rightIntensity, editor.value);
            window.render();
        }
        return ui;
    }

    function getElement() {
        return ui ? ui : createUI();
    }

    return {
        program,
        bindMap,
        getElement
    }
}