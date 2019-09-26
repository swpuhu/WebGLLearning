    import util from '../util.js';
    const shader = {
        vertexShader: `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;

    uniform vec3 u_size;
    uniform mat4 u_rotateX;
    uniform mat4 u_rotateY;
    uniform mat4 u_rotateZ;
    uniform mat4 u_translate;
    uniform mat4 u_perspective;
    void main () {
        vec4 mid_position = u_perspective * u_translate * u_rotateX * u_rotateY * u_rotateZ * a_position;
        // mid_position = vec4(mid_position.xy / u_size.xy * 2.0 - 1.0, mid_position.z, 1.0);
        // mid_position.z = mid_position.z / u_size.z * 2.0;
        // float divisor = 1.0 + mid_position.z * 2.;
        // mid_position.xy = mid_position.xy / divisor;
        gl_Position = mid_position;
        v_color = a_color;
    }
    `,
        fragmentShader: `
    precision mediump float;
    varying vec4 v_color;
    void main () {
        gl_FragColor = v_color;
        // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
    
    `
    }
    const width = 640;
    const height = 360;
    const near = 200;
    const far = 2000;
    const canvas = document.createElement('canvas');
    canvas.style.border = `1px solid #ccc`;
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    let translateX = util.createEditor('translateX', 'range', -canvas.width, canvas.width, 0, 1);
    let translateY = util.createEditor('translateY', 'range', -canvas.height, canvas.height, 0, 1);
    let translateZ = util.createEditor('translateZ', 'range', 0, far - near, 0, 1);
    let rotateX = util.createEditor('rotateX', 'range', 0, 360, 0, 1);
    let rotateY = util.createEditor('rotateY', 'range', 0, 360, 0, 1);
    let rotateZ = util.createEditor('rotateZ', 'range', 0, 360, 0, 1);

    document.body.appendChild(translateX.ref);
    document.body.appendChild(translateY.ref);
    document.body.appendChild(translateZ.ref);

    document.body.appendChild(rotateX.ref);
    document.body.appendChild(rotateY.ref);
    document.body.appendChild(rotateZ.ref);




    const gl = canvas.getContext('webgl2');
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    let l, w, d;
    l = w = d = 300;
    

    const points = new Float32Array([
        -l / 2, -l / 2, near, 1.0, 1.0, 0.0,
        l / 2, -l / 2, near, 1.0, 1.0, 0.0,
        l / 2, l / 2, near, 1.0, 1.0, 0.0,
        l / 2, l / 2, near, 1.0, 1.0, 0.0,
        -l / 2, l / 2, near, 1.0, 1.0, 0.0,
        -l / 2, -l / 2, near, 1.0, 1.0, 0.0,


        -l / 2, -l / 2, near + d, 1.0, 0.2, 0.0,
        l / 2, l / 2, near + d, 1.0, 0.2, 0.0,
        l / 2, -l / 2, near + d, 1.0, 0.2, 0.0,
        -l / 2, l / 2, near + d, 1.0, 0.2, 0.0,
        l / 2, l / 2, near + d, 1.0, 0.2, 0.0,
        -l / 2, -l / 2, near + d, 1.0, 0.2, 0.0,

        -l / 2, -l / 2, near, 0.0, 1.0, 1.0,
        -l / 2, l / 2, near, 0.0, 1.0, 1.0,
        -l / 2, -l / 2, near + d, 0.0, 1.0, 1.0,
        -l / 2, -l / 2, near + d, 0.0, 1.0, 1.0,
        -l / 2, l / 2, near, 0.0, 1.0, 1.0,
        -l / 2, l / 2, near + d, 0.0, 1.0, 1.0,

        l / 2, -l / 2, near, 0.0, 0.5, 0.8,
        l / 2, -l / 2, near + d, 0.0, 0.5, 0.8,
        l / 2, l / 2, near, 0.0, 0.5, 0.8,
        l / 2, l / 2, near, 0.0, 0.5, 0.8,
        l / 2, -l / 2, near + d, 0.0, 0.5, 0.8,
        l / 2, l / 2, near + d, 0.0, 0.5, 0.8,

        -l / 2, l / 2, near, 0.2, 0.5, 0.6,
        l / 2, l / 2, near, 0.2, 0.5, 0.6,
        -l / 2, l / 2, near + d, 0.2, 0.5, 0.6,
        -l / 2, l / 2, near + d, 0.2, 0.5, 0.6,
        l / 2, l / 2, near, 0.2, 0.5, 0.6,
        l / 2, l / 2, near + d, 0.2, 0.5, 0.6,

        -l / 2, -l / 2, near, 0.5, 0.5, 0.8,
        -l / 2, -l / 2, near + d, 0.5, 0.5, 0.8,
        l / 2, -l / 2, near, 0.5, 0.5, 0.8,
        l / 2, -l / 2, near, 0.5, 0.5, 0.8,
        -l / 2, -l / 2, near + d, 0.5, 0.5, 0.8,
        l / 2, -l / 2, near + d, 0.5, 0.5, 0.8,



    ]);
    const f32size = Float32Array.BYTES_PER_ELEMENT;

    let program = util.initWebGL(gl, shader.vertexShader, shader.fragmentShader);
    gl.useProgram(program);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, f32size * 6, 0);

    const u_size = gl.getUniformLocation(program, 'u_size');
    gl.uniform3f(u_size, width, height, 1000);

    const a_color = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(a_color);
    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, f32size * 6, f32size * 3);

    const u_rotateX = gl.getUniformLocation(program, 'u_rotateX');
    let rotateXMat = util.createRotateMatrix({
        x: 0,
        y: 0,
        z: 0
    }, 0, 'x');
    gl.uniformMatrix4fv(u_rotateX, false, rotateXMat);

    const u_rotateY = gl.getUniformLocation(program, 'u_rotateY');
    let rotateYMat = util.createRotateMatrix({
        x: 0,
        y: 0,
        z: 0
    }, 0, 'y');
    gl.uniformMatrix4fv(u_rotateY, false, rotateYMat);

    const u_rotateZ = gl.getUniformLocation(program, 'u_rotateZ');
    let rotateZMat = util.createRotateMatrix({
        x: 0,
        y: 0,
        z: 0
    }, 0, 'z');
    gl.uniformMatrix4fv(u_rotateZ, false, rotateZMat);

    
    const u_translate = gl.getUniformLocation(program, 'u_translate');
    let translateMat = util.createTranslateMatrix(0, 0, 120);
    gl.uniformMatrix4fv(u_translate, false, translateMat);


    const u_perspective = gl.getUniformLocation(program, 'u_perspective');
    let perspectiveMat = util.createPerspective(2, width / height, 200, 1000, -canvas.width / 2, canvas.width / 2, canvas.height / 2, -canvas.height / 2);
    gl.uniformMatrix4fv(u_perspective, false, perspectiveMat);

    function updateTranslate () {
        translateMat = util.createTranslateMatrix(translateX.value, translateY.value, translateZ.value);
        gl.uniformMatrix4fv(u_translate, false, translateMat);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
    translateX.oninput = updateTranslate;
    translateY.oninput = updateTranslate;
    translateZ.oninput = updateTranslate;

    rotateX.oninput = function () {
        let rotateXMat = util.createRotateMatrix({
            x: 0,
            y: 0,
            z: 350
        }, this.value, 'x');
        gl.uniformMatrix4fv(u_rotateX, false, rotateXMat);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    

    rotateY.oninput = function () {
        let rotateYMat = util.createRotateMatrix({
            x: 0,
            y: 0,
            z: 350
        }, this.value, 'y');
        gl.uniformMatrix4fv(u_rotateY, false, rotateYMat);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    

    rotateZ.oninput = function () {
        let rotateZMat = util.createRotateMatrix({
            x: 0,
            y: 0,
            z: 350
        }, this.value, 'z');
        gl.uniformMatrix4fv(u_rotateZ, false, rotateZMat);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }


    gl.drawArrays(gl.TRIANGLES, 0, 36);


    let valueX = 0;
    let valueY = 0;
    let valueZ = 0;
    let velocity = 1;
    function animate() {
        valueX += velocity;
        valueY += velocity / 2
        valueZ += velocity / 3;
        let rotateXMat = util.createRotateMatrix({
            x: 0,
            y: 0,
            z: 350
        }, valueX, 'x');
        let rotateYMat = util.createRotateMatrix({
            x: 0,
            y: 0,
            z: 350
        }, valueY, 'y');
        let rotateZMat = util.createRotateMatrix({
            x: 0,
            y: 0,
            z: 350
        }, valueZ, 'z');
        gl.uniformMatrix4fv(u_rotateX, false, rotateXMat);
        gl.uniformMatrix4fv(u_rotateY, false, rotateYMat);
        gl.uniformMatrix4fv(u_rotateZ, false, rotateZMat);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        requestAnimationFrame(animate);
    }

    animate();