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
    varying highp vec2 textureCoordinate;
    precision mediump float;

    uniform sampler2D inputImageTexture;
    uniform vec2 singleStepOffset;

    const highp vec3 W = vec3(0.299,0.587,0.114);

    void main()
    {
        float threshold = 0.0;
        //pic1
        vec4 oralColor = texture2D(inputImageTexture, textureCoordinate);

        //pic2
        vec3 maxValue = vec3(0.,0.,0.);

        for(int i = -2; i<=2; i++)
        {
            for(int j = -2; j<=2; j++)
            {
                vec4 tempColor = texture2D(inputImageTexture, textureCoordinate+singleStepOffset*vec2(i,j));
                maxValue.r = max(maxValue.r,tempColor.r);
                maxValue.g = max(maxValue.g,tempColor.g);
                maxValue.b = max(maxValue.b,tempColor.b);
                threshold += dot(tempColor.rgb, W);
            }
        }
        //pic3
        float gray1 = dot(oralColor.rgb, W);

        //pic4
        float gray2 = dot(maxValue, W);

        //pic5
        float contour = gray1 / gray2;

        threshold = threshold / 25.;
        float alpha = max(1.0,gray1>threshold?1.0:(gray1/threshold));

        float result = contour * alpha + (1.0-alpha)*gray1;

        gl_FragColor = vec4(vec3(result,result,result), oralColor.w);
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

    
    const signleStepOffset = gl.getUniformLocation(program, 'signleStepOffset');
    gl.uniform2f(signleStepOffset, 0.001, 0.00001);
    
    function setSingleStepOffset(x, y) {
        gl.uniform2f(signleStepOffset, x, y);
    }
    
    return {
        program,
        setSingleStepOffset
    }
}