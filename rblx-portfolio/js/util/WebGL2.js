export class Shader {
    constructor(gl, shaderType, content) {
        this.gl = gl;
        this.content = content
        this.shader = gl.createShader(shaderType);
        gl.shaderSource(this.shader, content);
        gl.compileShader(this.shader);
        const success = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);
        if(!success) {
            console.log(gl.getShaderInfoLog(this.shader));
            gl.deleteShader(this.shader);
        }
    }
    log() {
        this.content.split('\n').forEach((line, index) => {
            console.log(`${index + 1}: ${line}`);
        });
    }
    delete() {
        const gl = this.gl;
        gl.deleteShader(this.shader);
    }
}

export class Program {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader.shader);
        gl.attachShader(this.program, fragmentShader.shader);
        gl.linkProgram(this.program);
        const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
        if(!success) {
            console.log(gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
        }
    }
    setActive() {
        const gl = this.gl;
        gl.useProgram(this.program);
    }
    delete() {
        const gl = this.gl;
        gl.deleteProgram(this.program);
    }
}

export class Buffer {
    constructor(gl, location, dimensions, bufferType) {
        this.gl = gl;
        this.location = location;
        this.dimensions = dimensions;
        this.type = bufferType;
        this.buffer = gl.createBuffer();
    }
    setActive() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    }
    bufferData(values) {
        const gl = this.gl;
        gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
    }
    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.buffer);
    }
}

export class VertexArray {
    constructor(gl) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
    }
    setActive() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
    };
    enableBuffer(buffer) {
        const gl = this.gl;
        buffer.setActive();
        gl.enableVertexAttribArray(buffer.location);
        if(buffer.type == gl.FLOAT) {
            gl.vertexAttribPointer(buffer.location, buffer.dimensions, buffer.type, false, 0, 0);
        } else {
            gl.vertexAttribIPointer(buffer.location, buffer.dimensions, buffer.type, false, 0, 0);
        }
    }
    delete() {
        const gl = this.gl;
        gl.deleteVertexArray(this.vao);
    }
}

export class Uniform {
    constructor(gl, program, name, type) {
        this.gl = gl;
        this.name = name;
        this.type = type;
        this.location = gl.getUniformLocation(program.program, name);
    }
    set(...values) {
        const gl = this.gl;
        switch(this.type) {
            case 'int': gl.uniform1i(this.location, values[0]); break;
            case 'float': gl.uniform1f(this.location, values[0]); break;
            case 'vec2': gl.uniform2f(this.location, values[0], values[1]); break;
            case 'vec3': gl.uniform3f(this.location, values[0], values[1], values[2]); break;
            case 'vec4': gl.uniform4f(this.location, values[0], values[1], values[2], values[3]); break;
            case 'ivec2': gl.uniform2i(this.location, values[0], values[1]); break;
            case 'ivec3': gl.uniform3i(this.location, values[0], values[1], values[2]); break;
            case 'ivec4': gl.uniform4i(this.location, values[0], values[1], values[2], values[3]); break;
            case 'mat4': gl.uniformMatrix4fv(this.location, false, values[0].arr); break;
        }
    }
}

export class Texture2D {
    constructor(gl, program, binding, name, image) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.binding = binding;
        this.setActive();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        this.uniform = new ShaderUniform(gl, program, name, 'int');
        this.uniform.set(binding);
    }
    setActive() {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + this.binding);
    }
    delete() {
        const gl = this.gl;
        gl.deleteTexture(this.texture);
    }
}

export class Texture3D {
    constructor(gl, program, binding, name, width, height, depth, data) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.texture = gl.createTexture();
        this.binding = binding;
        this.setActive();
        gl.bindTexture(gl.TEXTURE_3D, this.texture);
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA, width, height, depth, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        this.uniform = new ShaderUniform(gl, program, name, 'int');
        this.uniform.set(binding);
    }
    setActive() {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + this.binding);
    }
    update(x0,y0,z0,w,h,d,data) {
        const gl = this.gl;
        this.setActive();
        gl.bindTexture(gl.TEXTURE_3D, this.texture);
        gl.texSubImage3D(gl.TEXTURE_3D, 0, x0, y0, z0, w, h, d, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    delete() {
        const gl = this.gl;
        gl.deleteTexture(this.texture);
    }
}
