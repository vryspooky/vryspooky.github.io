import * as Networks from "../../../js/Networks.js";
import * as NetworkUtils from "../../../js/NetworkUtils.js";
import * as MnistEnv from "../../../js/MnistEnv.js";

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function windowResized() {
    if(window.innerWidth < window.innerHeight) {
        previewDiv.style.left = "50%";
        previewDiv.style.top = "0";
        previewDiv.style.transform = "translateX(-50%)";
        previewDiv.style.zoom = `${window.innerHeight / window.innerWidth * 0.5}`;
    } else {
        previewDiv.style.left = "0";
        previewDiv.style.top = "0";
        previewDiv.style.transform = "";
        previewDiv.style.zoom = `${window.innerWidth / window.innerHeight * 0.5}`;
    }
}

let batchSize = 128;
let learnRate = 0.1;
let trainIndex = 0;
let network;
let imageModifier;
let previewDiv;
let loadingLabel;

function getRandomImage() {
    if(trainIndex < 200000) {
        return MnistEnv.getRandomImage();
    }
    return imageModifier.modifyImage(MnistEnv.getRandomImage(), {
        rotation: (Math.random() - 0.5) * 0.4,
        translationX: (Math.random() - 0.5) * 0.4,
        translationY: (Math.random() - 0.5) * 0.4,
        scale: 0.8 + Math.random() * 0.4,
        noise: (Math.random() - 0.5) * 2,
        seed: Math.random() * 10000,
    });
}




function trainNetwork() {
    const mnistImage = getRandomImage();
    MnistEnv.setNetworkInputs(network, mnistImage);
    const target = MnistEnv.getNetworkTargets(mnistImage);
    network.forward();
    network.backward(target);
    trainIndex++;
    if(trainIndex%batchSize==0) {
        network.applyGradients(learnRate / batchSize);
    }
}

async function trainLoop() {
    await MnistEnv.waitForMnistTrainingImages();
    loadingLabel.remove();
    while(true) {
        if(trainIndex%10000==0) await previewNetwork();
        if(trainIndex%100==0) await delay(1);
        trainNetwork();
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

async function previewNetwork() {
    previewDiv.innerHTML = "";
    for(let i=0;i<99;i++) {
        const testMnistImage = getRandomImage();
        const testImage = document.createElement("canvas");
        const testCtx = testImage.getContext("2d");

        MnistEnv.setNetworkInputs(network, testMnistImage);
        network.forward();
        
        const guesses = MnistEnv.getNetworkGuesses(network);
        const isCorrect = guesses[0].index == testMnistImage.label;

        testImage.width = 28;
        testImage.height = 28;
        testImage.style = `
            width: ${i>=90 ? 9.6 : 5.35}vmin;
            height: ${i>=90 ? 9.6 : 5.35}vmin;
            image-rendering: pixelated;
            background-blend-mode: multiply;
            flex: 0 0 auto;
        `;
        previewDiv.appendChild(testImage);
        testImage.title = (`
${isCorrect ? "correct" : "incorrect"}
#1 guess: ${guesses[0].index} (${(guesses[0].confidence * 100).toFixed(2)}%)
#2 guess: ${guesses[1].index} (${(guesses[1].confidence * 100).toFixed(2)}%)

Label: ${testMnistImage.label}
        `).trim();

        let testData = testCtx.createImageData(28, 28);
        let tint = [0,0,0];
        if(isCorrect) {
            tint = [70,255,140];
        } else if(guesses[1].index == testMnistImage.label) {
            tint = [255,190,140];
        } else {
            tint = [255,100,125];
        }
        for(let i=0;i<testMnistImage.colors.length;i+=4) {
            testData.data[i] = lerp(testMnistImage.colors[i], tint[0], 0.2);
            testData.data[i+1] = lerp(testMnistImage.colors[i+1], tint[1], 0.2);
            testData.data[i+2] = lerp(testMnistImage.colors[i+2], tint[2], 0.2);
            testData.data[i+3] = 255;
        }
        testCtx.putImageData(testData, 0, 0);
    }
}



previewDiv = document.createElement("div");
previewDiv.style = `
    position:absolute;
    left:50%;
    top:5%;
    width:95vmin;
    height:50vmin;
    transform:translateX(-50%);
    background-color:rgb(20,21,22);
    display:flex;
    flex-direction:row;
    flex-wrap:wrap;
    padding:10px;
    align-content:center;
    justify-content:center;
    gap: 1vmin;
    overflow:auto;
`;
document.body.appendChild(previewDiv);
loadingLabel = document.createElement("div");
loadingLabel.innerText = "Loading MNIST dataset...";
loadingLabel.style = `
    color: white;
    font-family: sans-serif;
    font-size: 24px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`;
previewDiv.appendChild(loadingLabel);
window.addEventListener("resize", windowResized);
windowResized();

MnistEnv.loadMnistDataset();

network = new Networks.SimpleFCNN({
    layerLengths: [784, 128, 64, 10],
    activations: [NetworkUtils.IDENTITY, NetworkUtils.RELU, NetworkUtils.RELU, NetworkUtils.SOFTMAX],
    lossFunction: NetworkUtils.CROSS_ENTROPY,
});
imageModifier = new MnistEnv.MnistModifier();

trainLoop();

window.addEventListener("keydown", e=>{
    const key = e.key.toLowerCase();
    if(key=="p") {
        console.log(network.exportWeights());
    }
});
