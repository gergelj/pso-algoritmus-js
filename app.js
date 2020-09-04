new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        valid: true,
        maxIteration: '',
        populationSize: '',
        functions: [
            { value: null, text: "Select a function" }
        ],
        selectedFunction: null,

        overlay: false,
        swarms: [],

        minIterationBound : 1,
        maxIterationBound : 5000,
        minPopulationSize : 1,
        maxPopulationSize : 200
    },
    methods: {
        start(){
            if(this.valid){
                const vm = this;
                this.overlay = true;

                let worker = new Worker('pso-algorithm-worker.js');
                worker.addEventListener('message', function(e){
                    vm.overlay = false;
                    vm.swarms = e.data;
                }, false);

                let data = {maxIteration: this.maxIteration, populationSize: this.populationSize, functionName: this.selectedFunction.name};
                worker.postMessage(data);
            }
        }
    },
    mounted(){
        let rastrigin = new FunctionConfig('Rastrigin');
        let ackley = new FunctionConfig('Ackley');
        let sphere = new FunctionConfig('Sphere');
        let rosenbrock = new FunctionConfig('Rosenbrock');
        let easom = new FunctionConfig('Easom');
        let griewank = new FunctionConfig('Griewank');
        let styblinski = new FunctionConfig('Styblinski');

        this.functions.push({value: rastrigin, text: rastrigin.name});
        this.functions.push({value: ackley, text: ackley.name});
        this.functions.push({value: sphere, text: sphere.name});
        this.functions.push({value: rosenbrock, text: rosenbrock.name});
        this.functions.push({value: easom, text: easom.name});
        this.functions.push({value: griewank, text: griewank.name});
        this.functions.push({value: styblinski, text: styblinski.name});
    },
    computed:{
        globalBestPosition(){
            if(this.swarms.length > 0)
                return new Vector2(this.swarms[this.swarms.length-1].globalBestPosition.x, this.swarms[this.swarms.length-1].globalBestPosition.y);
            else{
                return new Vector2(NaN, NaN);
            }
        },
        globalBestValue(){
            if(this.swarms.length > 0)
                return this.swarms[this.swarms.length-1].globalBestValue;
            else{
                return NaN;
            }
        },
        iterationRules(){
            const vm = this;
            return [
                v => !!v || 'Iteration number is required',
                v => (v && parseFloat(v) >= vm.minIterationBound && parseFloat(v) <= vm.maxIterationBound) || ('Iteration number must be between ' + vm.minIterationBound + ' and ' + vm.maxIterationBound),
            ]
        },
        populationRules(){
            const vm = this;
            return [
                v => !!v || 'Population size is required',
                v => (v && parseFloat(v) >= vm.minPopulationSize && parseFloat(v) <= vm.maxPopulationSize) || ('Population size must be between ' + vm.minPopulationSize + ' and ' + vm.maxPopulationSize),
            ]
        }
    }
})