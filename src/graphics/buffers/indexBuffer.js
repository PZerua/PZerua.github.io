class IndexBuffer {

    constructor(data, drawType) {
        this.eboId = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eboId);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, drawType);
    }

    bind() {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eboId);
    }

    unbind() {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}
