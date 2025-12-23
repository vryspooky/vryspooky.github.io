export class Shader {
    constructor(gl, shaderType, content) {
        this.gl = gl;
        this.content = content
        this.shader = this.gl.createShader(shaderType);
        this.gl.shaderSource(this.shader, content);
        this.gl.compileShader(this.shader);
        const success = this.gl.getShaderParameter(this.shader, this.gl.COMPILE_STATUS);
        if(!success) {
            const log = this.gl.getShaderInfoLog(this.shader);
            this.gl.deleteShader(this.shader);
            throw new Error("Failed to compile shader: "+log);
        }
    }
    log() {
        this.content.split('\n').forEach((line, index) => {
            console.log(`${index + 1}: ${line}`);
        });
    }
    delete() {
        this.gl.deleteShader(this.shader);
    }
}

export class Program {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader.shader);
        this.gl.attachShader(this.program, fragmentShader.shader);
        this.gl.linkProgram(this.program);
        const success = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
        if(!success) {
            console.log(this.gl.getProgramInfoLog(this.program));
            this.gl.deleteProgram(this.program);
        }
    }
    setActive() {
        this.gl.useProgram(this.program);
    }
    delete() {
        this.gl.deleteProgram(this.program);
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
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }
    bufferData(values) {
        this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);
    }
    delete() {
        this.gl.deleteBuffer(this.buffer);
    }
}

export class VertexArray {
    constructor(gl) {
        this.gl = gl;
        this.vao = this.gl.createVertexArray();
    }
    setActive() {
        this.gl.bindVertexArray(this.vao);
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
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        if(image) {
            this.setTexture(image);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        this.uniform = new Uniform(gl, program, name, 'int');
        this.uniform.set(binding);
    }
    setImage(image) {
        const gl = this.gl;
        this.setActive();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    setColors(colors, width, height) {
        const gl = this.gl;
        this.setActive();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, colors);
        gl.generateMipmap(gl.TEXTURE_2D);
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
        this.uniform = new Uniform(gl, program, name, 'int');
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

export function createTopFace(arr,i,j,k,x,y,z) { arr.push( i,y,k,  x,y,z,  x,y,k,  i,y,k,  i,y,z,  x,y,z ); }
export function createBottomFace(arr,i,j,k,x,y,z) { arr.push( i,j,k,  x,j,k,  x,j,z,  i,j,k,  x,j,z,  i,j,z ); }
export function createFrontFace(arr,i,j,k,x,y,z) { arr.push( i,j,z,  x,j,z,  x,y,z,  i,j,z,  x,y,z,  i,y,z ); }
export function createBackFace(arr,i,j,k,x,y,z) { arr.push( i,j,k,  x,y,k,  x,j,k,  i,j,k,  i,y,k,  x,y,k ); }
export function createRightFace(arr,i,j,k,x,y,z) { arr.push( x,j,k,  x,y,k,  x,y,z,  x,j,k,  x,y,z,  x,j,z ); }
export function createLeftFace(arr,i,j,k,x,y,z) { arr.push( i,j,k,  i,y,z,  i,y,k,  i,j,k,  i,j,z,  i,y,z ); }
export function createTopFaceTexcoords(arr,i,j,x,y) { arr.push( x,y,  i,j,  i,y,  x,y,  x,j,  i,j ); }
export function createBottomFaceTexcoords(arr,i,j,x,y) { arr.push( x,y,  i,y,  i,j,  x,y,  i,j,  x,j ); }
export function createFrontFaceTexcoords(arr,i,j,x,y) { arr.push( x,y,  i,y,  i,j,  x,y,  i,j,  x,j ); }
export function createBackFaceTexcoords(arr,i,j,x,y) { arr.push( x,y,  i,j,  i,y,  x,y,  x,j,  i,j ); }
export function createRightFaceTexcoords(arr,i,j,x,y) { arr.push( x,y,  x,j,  i,j,  x,y,  i,j,  i,y ); }
export function createLeftFaceTexcoords(arr,i,j,x,y) { arr.push( x,y,  i,j,  x,j,  x,y,  i,y,  i,j ); }
export function createFaceAtlascoords(arr,x,y,w,h) { arr.push( x,y,w,h,  x,y,w,h,  x,y,w,h,  x,y,w,h,  x,y,w,h,  x,y,w,h ); }
export function createQuad(arr,i,j,x,y) { arr.push( i,j,  x,j,  x,y,  i,j,  x,y,  i,y ); }
export function createQuadTexcoords(arr,i,j,x,y) { arr.push( x,y,  i,y,  i,j,  x,y,  i,j,  x,j ); }
