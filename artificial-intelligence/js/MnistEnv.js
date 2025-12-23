import * as WebGL2 from "./WebGL2.js";
import * as PseudoRandom from "./PseudoRandom.js";

const MnistTrainingImages = [];
let MnistAreTrainingImagesLoaded = false;

export async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function loadMnistDataset() {
    fetch("https://www.kaggle.com/api/v1/datasets/download/oddrationale/mnist-in-csv").then(response=>{
        return response.blob();
    }).then(datasetBlob=>{
        const jsZip = new JSZip();
        jsZip.loadAsync(datasetBlob).then((zip)=>{
            zip.file("mnist_train.csv").async('string').then(async contentString=>{

                const imageStringList = contentString.trim().split("\n");

                await delay(1);

                for(let i=1;i<imageStringList.length;i++) {
                    const values = imageStringList[i].trim().split(",");
                    const imageLabel = parseInt(values[0]);
                    const imageColors = new Uint8Array(28 * 28 * 4);
                    for(let j=1;j<values.length;j++) {
                        const colorIndex = (j - 1) * 4;
                        const brightness = parseInt(values[j]);
                        imageColors[colorIndex + 0] = brightness;
                        imageColors[colorIndex + 1] = brightness;
                        imageColors[colorIndex + 2] = brightness;
                        imageColors[colorIndex + 3] = 255;
                    }
                    const image = {label: imageLabel, colors: imageColors};
                    MnistTrainingImages.push(image);
                    if(i%1000==0) await delay(1);
                }

                MnistAreTrainingImagesLoaded = true;
            });
        });
    });
}

export async function waitForMnistTrainingImages() {
    while(!MnistAreTrainingImagesLoaded) {
        await delay(50);
    }
}

export function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * MnistTrainingImages.length);
    return MnistTrainingImages[randomIndex];
}

