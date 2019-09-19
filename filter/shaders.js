const colorOffset = {
    vertexShader: `#version 300 es
        in vec4 a_position;
        in vec2 a_texCoord;
        out vec2 v_texCoord;
        uniform mat4 u_projection;
        void main () {
            gl_Position = u_projection * a_position;
            v_texCoord = a_texCoord;
        }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    out vec4 out_color;
    in vec2 v_texCoord;
    uniform vec2 u_resolution;
    uniform float u_offset[2];
    uniform sampler2D u_texture;
    void main () {
        float offsetX = u_offset[0];
        float offsetY = u_offset[1];
        vec2 one_pixel = 1.0 / u_resolution;
        vec2 offsetCoord = one_pixel * vec2(offsetX, offsetY);
        vec4 maskR = texture(u_texture, v_texCoord - offsetCoord);
        vec4 maskG = texture(u_texture, v_texCoord + offsetCoord);
        vec4 color = texture(u_texture, v_texCoord);
        out_color = vec4(maskR.r, maskG.g, color.b, color.a);
    }
    `
};


const negative = {
    vertexShader: `#version 300 es
        in vec4 a_position;
        in vec2 a_texCoord;
        out vec2 v_texCoord;
        uniform mat4 u_projection;
        void main () {
            gl_Position = u_projection * a_position;
            v_texCoord = a_texCoord;
        }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    out vec4 out_color;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main () {
        vec4 color = texture(u_texture, v_texCoord);
        out_color = vec4(1.0 - color.rgb, color.a);
        // out_color = vec4(1.0, 1.0, 0.0, 1.0);
    }
    `
}


const antique = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 textureCoordinate;
    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        textureCoordinate = a_texCoord;
    }

    `,
    fragmentShader: `#version 300 es
    
    in highp vec2 textureCoordinate;

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
    }
    `
}


const sketch = {
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
        // gl_FragColor = oralColor;
    }
    `
}

const beautify = {
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
    precision mediump float;

    varying mediump vec2 textureCoordinate;

    uniform sampler2D inputImageTexture;
    uniform vec2 singleStepOffset;
    uniform mediump float params;

    const highp vec3 W = vec3(0.299,0.587,0.114);
    vec2 blurCoordinates[20];

    float hardLight(float color)
    {
        if(color <= 0.5)
            color = color * color * 2.0;
        else
            color = 1.0 - ((1.0 - color)*(1.0 - color) * 2.0);
        return color;
    }

    void main(){

        vec3 centralColor = texture2D(inputImageTexture, textureCoordinate).rgb;
        blurCoordinates[0] = textureCoordinate.xy + singleStepOffset * vec2(0.0, -10.0);
        blurCoordinates[1] = textureCoordinate.xy + singleStepOffset * vec2(0.0, 10.0);
        blurCoordinates[2] = textureCoordinate.xy + singleStepOffset * vec2(-10.0, 0.0);
        blurCoordinates[3] = textureCoordinate.xy + singleStepOffset * vec2(10.0, 0.0);
        blurCoordinates[4] = textureCoordinate.xy + singleStepOffset * vec2(5.0, -8.0);
        blurCoordinates[5] = textureCoordinate.xy + singleStepOffset * vec2(5.0, 8.0);
        blurCoordinates[6] = textureCoordinate.xy + singleStepOffset * vec2(-5.0, 8.0);
        blurCoordinates[7] = textureCoordinate.xy + singleStepOffset * vec2(-5.0, -8.0);
        blurCoordinates[8] = textureCoordinate.xy + singleStepOffset * vec2(8.0, -5.0);
        blurCoordinates[9] = textureCoordinate.xy + singleStepOffset * vec2(8.0, 5.0);
        blurCoordinates[10] = textureCoordinate.xy + singleStepOffset * vec2(-8.0, 5.0);
        blurCoordinates[11] = textureCoordinate.xy + singleStepOffset * vec2(-8.0, -5.0);
        blurCoordinates[12] = textureCoordinate.xy + singleStepOffset * vec2(0.0, -6.0);
        blurCoordinates[13] = textureCoordinate.xy + singleStepOffset * vec2(0.0, 6.0);
        blurCoordinates[14] = textureCoordinate.xy + singleStepOffset * vec2(6.0, 0.0);
        blurCoordinates[15] = textureCoordinate.xy + singleStepOffset * vec2(-6.0, 0.0);
        blurCoordinates[16] = textureCoordinate.xy + singleStepOffset * vec2(-4.0, -4.0);
        blurCoordinates[17] = textureCoordinate.xy + singleStepOffset * vec2(-4.0, 4.0);
        blurCoordinates[18] = textureCoordinate.xy + singleStepOffset * vec2(4.0, -4.0);
        blurCoordinates[19] = textureCoordinate.xy + singleStepOffset * vec2(4.0, 4.0);

        float sampleColor = centralColor.g * 20.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[0]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[1]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[2]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[3]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[4]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[5]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[6]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[7]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[8]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[9]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[10]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[11]).g;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[12]).g * 2.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[13]).g * 2.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[14]).g * 2.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[15]).g * 2.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[16]).g * 2.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[17]).g * 2.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[18]).g * 2.0;
        sampleColor += texture2D(inputImageTexture, blurCoordinates[19]).g * 2.0;

        sampleColor = sampleColor / 48.0;

        float highPass = centralColor.g - sampleColor + 0.5;

        for(int i = 0; i < 5;i++)
        {
            highPass = hardLight(highPass);
        }
        float luminance = dot(centralColor, W);

        float alpha = pow(luminance, params);

        vec3 smoothColor = centralColor + (centralColor-vec3(highPass))*alpha*0.1;

        gl_FragColor = vec4(mix(smoothColor.rgb, max(smoothColor, centralColor), alpha), 1.0);
        // gl_FragColor = vec4(centralColor, 1.0);
    }
    `
}
export {
    colorOffset, negative, sketch, antique, beautify
}