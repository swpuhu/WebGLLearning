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

    precision highp float;
    uniform sampler2D inputImageTexture;
    uniform sampler2D inputImageTexture2;
    //uniform sampler2D curve;

    uniform sampler2D inputImageTexture3;
    //uniform sampler2D grey1Frame;
    uniform sampler2D inputImageTexture4;
    //uniform sampler2D grey2Frame;

    void main()
    {
        float GreyVal;
        lowp vec4 textureColor;
        lowp vec4 textureColorOri;
        float xCoordinate = textureCoordinate.x;
        float yCoordinate = textureCoordinate.y;

        highp float redCurveValue;
        highp float greenCurveValue;
        highp float blueCurveValue;

        vec4 grey1Color;
        vec4 grey2Color;

        textureColor = texture2D( inputImageTexture, vec2(xCoordinate, yCoordinate));
        grey1Color = texture2D(inputImageTexture4, vec2(xCoordinate, yCoordinate));
        grey2Color = texture2D(inputImageTexture3, vec2(xCoordinate, yCoordinate));
        highp vec4 curveColor = texture2D(inputImageTexture2, vec2(xCoordinate, yCoordinate));

        // step1 normal blending with original
        redCurveValue = texture2D(inputImageTexture2, vec2(textureColor.r, 0.0)).r;
        greenCurveValue = texture2D(inputImageTexture2, vec2(textureColor.g, 0.0)).g;
        blueCurveValue = texture2D(inputImageTexture2, vec2(textureColor.b, 0.0)).b;

        textureColorOri = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);
        textureColor = (textureColorOri - textureColor) * grey1Color.r + textureColor;

        redCurveValue = texture2D(inputImageTexture2, vec2(textureColor.r, 0.0)).a;
        greenCurveValue = texture2D(inputImageTexture2, vec2(textureColor.g, 0.0)).a;
        blueCurveValue = texture2D(inputImageTexture2, vec2(textureColor.b, 0.0)).a;

        //textureColor = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);

        // step3 60% opacity  ExclusionBlending
        textureColor = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);
        mediump vec4 textureColor2 = vec4(0.08627, 0.03529, 0.15294, 1.0);
        textureColor2 = textureColor + textureColor2 - (2.0 * textureColor2 * textureColor);

        textureColor = (textureColor2 - textureColor) * 0.6784 + textureColor;


        mediump vec4 overlay = vec4(0.6431, 0.5882, 0.5803, 1.0);
        mediump vec4 base = textureColor;

        // overlay blending
        mediump float ra;
        if (base.r < 0.5) {
            ra = overlay.r * base.r * 2.0;
        } else {
            ra = 1.0 - ((1.0 - base.r) * (1.0 - overlay.r) * 2.0);
        }

        mediump float ga;
        if (base.g < 0.5) {
            ga = overlay.g * base.g * 2.0;
        } else {
            ga = 1.0 - ((1.0 - base.g) * (1.0 - overlay.g) * 2.0);
        }

        mediump float ba;
        if (base.b < 0.5) {
            ba = overlay.b * base.b * 2.0;
        } else {
            ba = 1.0 - ((1.0 - base.b) * (1.0 - overlay.b) * 2.0);
        }

        textureColor = vec4(ra, ga, ba, 1.0);
        base = (textureColor - base) + base;

        // again overlay blending
        overlay = vec4(0.0, 0.0, 0.0, 1.0);

        // overlay blending
        if (base.r < 0.5) {
            ra = overlay.r * base.r * 2.0;
        } else {
            ra = 1.0 - ((1.0 - base.r) * (1.0 - overlay.r) * 2.0);
        }

        if (base.g < 0.5) {
            ga = overlay.g * base.g * 2.0;
        } else {
            ga = 1.0 - ((1.0 - base.g) * (1.0 - overlay.g) * 2.0);
        }

        if (base.b < 0.5) {
            ba = overlay.b * base.b * 2.0;
        } else {
            ba = 1.0 - ((1.0 - base.b) * (1.0 - overlay.b) * 2.0);
        }

        textureColor = vec4(ra, ga, ba, 1.0);
        textureColor = (textureColor - base) * (grey2Color * 0.549) + base;

        gl_FragColor = vec4(textureColor.r, textureColor.g, textureColor.b, 1.0);
        // gl_FragColor = curveColor;
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
    
    const inputImageTexture2 = gl.getUniformLocation(program, 'inputImageTexture2');
    gl.uniform1i(inputImageTexture2, 1);
    const inputImageTexture3 = gl.getUniformLocation(program, 'inputImageTexture3');
    gl.uniform1i(inputImageTexture3, 2);
    const inputImageTexture4 = gl.getUniformLocation(program, 'inputImageTexture4');
    gl.uniform1i(inputImageTexture4, 3);

    
    const curveData1 = [0, 1, 2, 3, 5, 5, 7, 8, 9, 10, 11, 12, 13, 15, 16, 16, 18, 19, 20, 21, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33, 35, 36, 38, 39, 40, 41, 42, 44, 45, 47, 48, 49, 51, 52, 54, 55, 56, 59, 60, 62, 63, 64, 66, 67, 70, 71, 72, 74, 76, 78, 79, 80, 83, 84, 85, 88, 89, 90, 93, 94, 95, 98, 99, 100, 102, 104, 106, 107, 108, 109, 112, 113, 114, 116, 117, 118, 119, 120, 122, 124, 125, 126, 128, 129, 130, 131, 132, 132, 133, 135, 136, 137, 138, 139, 140, 141, 142, 142, 143, 145, 146, 147, 148, 148, 149, 150, 151, 151, 152, 153, 154, 155, 155, 156, 157, 157, 158, 159, 160, 160, 161, 162, 162, 163, 164, 165, 165, 166, 167, 167, 168, 169, 169, 170, 171, 171, 172, 173, 173, 174, 175, 175, 176, 177, 177, 178, 178, 179, 179, 180, 181, 181, 182, 183, 183, 184, 185, 185, 186, 187, 188, 188, 189, 190, 190, 191, 192, 193, 193, 194, 194, 194, 195, 196, 197, 197, 198, 199, 200, 201, 201, 202, 203, 204, 204, 205, 206, 207, 208, 208, 208, 209, 210, 211, 212, 212, 213, 214, 215, 216, 217, 218, 218, 219, 220, 221, 222, 222, 223, 224, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 234, 235, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 247, 248, 248, 249, 250, 251, 252, 253, 254, 255]
    const curveData2 = [0, 1, 2, 3, 4, 5, 6, 7, 9, 9, 10, 12, 12, 13, 14, 16, 16, 17, 19, 20, 20, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33, 35, 36, 37, 39, 40, 41, 42, 43, 44, 46, 47, 49, 50, 51, 53, 54, 56, 57, 59, 61, 62, 64, 65, 66, 69, 70, 72, 73, 76, 77, 78, 80, 82, 84, 85, 87, 89, 90, 93, 94, 95, 98, 99, 100, 103, 104, 106, 108, 109, 111, 112, 114, 116, 117, 118, 120, 122, 123, 124, 125, 126, 129, 130, 131, 132, 133, 135, 136, 137, 138, 139, 140, 141, 142, 143, 145, 146, 147, 148, 149, 150, 151, 152, 152, 153, 154, 155, 156, 157, 158, 158, 159, 160, 161, 162, 162, 163, 164, 165, 165, 166, 167, 167, 168, 169, 170, 170, 171, 172, 172, 173, 173, 174, 175, 175, 176, 177, 177, 178, 178, 178, 179, 179, 180, 181, 181, 182, 182, 183, 184, 184, 185, 185, 186, 187, 187, 188, 188, 189, 190, 190, 191, 191, 192, 193, 193, 194, 194, 194, 195, 195, 196, 197, 197, 198, 199, 199, 200, 201, 202, 202, 203, 204, 204, 205, 206, 207, 208, 208, 208, 209, 210, 210, 211, 212, 213, 214, 215, 215, 216, 217, 218, 219, 220, 221, 222, 222, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 234, 235, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 248, 249, 250, 251, 252, 253, 254, 255]
    const curveData3 = [0, 1, 2, 3, 4, 5, 5, 7, 8, 9, 9, 11, 12, 12, 13, 14, 16, 16, 17, 18, 20, 20, 21, 22, 23, 25, 25, 26, 27, 29, 30, 31, 31, 32, 34, 35, 36, 37, 39, 40, 41, 41, 42, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 56, 57, 59, 60, 61, 63, 64, 65, 66, 67, 69, 71, 72, 73, 74, 76, 78, 79, 80, 82, 83, 84, 85, 88, 89, 90, 92, 93, 94, 95, 98, 99, 100, 102, 103, 104, 106, 107, 108, 111, 112, 113, 114, 116, 117, 118, 119, 120, 122, 123, 124, 125, 126, 128, 129, 130, 131, 132, 133, 135, 136, 137, 138, 139, 140, 141, 142, 143, 145, 146, 147, 147, 148, 149, 150, 151, 152, 153, 154, 154, 155, 156, 157, 158, 159, 159, 160, 161, 162, 162, 163, 164, 165, 166, 166, 167, 168, 169, 169, 170, 171, 172, 172, 173, 174, 175, 175, 176, 177, 178, 178, 178, 179, 179, 180, 181, 182, 182, 183, 184, 185, 185, 186, 187, 188, 188, 189, 190, 191, 191, 192, 193, 194, 194, 194, 195, 196, 197, 198, 198, 199, 200, 201, 202, 203, 203, 204, 205, 206, 207, 208, 208, 209, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 222, 223, 224, 225, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 235, 236, 237, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 248, 249, 250, 251, 252, 253, 254, 255]
    const curveData4 = [0, 1, 3, 4, 6, 7, 9, 10, 12, 13, 14, 16, 17, 19, 20, 21, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 43, 44, 45, 47, 48, 49, 51, 52, 53, 54, 55, 57, 58, 59, 60, 62, 63, 64, 65, 66, 67, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 115, 116, 117, 118, 119, 120, 121, 121, 122, 123, 124, 125, 126, 126, 127, 128, 129, 130, 130, 131, 132, 133, 134, 135, 135, 136, 137, 138, 139, 140, 141, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 230, 231, 232, 233, 234, 235, 235, 236, 237, 238, 239, 239, 240, 241, 242, 243, 243, 244, 245, 245, 246, 247, 247, 248, 249, 249, 250, 251, 251, 252, 252, 253, 253, 254, 254, 255]
    const curveData5 = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25, 25, 26, 26, 27, 27, 28, 28, 28, 28, 29, 29, 30, 29, 31, 31, 31, 31, 32, 32, 33, 33, 34, 34, 34, 34, 35, 35, 36, 36, 37, 37, 37, 38, 38, 39, 39, 39, 40, 40, 40, 41, 42, 42, 43, 43, 44, 44, 45, 45, 45, 46, 47, 47, 48, 48, 49, 50, 51, 51, 52, 52, 53, 53, 54, 55, 55, 56, 57, 57, 58, 59, 60, 60, 61, 62, 63, 63, 64, 65, 66, 67, 68, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 100, 101, 103, 104, 105, 107, 108, 110, 111, 113, 115, 116, 118, 119, 120, 122, 123, 125, 127, 128, 130, 132, 134, 135, 137, 139, 141, 143, 144, 146, 148, 150, 152, 154, 156, 158, 160, 163, 165, 167, 169, 171, 173, 175, 178, 180, 182, 185, 187, 189, 192, 194, 197, 199, 201, 204, 206, 209, 211, 214, 216, 219, 221, 224, 226, 229, 232, 234, 236, 239, 241, 245, 247, 250, 252, 255];

    const curveData = new Uint8Array(256 * 2 * 4);
    for (let i = 0; i < 256; i++) {
        curveData[0 + i * 4] = curveData5[i];
        curveData[1 + i * 4] = curveData5[i];
        curveData[2 + i * 4] = curveData5[i];
        curveData[3 + i * 4] = 0xff;
    }

    for (let j = 0; j < 256; j++) {
        curveData[1024 + j * 4] = curveData1[j];
        curveData[1024 + (1 + j * 4)] = curveData2[j];
        curveData[1024 + (2 + j * 4)] = curveData3[j];
        curveData[1024 + (3 + j * 4)] = curveData4[j];
    }
    
    const curveTexture = util.createTexture(gl);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, curveTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, curveData);
    gl.activeTexture(gl.TEXTURE0);

    
    // const testImage = new Image();
    // testImage.src = './maskImg/hudsonbackground.png';
    // testImage.onload = function () {
    //     gl.activeTexture(gl.TEXTURE1);
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, testImage);
    //     gl.activeTexture(gl.TEXTURE0);

    // }

    const texture3Image = new Image();
    const texture3ImageTexture = util.createTexture(gl);
    texture3Image.src = './maskImg/sunset_mask1.jpg';
    texture3Image.onload = function () {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texture3ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture3Image);
        gl.activeTexture(gl.TEXTURE0);
    }

    const texture4Image = new Image();
    const texture4ImageTexture = util.createTexture(gl);
    texture4Image.src = './maskImg/sunset_mask2.jpg';
    texture4Image.onload = function () {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, texture4ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture4Image);
        gl.activeTexture(gl.TEXTURE0);
    }


    function bindMap() {
        
        // gl.activeTexture(gl.TEXTURE1);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, testImage);
        // gl.activeTexture(gl.TEXTURE0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, curveTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, curveData);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texture3ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture3Image);
        
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, texture4ImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture4Image);
        gl.activeTexture(gl.TEXTURE0);

    }


        


    
    return {
        program,
        bindMap
    }
}