import * as NetworkUtils from "./NetworkUtils.js";

export class SimpleFCNN {
    constructor({
        layerLengths,
        activations,
        lossFunction = NetworkUtils.MEAN_SQUARED_ERROR,
    }={}) {
        this.layers = [];
        this.lossFunction = lossFunction;
        for(let i=0;i<layerLengths.length;i++) {
            const layerLength = layerLengths[i];
            const layer = {}
            layer.activation = activations[i];
            layer.nodes = [];
            for(let j=0;j<layerLength;j++) {
                const node = {};
                node.output = 0;
                node.wsum = 0;
                node.bias = 0;
                node.biasGradient = 0;
                if(i>0) {
                    node.weights = [];
                    for(let k=0;k<layerLengths[i-1];k++) {
                        const weight = {};
                        weight.value = (Math.random() - 0.5) * 2 * Math.sqrt(1 / layerLengths[i-1]);
                        weight.gradient = 0;
                        node.weights.push(weight);
                    }
                }
                layer.nodes.push(node);
            }
            this.layers.push(layer);
        }
    }
    getLayer(index) {
        return this.layers[index];
    }
    setLayerOutputs(layer, outputs) {
        for(let i=0;i<outputs.length;i++) {
            layer.nodes[i].output = outputs[i];
        }
    }
    forward() {
        for(let i=1;i<this.layers.length;i++) {
            const layer = this.layers[i];
            const prevLayer = this.layers[i-1];
            for(let j=0;j<layer.nodes.length;j++) {
                const node = layer.nodes[j];
                let wsum = node.bias;
                for(let k=0;k<prevLayer.nodes.length;k++) {
                    wsum += prevLayer.nodes[k].output * node.weights[k].value;
                }
                node.wsum = wsum;
                if(!layer.activation.isVector) {
                    node.output = layer.activation.func(wsum);
                }
            }
            if (layer.activation.isVector) {
                const vectorLogits = layer.nodes.map(n => n.wsum);
                const vectorOutputs = layer.activation.func(vectorLogits);
                for(let j=0;j<layer.nodes.length;j++) {
                    layer.nodes[j].output = vectorOutputs[j];
                }
            }
        }
    }
    backward(targets) {
        for(let i=this.layers.length-1;i>=1;i--) {
            const layer = this.layers[i];
            const prevLayer = this.layers[i-1];
            if(i==this.layers.length-1) {
                for(let j=0;j<layer.nodes.length;j++) {
                    const node = layer.nodes[j];
                    const dLoss_dOutput = this.lossFunction.derivative(node.output, targets[j], layer.nodes.length);
                    const dOutput_dWsum = layer.activation.derivative(node.wsum);
                    node.dLoss_dWsum = dLoss_dOutput * dOutput_dWsum;
                    node.biasGradient += node.dLoss_dWsum;
                    for(let k=0;k<node.weights.length;k++) {
                        const weight = node.weights[k];
                        const dWsum_dW = prevLayer.nodes[k].output;
                        const dLoss_dW = node.dLoss_dWsum * dWsum_dW;
                        weight.gradient += dLoss_dW;
                    }
                }
            } else {
                const nextLayer = this.layers[i+1];
                for(let j=0;j<layer.nodes.length;j++) {
                    const node = layer.nodes[j];
                    let dLoss_dOutput = 0;
                    for(let k=0;k<nextLayer.nodes.length;k++) {
                        const nextNode = nextLayer.nodes[k];
                        const dLoss_dNextWsum = nextNode.dLoss_dWsum;
                        const dWsum_dOutput = nextLayer.nodes[k].weights[j].value;
                        dLoss_dOutput += dLoss_dNextWsum * dWsum_dOutput;
                    }
                    const dOutput_dWsum = layer.activation.derivative(node.wsum);
                    node.dLoss_dWsum = dLoss_dOutput * dOutput_dWsum;
                    node.biasGradient += node.dLoss_dWsum;
                    for(let k=0;k<node.weights.length;k++) {
                        const weight = node.weights[k];
                        const dWsum_dW = prevLayer.nodes[k].output;
                        const dLoss_dW = dLoss_dOutput * dOutput_dWsum * dWsum_dW;
                        weight.gradient += dLoss_dW;
                    }
                }
            }
        }
    }
    applyGradients(learnRate) {
        for(let i=1;i<this.layers.length;i++) {
            const layer = this.layers[i];
            for(let j=0;j<layer.nodes.length;j++) {
                const node = layer.nodes[j];
                node.bias -= learnRate * node.biasGradient;
                node.biasGradient = 0;
                for(let k=0;k<node.weights.length;k++) {
                    const weight = node.weights[k];
                    weight.value -= learnRate * weight.gradient;
                    weight.gradient = 0;
                }
            }
        }
    }
    importWeights( contents) {
        const lines = contents.split("\n");
        for(let i=0;i<this.layers.length;i++) {
            const layer = this.layers[i];
            const weights = lines[i].trim().split(",").map(v => parseFloat(v));
            let index = 0;
            for(let j=0;j<layer.nodes.length;j++) {
                const node = layer.nodes[j];
                node.bias = weights[index++];
                if(i>0) {
                    for(let k=0;k<node.weights.length;k++) {
                        node.weights[k].value = weights[index++];
                    }
                }
            }
        }
    }
    exportWeights() {
        let contents = "";
        for(let i=0;i<this.layers.length;i++) {
            const layer = this.layers[i];
            let weights = [];
            for(let j=0;j<layer.nodes.length;j++) {
                const node = layer.nodes[j];
                weights.push(node.bias);
                if(i>0) {
                    for(let k=0;k<node.weights.length;k++) {
                        weights.push(node.weights[k].value);
                    }
                }
            }
            contents += weights.join(",") + "\n";
        }
        return contents;
    }
}
