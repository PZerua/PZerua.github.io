class VertexBuffer {

    constructor(data, drawType) {
        this.vboId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);
        gl.bufferData(gl.ARRAY_BUFFER, data, drawType);
    }

    bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboId);
    }

    unbind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
