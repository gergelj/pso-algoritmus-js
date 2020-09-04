var rnd = null;
/**
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 */
function Vector2(x, y){
    this.x = x;
    this.y = y;
};

/**
 * @param {Number} id - Identification number
 * @param {Number} minValue - Lower bound
 * @param {Number} maxValue - Upper bound
 */
function Particle(id, minValue, maxValue) {
    this.id = id;
    let x = (maxValue - minValue) * rnd() + minValue;
    let y = (maxValue - minValue) * rnd() + minValue;
    this.position = new Vector2(x, y);
    this.bestPosition = new Vector2(x, y);
    this.bestValue = NaN;
    this.previousV = new Vector2(rnd(), rnd());
};

Particle.prototype.getNextPosition = function(nextV){
    return new Vector2(this.position.x + nextV.x, this.position.y + nextV.y);
}

function Swarm(){
    this.globalBestValue = NaN;
    this.globalBestPosition = null;
    this.particles = [];
};

/**
 * @param {String} name - Name of the function
 * @param {Function} fn - Function
 * @param {Number} minVal - Lower bound of the function
 * @param {Number} maxVal - Upper bound of the function
 * @param {Vector2} analyticPosition - Position of the analytic result
 * @param {Number} analyticResult - Analytic result (value)
 */
function FunctionConfig(name){
    this.name = name
    switch(name){
        case 'Rastrigin': {
            this.minVal = -6;
            this.maxVal = 6;
            this.fn = function(x, y){
                return 20 + x * x - 10 * Math.cos(2 * Math.PI * x) + y * y - 10 * Math.cos(2 * Math.PI * y);
            };
            this.analyticPosition = new Vector2(0, 0);
            this.analyticResult = 0;
        } break;
        case 'Ackley': {
            this.minVal = -15;
            this.maxVal = 15;
            this.fn = function(x,y){
                return 20 + Math.E - 20 * Math.exp(-0.2 * Math.sqrt((x * x + y * y) / 2)) - Math.exp(-(Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y)) / 2);
            };
            this.analyticPosition = new Vector2(0, 0);
            this.analyticResult = 0;
        } break;
        case 'Sphere': {
            this.minVal = -15;
            this.maxVal = 15;
            this.fn = function(x,y){
                return x*x + y*y;
            };
            this.analyticPosition = new Vector2(0, 0);
            this.analyticResult = 0;
        } break;
        case 'Rosenbrock': {
            this.minVal = -2.5;
            this.maxVal = 2.5;
            this.fn = function(x,y){
                return 100 * Math.pow(x*x - y, 2) + Math.pow(x - 1, 2);
            };
            this.analyticPosition = new Vector2(1, 1);
            this.analyticResult = 0;
        } break;
        case 'Easom': {
            this.minVal = -100;
            this.maxVal = 100;
            this.fn = function(x,y){
                return - Math.cos(x) * Math.cos(y) * Math.exp(- (Math.pow(x - Math.PI, 2) + Math.pow(y - Math.PI, 2)));
            };
            this.analyticPosition = new Vector2(Math.PI, Math.PI);
            this.analyticResult = -1;
        } break;
        case 'Griewank': {
            this.minVal = -100;
            this.maxVal = 100;
            this.fn = function(x,y){
                return 1 + (x*x + y*y) / 4000 - (Math.cos(x) * Math.cos(y / Math.sqrt(2)));
            };
            this.analyticPosition = new Vector2(0, 0);
            this.analyticResult = 0;
        } break;
        case 'Styblinski': {
            this.minVal = -5;
            this.maxVal = 5;
            this.fn = function(x,y){
                return (Math.pow(x, 4) - 16 * x*x + 5 * x + Math.pow(y, 4) - 16 * y*y + 5 * y) / 2;
            };
            this.analyticPosition = new Vector2(-2.903534, -2.903534);
            this.analyticResult = -78.332;
        } break;
    }
};

