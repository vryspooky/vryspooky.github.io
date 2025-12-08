import * as WebGL2 from "WebGL2.js";
import { Mat4 } from "Mat4.js";

    /////////////////////////////////
    // Particle Network Background //
    /////////////////////////////////
    const nodeCount = 200;
    const extendBounds = 100;
    const connectionDistance = 12;
    const canvasPadding = 100;
    const resolution = 1;
    let mouseX = 0;
    let mouseY = 0;

    const canvas = document.querySelector('#canvas1');
    const ctx = canvas.getContext('2d');
    canvas.style.zoom = resolution;
    const canvas2 = document.querySelector('#canvas2');
    const ctx2 = canvas2.getContext('2d');
    canvas2.style.zoom = resolution;
    function resize() {
        canvas.width = Math.floor((window.innerWidth + canvasPadding)/resolution);
        canvas.height = Math.floor((window.innerHeight + canvasPadding)/resolution);
        canvas2.width = Math.floor((window.innerWidth + canvasPadding)/resolution);
        canvas2.height = Math.floor((window.innerHeight + canvasPadding)/resolution);
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX + canvasPadding / 2) / resolution;
        mouseY = (event.clientY + canvasPadding / 2) / resolution;
    });

    class Node {
        static nodes = [];
        static partitions = {};
        static partitionSize = 100;
        constructor() {
            this.setPosition(
                Math.random() * (canvas.width * resolution + extendBounds * 2) - extendBounds,
                Math.random() * (canvas.height * resolution + extendBounds * 2) - extendBounds
            );
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            Node.nodes.push(this);
        }
        setPosition(x, y) {
            this.x = x;
            this.y = y;
            if(this.x < -extendBounds) this.x = canvas.width * resolution + extendBounds;
            if(this.x > canvas.width * resolution + extendBounds) this.x = -extendBounds;
            if(this.y < -extendBounds) this.y = canvas.height * resolution + extendBounds;
            if(this.y > canvas.height * resolution + extendBounds) this.y = -extendBounds;
            const lastPx = this.px;
            const lastPy = this.py;
            this.px = Math.floor(x / Node.partitionSize);
            this.py = Math.floor(y / Node.partitionSize);
            if(this.px !== lastPx || this.py !== lastPy) {
                const lastPartitionKey = `${lastPx},${lastPy}`;
                const newPartitionKey = `${this.px},${this.py}`;
                const lastPartition = Node.partitions[lastPartitionKey];
                if(lastPartition) {
                    const index = lastPartition.indexOf(this);
                    if(index !== -1) {
                        lastPartition.splice(index, 1);
                    }
                }
                if(!Node.partitions[newPartitionKey]) {
                    Node.partitions[newPartitionKey] = [];
                }
                Node.partitions[newPartitionKey].push(this);
            }
        }
        update(deltaTime) {
            this.setPosition(this.x + this.vx * deltaTime * 70, this.y + this.vy * deltaTime * 70);
            let totalDistance = 0;
            for(let dx = -1; dx <= 1; dx++) {
                for(let dy = -1; dy <= 1; dy++) {
                    const partitionKey = `${this.px + dx},${this.py + dy}`;
                    const partition = Node.partitions[partitionKey];
                    if(partition) {
                        partition.forEach(other => {
                            totalDistance += this.updateConnection(other, deltaTime);
                        });
                    }
                }
            }
            totalDistance += this.updateConnection({ x: mouseX * resolution, y: mouseY * resolution }, deltaTime, 4);
            ctx.beginPath();
            ctx.arc(this.x/resolution, this.y/resolution, Math.max(1, 3 / resolution), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.min(totalDistance/2, 0.8)})`;
            ctx.fill();
            ctx.closePath();
        }
        updateConnection(other, deltaTime, multiplier = 1) {
            let totalDistance = 0;
            if(other !== this) {
                const distX = this.x - other.x;
                const distY = this.y - other.y;
                const dist = Math.sqrt(distX * distX + distY * distY) ** 0.5;
                if(dist < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(this.x/resolution, this.y/resolution);
                    ctx.lineTo(other.x/resolution, other.y/resolution);
                    const opacity = (1 - dist / connectionDistance) * multiplier;
                    ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
                    totalDistance += opacity;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                    ctx.closePath();
                }
                if(dist < 5) {
                    this.vx += distX * 0.2 * deltaTime * multiplier;
                    this.vy += distY * 0.2 * deltaTime * multiplier;
                }
                if(Math.sqrt(this.vx * this.vx + this.vy * this.vy) > 1) {
                    this.vx *= 1/(1+deltaTime*0.2);
                    this.vy *= 1/(1+deltaTime*0.2);
                }
            }
            return totalDistance;
        }
    }

    for(let i=0;i<nodeCount;i++) {
        new Node();
    }
    let lastFrameTime = performance.now();
    function update() {
        const now = performance.now();
        const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.1);
        lastFrameTime = now;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Node.nodes.forEach(node => {
            node.update(deltaTime);
        });
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        ctx2.drawImage(canvas, 0, 0);
        requestAnimationFrame(update);
    }
    update();


    /////////////////////////////////
    //      Portfolio Content      //
    /////////////////////////////////
    const contentCanvas = document.querySelector('#content-canvas');
    const gl = contentCanvas.getContext('webgl2');
    const vertexSource = `#version 300 es
        layout(location = 0) in vec3 position;
        layout(location = 1) in vec2 texcoord;
        uniform mat4 u_viewMatrix;
        out vec2 v_texcoord;
        void main() {
            gl_Position = u_viewMatrix * vec4(position, 1.0);
            v_texcoord = texcoord;
        }
    `;
    const fragmentSource = `#version 300 es
        precision highp float;
        in vec2 v_texcoord;
        out vec4 color;
        uniform float u_pixelation;
        uniform sampler2D u_texture;
        void main() {
            vec2 samplecoord = floor(v_texcoord * u_pixelation) / u_pixelation;
            color = texture(u_texture, samplecoord);
            color = mix(color , vec4(0.1,0.12,0.15,1), v_texcoord.y * 0.4);
        }
    `;
    const vertexShader = new WebGL2.Shader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = new WebGL2.Shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = new WebGL2.Program(gl, vertexShader, fragmentShader);
    program.setActive();
    const uViewMatrix = new WebGL2.Uniform(gl, program, 'u_viewMatrix', 'mat4');
    const uPixelation = new WebGL2.Uniform(gl, program, 'u_pixelation', 'float');
    uPixelation.set(1000000);
    const vertexArray = new WebGL2.VertexArray(gl);
    vertexArray.setActive();
    const positionBuffer = new WebGL2.Buffer(gl, 0, 3, gl.FLOAT);
    positionBuffer.setActive();
    vertexArray.enableBuffer(positionBuffer);
    const texcoordBuffer = new WebGL2.Buffer(gl, 1, 2, gl.FLOAT);
    texcoordBuffer.setActive();
    vertexArray.enableBuffer(texcoordBuffer);
    const uTexture = new WebGL2.Texture2D(gl, program, 0, 'u_texture', null);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let vertexCount = 0;
    function renderContent() {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    }
    function resizeContentCanvas() {
        contentCanvas.width = window.innerWidth;
        contentCanvas.height = window.innerHeight;
        gl.viewport(0, 0, contentCanvas.width, contentCanvas.height);
        uViewMatrix.set(Mat4.perspective(Math.PI / 4, contentCanvas.width / contentCanvas.height, 0.1, 100));
        const vertices = [];
        const texcoords = [];
        vertexCount = 0;
        const pushFace = (x0,y0,z0,x1,y1,z1, tx0,ty0,tx1,ty1) => {
            vertices.push(
                x0, y0, z0,
                x1, y0, z1,
                x1, y1, z1,
                x0, y0, z0,
                x1, y1, z1,
                x0, y1, z0,
            );
            texcoords.push(
                tx0, ty1,
                tx1, ty1,
                tx1, ty0,
                tx0, ty1,
                tx1, ty0,
                tx0, ty0,
            )
            vertexCount += 6;
        }
        let lean = Math.max(0.6, Math.min(contentCanvas.width / contentCanvas.height / 1.2, 1.5));
        pushFace(
            -2 * lean,
            -1.5,
            -5,
            -0.25 * lean, 
            1.5,
            -10 + 2 * lean,
            0, 0, 0.5, 1,
        );
        pushFace(
            0.25 * lean,
            -1.5,
            -10 + 2 * lean,
            2 * lean, 
            1.5,
            -5,
            0.5, 0, 1, 1,
        );
        positionBuffer.setActive();
        positionBuffer.bufferData(new Float32Array(vertices));
        texcoordBuffer.setActive();
        texcoordBuffer.bufferData(new Float32Array(texcoords));
        renderContent();
    }
    window.addEventListener('resize', resizeContentCanvas);

    const contentCanvas2 = document.createElement('canvas');
    const contentCtx2 = contentCanvas2.getContext('2d');
    const width = 2000;
    const height = 1000;
    contentCanvas2.width = width;
    contentCanvas2.height = height;
    contentCtx2.fillStyle = 'rgba(220,226,242,1)';
    contentCtx2.fillRect(0,0, width, height);
    contentCtx2.fillStyle = 'rgba(0,0,0,0.1)';
    contentCtx2.fillRect(0,0, width, 5);
    contentCtx2.fillRect(0,height-5, width, 5);
    contentCtx2.fillRect(0,0, 5, height);
    contentCtx2.fillRect(width-5,0, 5, height);
    contentCtx2.fillRect(width/2,0, 5, height);
    contentCtx2.fillRect(width/2-5,0, 5, height);
    contentCtx2.fillStyle = 'rgba(0,0,0,0.8)';
    contentCtx2.font = '800 70px "Montserrat", sans-serif';
    contentCtx2.textAlign = 'center';
    contentCtx2.fillText('Spookier', width * 1/4, 105);
    contentCtx2.fillText('Past Work', width * 3/4, 105);
    contentCtx2.fillRect(100, 150, width/2 - 200, 5);
    contentCtx2.fillRect(width/2 + 100, 150, width/2 - 200, 5);

    uTexture.setImage(contentCanvas2);

    resizeContentCanvas();

    let pixelation = 1;
    function updateContent() {
        pixelation += (10000 - pixelation) * 0.00001;
        if(pixelation > 10) pixelation += 0.5;
        if(pixelation > 100) pixelation += 2;
        if(pixelation > 200) pixelation += 5;
        if(pixelation > 1000) pixelation = 100000;
        uPixelation.set(pixelation);
        renderContent();
        if(pixelation > 1000) return;
        requestAnimationFrame(updateContent);
    }
    updateContent();
