export const SIGMOID = {
    func: function(x) {
        return 1 / (1 + Math.exp(-x));
    },
    derivative: function(x) {
        const s = SIGMOID.func(x);
        return s * (1 - s);
    }
};
export const RELU = {
    func: function(x) {
        return Math.max(0, x);
    },
    derivative: function(x) {
        return x > 0 ? 1 : 0;
    }
};
export const IDENTITY = {
    func: function(x) {
        return x;
    },
    derivative: function(x) {
        return 1;
    }
};
export const MEAN_SQUARED_ERROR = {
    func: function(output, target, outputCount) {
        return (output - target) ** 2 / outputCount;
    },
    derivative: function(output, target, outputCount) {
        return 2 * (output - target) / outputCount;
    }
};
export const CROSS_ENTROPY = {
    func: function(output_softmax, target, outputCount) {
        return -target * Math.log(output_softmax + 1e-12); 
    },
    derivative: function(output_softmax, target, outputCount) {
        return output_softmax - target;
    }
};
export const SOFTMAX = {
    isVector: true,
    func: function(logits) {
        const maxLogit = Math.max(...logits);
        const exps = logits.map(x => Math.exp(x - maxLogit));
        const sumExps = exps.reduce((a,b)=>a+b,0);
        return exps.map(x => x / sumExps);
    },
    derivative: function(output, target) {
        return 1;
    }
}
