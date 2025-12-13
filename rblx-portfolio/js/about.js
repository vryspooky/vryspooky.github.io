import * as WebGL2 from "./util/WebGL2.js";
import { Vec3 } from "./util/Vec3.js";
import { Camera } from "./util/Camera.js";

const avatarCanvas = document.querySelector("#avatar-canvas");
const gl = avatarCanvas.getContext("webgl2", {antialis:false});
let avatarCamera, uViewMatrix;

function resize() {
    const w = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    avatarCanvas.width = Math.floor(w / 2);
    avatarCanvas.height = Math.floor(w / 2 * 1.6);
    avatarCanvas.style.width = `${avatarCanvas.width * 2}px`;
    avatarCanvas.style.height = `${avatarCanvas.height * 2}px`;
    avatarCanvas.style.imageRendering = "pixelated";
    gl.viewport(0, 0, avatarCanvas.width, avatarCanvas.height);
    if(avatarCamera) {
        avatarCamera.setAspectRatio(avatarCanvas.width, avatarCanvas.height);
        avatarCamera.updateProjectionMatrix();
        updateViewMatrix();
    }
}
window.addEventListener('resize', resize);
resize();


function updateViewMatrix() {
    if(!uViewMatrix) return;
    const viewMatrix = avatarCamera.projectionMatrix.multiply(avatarCamera.rotationMatrix.multiply(avatarCamera.translationMatrix));
    uViewMatrix.set(viewMatrix);
}

fetch("models/roblox block character.obj").then(res=>res.text()).then(obj => {
    const rows = obj.split("\n");
    const vertices = [];
    const positions = [];
    let min = new Vec3(Infinity);
    let max = new Vec3(-Infinity);
    for(const row of rows) {
        const components = row.trim().split(" ");
        if(components[0] === "v") {
            const x = parseFloat(components[1]);
            const y = parseFloat(components[2]);
            const z = parseFloat(components[3]);
            vertices.push(new Vec3(x, y, z));
        }
    }
    for(const row of rows) {
        const components = row.trim().split(" ");
        if(components[0] === "f") {
            const v1 = parseInt(components[1].split("/")[0]) - 1;
            const v2 = parseInt(components[2].split("/")[0]) - 1;
            const v3 = parseInt(components[3].split("/")[0]) - 1;
            const p1 = vertices[v1];
            const p2 = vertices[v2];
            const p3 = vertices[v3];
            positions.push(...p1.toArray());
            positions.push(...p2.toArray());
            positions.push(...p3.toArray());
            min.x = Math.min(min.x, p1.x, p2.x, p3.x);
            min.y = Math.min(min.y, p1.y, p2.y, p3.y);
            min.z = Math.min(min.z, p1.z, p2.z, p3.z);
            max.x = Math.max(max.x, p1.x, p2.x, p3.x);
            max.y = Math.max(max.y, p1.y, p2.y, p3.y);
            max.z = Math.max(max.z, p1.z, p2.z, p3.z);
        }
    }
    let center = min.clone().add(max.clone().subtract(min).multiply(0.5));
    for(let i=0;i<positions.length;i+=3) {
        positions[i] -= center.x;
        positions[i+1] -= center.y;
        positions[i+2] -= center.z;
    }
    const vertexShaderSource = `#version 300 es
        layout(location = 0) in vec3 position;
        uniform mat4 u_view_matrix;
        void main() {
            gl_Position = vec4(position, 1.0) * u_view_matrix;
        }
    `;
    const fragmentShaderSource = `#version 300 es
        precision highp float;
        out vec4 color;
        void main() {
            float dither_x = floor(gl_FragCoord.x / 2.0);
            float dither_y = floor(gl_FragCoord.y / 2.0);
            if(mod(dither_x + dither_y, 2.0) == 0.0 && mod(dither_y - dither_x, 2.0) == 0.0) {
                discard;
            }
            color = vec4(1, 0.15, 0.2, 1);
        }
    `;
    const vertexShader = new WebGL2.Shader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = new WebGL2.Shader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = new WebGL2.Program(gl, vertexShader, fragmentShader);
    program.setActive();
    const vao = new WebGL2.VertexArray(gl);
    vao.setActive();
    const positionBuffer = new WebGL2.Buffer(gl, 0, 3, gl.FLOAT);
    positionBuffer.setActive();
    vao.enableBuffer(positionBuffer);
    positionBuffer.bufferData(new Float32Array(positions));
    uViewMatrix = new WebGL2.Uniform(gl, program, "u_view_matrix", "mat4");
    avatarCamera = new Camera(1, 1, Math.PI / 8);
    avatarCamera.position = new Vec3(0, 0, 10);
    avatarCamera.updateTranslationMatrix();
    avatarCamera.updateRotationMatrix();
    avatarCamera.updateProjectionMatrix();
    resize();
    const vertexCount = positions.length / 3;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    function renderAvatar() {
        avatarCamera.rotation.y = performance.now() / 2000;
        avatarCamera.rotation.x = -0.35 + Math.sin(performance.now() / 3000) * 0.1;
        avatarCamera.position = new Vec3(0,0,12).rotateXYZ(avatarCamera.rotation.x, avatarCamera.rotation.y, avatarCamera.rotation.z);
        avatarCamera.updateTranslationMatrix();
        avatarCamera.updateRotationMatrix();
        updateViewMatrix();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
        requestAnimationFrame(renderAvatar);
    }
    renderAvatar();
});

const viewPastWork = document.querySelector("#view-past-work");
viewPastWork.onclick = () => {
    window.scrollTo({ top: window.innerHeight * (1 + 0.9), behavior: 'smooth' });
}
