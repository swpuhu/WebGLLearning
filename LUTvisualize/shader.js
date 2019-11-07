const shaders = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    uniform mat4 u_perspective, u_camera, u_translate;
    void main () {
        gl_Position = u_perspective * inverse(u_camera) * a_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    out vec4 out_color;
    void main () {
        
        out_color = texture(u_texture, v_texCoord); 
        // out_color = vec4(1.0, 1.0, 0.0, 1.0);
    }
    `
}

export default shaders;