export class MnistModifier {
    constructor() {
        const canvas = document.createElement("canvas");
        canvas.width = 28;
        canvas.height = 28;
        const gl = canvas.getContext("webgl2");
        const vertexShaderSource = `#version 300 es
            layout(location = 0) in vec2 a_position;
            layout(location = 1) in vec2 a_texcoord;
            out vec2 v_texcoord;
            void main() {
                gl_Position = vec4(a_position, 0, 1);
                v_texcoord = a_texcoord;
            }
        `;
        const fragmentShaderSource = `#version 300 es
            precision highp float;

            uniform sampler2D u_image;
            uniform float u_rotation;
            uniform vec2 u_translation;
            uniform float u_scale;
            uniform float u_noise;
            uniform float u_seed;

            in vec2 v_texcoord;
            out vec4 color;

            ${PseudoRandom.OpenGL}

            void main() {
                vec2 centered = v_texcoord - 0.5;
                centered *= u_scale;
                float cosA = cos(u_rotation);
                float sinA = sin(u_rotation);
                vec2 rotated = vec2(
                    centered.x * cosA - centered.y * sinA,
                    centered.x * sinA + centered.y * cosA
                );
                vec2 transformed = rotated + 0.5 + u_translation;
                vec4 texColor;
                if (
                    transformed.x < 0.0 || transformed.x > 1.0
                    || transformed.y < 0.0 || transformed.y > 1.0
                ) {
                    texColor = vec4(0.0, 0.0, 0.0, 1.0);
                } else {
                    texColor = texture(u_image, transformed);
                }

                // scale coordinates to make noise smaller/larger
                vec2 uv = transformed.xy * 4.0;
                float combined = max(pow(perlinNoise2D(uv, u_seed) * perlinNoise2D(uv, u_seed + 100.0), 3.0) - 0.03, 0.0) * 7.0 * (u_noise * 0.4 + 0.6);
                combined += randomConstF3(uv.x, uv.y, u_seed) * voronoiNoise2D(uv, u_seed + 200.0) * voronoiNoise2D(uv, u_seed + 300.0) * ((1.0 - u_noise) * 0.6 + 0.4);
                texColor.rgb += combined;

                color = texColor;
            }
        `;
        const vertexShader = new WebGL2.Shader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = new WebGL2.Shader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = new WebGL2.Program(gl, vertexShader, fragmentShader);
        program.setActive();
        const uImage = new WebGL2.Texture2D(gl, program, 0, "u_image");
        const uRotation = new WebGL2.Uniform(gl, program, "u_rotation", "float");
        const uTranslation = new WebGL2.Uniform(gl, program, "u_translation", "vec2");
        const uScale = new WebGL2.Uniform(gl, program, "u_scale", "float");
        const uNoise = new WebGL2.Uniform(gl, program, "u_noise", "float");
        const uSeed = new WebGL2.Uniform(gl, program, "u_seed", "float");
        const vao = new WebGL2.VertexArray(gl);
        vao.setActive();
        const positionBuffer = new WebGL2.Buffer(gl, 0, 2, gl.FLOAT);
        positionBuffer.setActive();
        positionBuffer.bufferData(new Float32Array([ -1, -1,  1, -1, -1,  1,  -1,  1,  1, -1,  1,  1 ]));
        vao.enableBuffer(positionBuffer);
        const texcoordBuffer = new WebGL2.Buffer(gl, 1, 2, gl.FLOAT);
        texcoordBuffer.setActive();
        texcoordBuffer.bufferData(new Float32Array([ 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1 ]));
        vao.enableBuffer(texcoordBuffer);
        Object.assign(this, { gl, canvas, program, uImage, uRotation, uTranslation, uScale, uNoise, uSeed, vao });
    }
    modifyImage(mnistImage, { rotation=0, translationX=0, translationY=0, scale=1, noise=0, seed=0 }={}) {
        this.uImage.setColors(mnistImage.colors, 28, 28);
        this.uRotation.set(rotation);
        this.uTranslation.set(translationX, translationY);
        this.uScale.set(scale);
        this.uNoise.set(noise);
        this.uSeed.set(seed);
        this.gl.viewport(0, 0, 28, 28);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        const modifiedColors = new Uint8Array(28 * 28 * 4);
        this.gl.readPixels(0, 0, 28, 28, this.gl.RGBA, this.gl.UNSIGNED_BYTE, modifiedColors);
        return { label: mnistImage.label, colors: modifiedColors };
    }
}

export function getNetworkGuesses(network) {
    const labels = [0,1,2,3,4,5,6,7,8,9];
    labels.sort((a,b)=>{
        return network.layers[network.layers.length - 1].nodes[b].output - network.layers[network.layers.length - 1].nodes[a].output;
    });
    let totalConfidence = 0;
    const confidences = labels.map(label => {
        const confidence = network.layers[network.layers.length - 1].nodes[label].output;
        totalConfidence += confidence;
        return confidence;
    });
    return labels.map((label, index) => ({
        index: label,
        confidence: confidences[index] / totalConfidence,
    }));
}


const targets = {
    0: new Float32Array([1,0,0,0,0,0,0,0,0,0]),
    1: new Float32Array([0,1,0,0,0,0,0,0,0,0]),
    2: new Float32Array([0,0,1,0,0,0,0,0,0,0]),
    3: new Float32Array([0,0,0,1,0,0,0,0,0,0]),
    4: new Float32Array([0,0,0,0,1,0,0,0,0,0]),
    5: new Float32Array([0,0,0,0,0,1,0,0,0,0]),
    6: new Float32Array([0,0,0,0,0,0,1,0,0,0]),
    7: new Float32Array([0,0,0,0,0,0,0,1,0,0]),
    8: new Float32Array([0,0,0,0,0,0,0,0,1,0]),
    9: new Float32Array([0,0,0,0,0,0,0,0,0,1]),
}
export function getNetworkTargets(mnistImage) {
    return targets[mnistImage.label];
}


export function setNetworkInputs(network, mnistImage) {
    for(let j=0;j<784;j++) {
        network.layers[0].nodes[j].output = mnistImage.colors[j * 4] / 255.0;
    }
}