/**
 * @param {Number} maxIteration - Maximum number of iterations
 * @param {Number} populationSize - Number of particles in the swarm
 * @param {FunctionConfig} fnConfig - Selected function with configuration
 */
function PsoAlgorithm(maxIteration, populationSize, fnConfig){
    this.maxIteration = maxIteration;
    this.populationSize = populationSize;
    this.fnConfig = fnConfig;
    this.swarms = []
};

/**
 * @param {Number} iteration - Current iteration
 */
PsoAlgorithm.prototype.w = function(iteration){
    // values 0.9 -> 0.4
    return -0.5 * iteration / this.maxIteration + 0.9;
};

/**
 * @param {Number} iteration - Current iteration
 */
PsoAlgorithm.prototype.cp = function(iteration){
    //values 2.5 -> 0.5
    return -2 * iteration / this.maxIteration + 2.5;
};

/**
 * @param {Number} iteration - Current iteration
 */
PsoAlgorithm.prototype.cg = function(iteration){
    // values 0.5 -> 2.5
    return 2 * iteration / this.maxIteration + 0.5;
};

/**
 * @param {Number} value - Value which is tested as an optimum
 * @param {Number} bestValue - Best value that is tested against
 */
PsoAlgorithm.prototype.test = function(value, bestValue){
    // searching for global minimum
    return value < bestValue;
}

PsoAlgorithm.prototype.initSwarm = function(){
    let swarm = new Swarm();
    let particle0 = new Particle(0, this.fnConfig.minVal, this.fnConfig.maxVal);
    swarm.particles.push(particle0);
    swarm.globalBestPosition = particle0.position;
    particle0.bestValue = this.fnConfig.fn(particle0.position.x, particle0.position.y);
    swarm.globalBestValue = particle0.bestValue;

    for(const it of _.range(1, this.populationSize)){
        let particle = new Particle(it, this.fnConfig.minVal, this.fnConfig.maxVal);
        let value = this.fnConfig.fn(particle.position.x, particle.position.y);
        particle.bestValue = value;
        if(this.test(value, swarm.globalBestValue)){
            swarm.globalBestValue = value;
            swarm.globalBestPosition = particle.position;
        }
        swarm.particles.push(particle);
    }

    return swarm;
}

PsoAlgorithm.prototype.getNextV = function(iteration, particle, swarm){
    // nextV = w() * previousV +
    //         cp() * rand * (bestPosition - position) +
    //         cg() * rand * (globalBestPosition - position)
    let inertialComponent = this.w(iteration);
    let cognitiveComponent = this.cp(iteration) * rnd();
    let socialComponent = this.cg(iteration) * rnd();
    let nextX = inertialComponent * particle.previousV.x + cognitiveComponent * (particle.bestPosition.x - particle.position.x) + socialComponent * (swarm.globalBestPosition.x - particle.position.x);
    let nextY = inertialComponent * particle.previousV.y + cognitiveComponent * (particle.bestPosition.y - particle.position.y) + socialComponent * (swarm.globalBestPosition.y - particle.position.y);
    return new Vector2(nextX, nextY);
}

PsoAlgorithm.prototype.start = function(){
    rnd = new Math.seedrandom((new Date()).getTime().toString());
    let swarm = this.initSwarm();
    
    for(const it of _.range(this.maxIteration)){
        for(let particle of swarm.particles){
            let nextV = this.getNextV(it, particle, swarm);
            let nextPosition = particle.getNextPosition(nextV);

            let value = this.fnConfig.fn(particle.position.x, particle.position.y);
            
            if(this.test(value, particle.bestValue)){
                particle.bestValue = value;
                particle.bestPosition = nextPosition;
            }
            
            particle.position = nextPosition;
            particle.previousV = nextV;
        }
        
        for(let particle of swarm.particles){
            let value = this.fnConfig.fn(particle.position.x, particle.position.y);

            if(this.test(value, swarm.globalBestValue)){
                swarm.globalBestValue = value;
                swarm.globalBestPosition = particle.position;
            }
        }

        this.swarms.push(_.cloneDeep(swarm));
    }
};