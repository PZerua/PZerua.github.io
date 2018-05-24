class VertexArray {

    constructor() {
        this.vaoId = gl.createVertexArray();
        gl.bindVertexArray(this.vaoId);
    }

    bind() {
        gl.bindVertexArray(this.vaoId);
    }

    unbind() {
        gl.bindVertexArray(null);
    }
}
