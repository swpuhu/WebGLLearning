const test = `
    attribute vec4 a_position;
    uniform mat4 u_projection;
    void main () {
        gl_Position = a_position;
    }

`


class Token {
    constructor (type, value) {
        this.type = type;
        this.value = value;
    }
}
