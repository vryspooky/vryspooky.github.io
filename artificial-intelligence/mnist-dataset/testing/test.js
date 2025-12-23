import * as Networks from "../js/Networks.js";
import * as MnistEnv from "../js/MnistEnv.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const importWeights = document.querySelector("#import-weights");
const importWeightsBtn = document.querySelector("#import-weights-button");
const guessLabel = document.querySelector("#guess-label");
const clearButton = document.querySelector("#clear-button");

let network;

let isDrawing = false;
let drawX = 0;
let drawY = 0;

function mouseToCanvas(mx, my) {
    const rect = canvas.getBoundingClientRect();
    const x = (mx - rect.left) / rect.width * canvas.width;
    const y = (my - rect.top) / rect.height * canvas.height;
    return {x, y};
}

function guessLoop() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for(let i=0;i<network.layers[0].nodes.length;i++) {
        const brightness = imageData.data[i * 4] / 255;
        network.layers[0].nodes[i].output = brightness;
    }
    network.forward();
    const guesses = MnistEnv.getNetworkGuesses(network);
    guessLabel.innerText = `I think its a ${guesses[0].index} (${(guesses[0].confidence * 100).toFixed(2)}%).`;
    setTimeout(() => {
       guessLoop(); 
    }, 100);
}



fetch("./test-weights.txt").then(res=>res.text()).then(text=>{
    network = new Networks.SimpleFCNN({
      layerLengths: [784, 128, 64, 10],
      activations: [Networks.IDENTITY, Networks.RELU, Networks.RELU, Networks.SOFTMAX],
      lossFunction: Networks.CROSS_ENTROPY,
    });
    network.importWeights(text);
  
    clearButton.addEventListener("click", e=>{
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    canvas.addEventListener("mousedown", e=>{
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const {x, y} = mouseToCanvas(e.clientX, e.clientY);
        drawX = x;
        drawY = y;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
    });
    window.addEventListener("mouseup", e=>{
        isDrawing = false;
        ctx.closePath();
    });
    window.addEventListener("mousemove", e=>{
        if (!isDrawing) return;
        const {x, y} = mouseToCanvas(e.clientX, e.clientY);
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        drawX = x;
        drawY = y;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.stroke();
    });
    window.addEventListener("keydown", e=>{
        const key = e.key.toLowerCase();
        if(key=="p") {
            console.log(network.exportWeights());
            console.log(network);
        }
    })
    importWeightsBtn.addEventListener("click", e=>{
        const weightsText = importWeights.value;
        network.importWeights(weightsText);
    });
    guessLoop();
});
