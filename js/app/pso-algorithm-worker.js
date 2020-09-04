self.addEventListener('message', function(e){
    importScripts('js/app/pso-algorithm.js', 'js/lodash.min.js', 'js/seedrandom.min.js');
    let pso = new PsoAlgorithm(parseFloat(e.data.maxIteration), parseFloat(e.data.populationSize), new FunctionConfig(e.data.functionName));
    pso.start();
    self.postMessage(pso.swarms);
}, false);