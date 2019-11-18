import util from '../util.js';


let width = 640;
let height = 360;
let canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
const vertexShader = `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        v_texCoord = a_texCoord;
    }
`

const fragmentShader = `#version 300 es
    #define TERMINAL -10000.0
    precision mediump float;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform float u_points[50];
    uniform vec2 u_resolution;
    out vec4 out_color;

    float getDistance(vec2 A, vec2 B, vec2 pos) {
        if (A.x == B.x) {
            return pos.x - A.x;
        }
        float k = (B.y - A.y) / (B.x - A.x);
        float b = B.y - k * B.x;        
        return (k * pos.x - pos.y + b) / sqrt(k * k + 1.);
    }

    vec2 getMinDistance(float array[6], float x, float y) {
        float number = 6.;
        float minDistance;
        float isIn = -1.0;
        for (float i = 0.; i < number; i += 2.) {
            int index = int(mod(i, number));
            int nextIndex = int(mod(i + 2.0, number));
            float x1 = array[index];
            float y1 = array[index + 1];
            float x2 = array[nextIndex];
            float y2 = array[nextIndex + 1];
            float d = getDistance(vec2(x1, y1), vec2(x2, y2), vec2(x, y));
            float d2 = distance(vec2(x1, y1), vec2(x, y));
            d = min(abs(d), d2);
            if (i == 0.0) {
                minDistance = abs(d);
            } else {
                if (abs(d) < minDistance) {
                    minDistance = abs(d);
                }
            }

            if (((y2 > y) != (y1 > y)) && 
                (x < (x1 - x2) * (y - y2) / (y1 - y2) + x2)) {
                    isIn *= -1.0;
                }
            
        }
        if (isIn < 0.) {
            isIn = 0.0;
        }
        return vec2(isIn, minDistance);
    }

    void main () {
        vec2 pos = gl_FragCoord.xy;
        int number = 0;
        for (int i = 0; i < 50; i++) {
            if (u_points[i] == TERMINAL) {
                number = i;
                break;
            }
        }
        vec2 d = vec2(0.0, 0.0);
        float arr[6];
        for (int i = 0; i < number; i += 6) {
            arr[0] = u_points[i];
            arr[1] = u_points[i + 1];
            arr[2] = u_points[i + 2];
            arr[3] = u_points[i + 3];
            arr[4] = u_points[i + 4];
            arr[5] = u_points[i + 5];
            vec2 _d = getMinDistance(arr, pos.x, pos.y);
            if (_d.x > 0.0) {
                d = _d;
            }
        }
        // vec2 d = getMinDistance(u_points, pos.x, pos.y);
        
        float dist = smoothstep(0.0, 2.0, abs(d[1]));
        vec3 color = dist * vec3(0.0, 0.5, 1.0);
        // if (d[0] <= 0.0) {
        //     color = vec3(0.0, 0.0, 0.0);
        // }
        out_color = vec4(color, 1.0);
        
    }
`
let scale = 1;
let points = new Float32Array([
    0, 0,
    width / scale, 0,
    width / scale, height / scale,
    width / scale, height / scale,
    0, height /scale,
    0, 0
]);

const f32size = Float32Array.BYTES_PER_ELEMENT;
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let program = util.initWebGL(gl, vertexShader, fragmentShader);
gl.useProgram(program);

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
let a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 2 * f32size, 0);

const u_projection = gl.getUniformLocation(program, 'u_projection');
const projectionMat = util.createProjection(width, height, 1);
gl.uniformMatrix4fv(u_projection, false, projectionMat);

const u_resolution = gl.getUniformLocation(program, 'u_resolution');
gl.uniform2f(u_resolution, width, height);

let u_points = gl.getUniformLocation(program, 'u_points');
let clipPath = [
    width / 4, height / 4,
    width / 2, height / 2,
    width / 4 * 3, height / 4,
    
    width / 4, height / 4,
    0, height / 2,
    width / 4 * 3, height / 4,
    // width / 4 * 3, 0,
    // 0, 0,
    -10000.0
];
gl.uniform1fv(u_points, clipPath);
gl.drawArrays(gl.TRIANGLES, 0, 6);