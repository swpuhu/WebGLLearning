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

    void main()
    {
        highp vec4 textureColor;
        highp vec4 textureColorRes;
        highp float satVal = 65.0 / 100.0;

        float xCoordinate = textureCoordinate.x;
        float yCoordinate = textureCoordinate.y;

        highp float redCurveValue;
        highp float greenCurveValue;
        highp float blueCurveValue;

        textureColor = texture2D( inputImageTexture, vec2(xCoordinate, yCoordinate));
        textureColorRes = textureColor;
        highp vec4 curveColor = texture2D(inputImageTexture2, vec2(xCoordinate, yCoordinate));

        redCurveValue = texture2D(inputImageTexture2, vec2(textureColor.r, 0.0)).r;
        greenCurveValue = texture2D(inputImageTexture2, vec2(textureColor.g, 0.0)).g;
        blueCurveValue = texture2D(inputImageTexture2, vec2(textureColor.b, 0.0)).b;

        highp float G = (redCurveValue + greenCurveValue + blueCurveValue);
        G = G / 3.0;

        redCurveValue = ((1.0 - satVal) * G + satVal * redCurveValue);
        greenCurveValue = ((1.0 - satVal) * G + satVal * greenCurveValue);
        blueCurveValue = ((1.0 - satVal) * G + satVal * blueCurveValue);
        redCurveValue = (((redCurveValue) > (1.0)) ? (1.0) : (((redCurveValue) < (0.0)) ? (0.0) : (redCurveValue)));
        greenCurveValue = (((greenCurveValue) > (1.0)) ? (1.0) : (((greenCurveValue) < (0.0)) ? (0.0) : (greenCurveValue)));
        blueCurveValue = (((blueCurveValue) > (1.0)) ? (1.0) : (((blueCurveValue) < (0.0)) ? (0.0) : (blueCurveValue)));

        redCurveValue = texture2D(inputImageTexture2, vec2(redCurveValue, 0.0)).a;
        greenCurveValue = texture2D(inputImageTexture2, vec2(greenCurveValue, 0.0)).a;
        blueCurveValue = texture2D(inputImageTexture2, vec2(blueCurveValue, 0.0)).a;

        highp vec4 base = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);
        highp vec4 overlayer = vec4(250.0/255.0, 227.0/255.0, 193.0/255.0, 1.0);

        textureColor = overlayer * base;
        base = (textureColor - base) * 0.850980 + base;
        textureColor = base;

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

    
    const curveData1 = [0, 1, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 8, 9, 10, 11, 11, 12, 13, 14, 15, 15, 16, 17, 18, 19, 20, 21, 22, 23, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 48, 49, 50, 51, 52, 53, 55, 56, 57, 58, 59, 61, 62, 63, 64, 66, 67, 68, 69, 71, 72, 73, 74, 76, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89, 90, 91, 93, 94, 95, 96, 98, 99, 100, 102, 103, 104, 106, 107, 108, 110, 111, 112, 114, 115, 116, 118, 119, 120, 122, 123, 124, 126, 127, 128, 130, 131, 132, 134, 135, 136, 137, 139, 140, 141, 143, 144, 145, 146, 148, 149, 150, 152, 153, 154, 155, 157, 158, 159, 160, 161, 163, 164, 165, 166, 168, 169, 170, 171, 172, 173, 175, 176, 177, 178, 179, 180, 181, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 211, 212, 213, 214, 215, 216, 216, 217, 218, 219, 220, 220, 221, 222, 223, 223, 224, 225, 226, 226, 227, 228, 228, 229, 230, 230, 231, 232, 232, 233, 234, 234, 235, 236, 236, 237, 238, 238, 239, 239, 240, 241, 241, 242, 242, 243, 244, 244, 245, 245, 246, 247, 247, 248, 248, 249, 249, 250, 251, 251, 252, 252, 253, 253, 254, 254, 255]
    const curveData2 = [15, 15, 16, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26, 27, 28, 29, 30, 31, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 43, 44, 45, 46, 48, 49, 50, 51, 52, 53, 55, 56, 57, 57, 58, 59, 61, 62, 63, 64, 66, 67, 68, 69, 71, 72, 72, 73, 74, 76, 77, 78, 79, 81, 82, 83, 85, 86, 87, 87, 89, 90, 91, 93, 94, 95, 96, 98, 99, 100, 102, 102, 103, 104, 106, 107, 108, 110, 111, 112, 114, 115, 116, 118, 118, 119, 120, 122, 123, 124, 126, 127, 128, 130, 131, 132, 134, 134, 135, 136, 137, 139, 140, 141, 143, 144, 145, 146, 148, 149, 149, 150, 152, 153, 154, 155, 157, 158, 159, 160, 161, 163, 163, 164, 165, 166, 168, 169, 170, 171, 172, 173, 175, 176, 177, 177, 178, 179, 180, 181, 183, 184, 185, 186, 187, 188, 189, 190, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 211, 212, 212, 213, 214, 215, 216, 216, 217, 218, 219, 220, 220, 221, 222, 222, 223, 223, 224, 225, 226, 226, 227, 228, 228, 229, 230, 230, 230, 231, 232, 232, 233, 234, 234, 235, 236, 236, 237, 238, 238, 238, 239, 239, 240, 241, 241, 242, 242, 243, 244, 244, 245, 245, 245, 246, 247, 247, 248, 248, 249, 249, 250, 251, 251, 252, 252, 252, 253, 253, 254, 254, 255]
    const curveData3 = [87, 89, 89, 90, 90, 91, 91, 93, 93, 94, 95, 95, 96, 96, 98, 98, 99, 100, 100, 102, 102, 103, 103, 104, 104, 106, 107, 107, 108, 108, 110, 110, 111, 112, 112, 114, 114, 115, 115, 116, 118, 118, 119, 119, 120, 120, 122, 123, 123, 124, 124, 126, 126, 127, 128, 128, 130, 130, 131, 131, 132, 134, 134, 135, 135, 136, 136, 137, 139, 139, 140, 140, 141, 143, 143, 144, 144, 145, 146, 146, 148, 148, 149, 150, 150, 152, 152, 153, 154, 154, 155, 155, 157, 158, 158, 159, 159, 160, 161, 161, 163, 163, 164, 165, 165, 166, 168, 168, 169, 169, 170, 171, 171, 172, 173, 173, 175, 175, 176, 177, 177, 178, 179, 179, 180, 181, 181, 183, 183, 184, 185, 185, 186, 187, 187, 188, 189, 189, 190, 191, 191, 192, 193, 193, 194, 195, 195, 196, 197, 197, 198, 199, 199, 200, 201, 201, 202, 203, 204, 204, 205, 206, 206, 207, 208, 208, 209, 210, 211, 211, 211, 212, 212, 213, 214, 215, 215, 216, 216, 217, 217, 218, 219, 219, 220, 220, 221, 221, 222, 223, 223, 223, 224, 225, 226, 226, 226, 227, 228, 228, 228, 229, 230, 230, 230, 231, 232, 232, 232, 233, 234, 234, 235, 235, 236, 236, 237, 238, 238, 238, 239, 239, 240, 240, 241, 241, 242, 242, 242, 243, 244, 244, 244, 245, 245, 246, 247, 247, 247, 248, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 253, 254, 254, 254, 255]
    const curveData4 = [0, 1, 1, 2, 3, 4, 4, 5, 6, 7, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 24, 24, 25, 26, 27, 28, 29, 29, 30, 31, 32, 33, 34, 35, 36, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 64, 65, 66, 67, 68, 69, 70, 72, 73, 74, 75, 76, 78, 79, 80, 81, 83, 84, 85, 86, 88, 89, 90, 91, 93, 94, 95, 97, 98, 99, 101, 102, 103, 105, 106, 107, 109, 110, 111, 113, 114, 115, 117, 118, 119, 121, 122, 123, 125, 126, 127, 129, 130, 131, 133, 134, 136, 137, 138, 140, 141, 142, 144, 145, 146, 148, 149, 150, 152, 153, 154, 156, 157, 158, 159, 161, 162, 163, 165, 166, 167, 168, 170, 171, 172, 173, 175, 176, 177, 178, 180, 181, 182, 183, 184, 186, 187, 188, 189, 190, 191, 192, 193, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 213, 214, 215, 216, 217, 218, 219, 219, 220, 221, 222, 223, 223, 224, 225, 226, 227, 227, 228, 229, 230, 230, 231, 232, 232, 233, 234, 234, 235, 236, 236, 237, 238, 238, 239, 240, 240, 241, 242, 242, 243, 244, 244, 245, 245, 246, 247, 247, 248, 248, 249, 250, 250, 251, 251, 252, 253, 253, 254, 254, 255]

    const curveData5 = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25, 25, 26, 26, 27, 27, 28, 28, 28, 28, 29, 29, 30, 29, 31, 31, 31, 31, 32, 32, 33, 33, 34, 34, 34, 34, 35, 35, 36, 36, 37, 37, 37, 38, 38, 39, 39, 39, 40, 40, 40, 41, 42, 42, 43, 43, 44, 44, 45, 45, 45, 46, 47, 47, 48, 48, 49, 50, 51, 51, 52, 52, 53, 53, 54, 55, 55, 56, 57, 57, 58, 59, 60, 60, 61, 62, 63, 63, 64, 65, 66, 67, 68, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 100, 101, 103, 104, 105, 107, 108, 110, 111, 113, 115, 116, 118, 119, 120, 122, 123, 125, 127, 128, 130, 132, 134, 135, 137, 139, 141, 143, 144, 146, 148, 150, 152, 154, 156, 158, 160, 163, 165, 167, 169, 171, 173, 175, 178, 180, 182, 185, 187, 189, 192, 194, 197, 199, 201, 204, 206, 209, 211, 214, 216, 219, 221, 224, 226, 229, 232, 234, 236, 239, 241, 245, 247, 250, 252, 255];

    const curveData = new Uint8Array(256 * 2 * 4);
    for (let i = 0; i < 256; i++) {
        curveData[0 + i * 4] = curveData5[i];
        curveData[1 + i * 4] = curveData5[i];
        curveData[2 + i * 4] = curveData5[i];
        curveData[3 + i * 4] = 0xff
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

    function bindMap() {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, curveTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, curveData);
        gl.activeTexture(gl.TEXTURE0);

    }

    
    return {
        program,
        bindMap
    }
}