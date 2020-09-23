Vue.component('plotly-plotter', {
    props: ['swarms', 'selectedFunction'],
    vuetify: new Vuetify(),
    data: function(){
        return {
            traces: [],
            layout: {},
            frames: [],
            sliderSteps: [],
            markerSize: 20
        }
    },
    template:`
<div id="plotly"></div>
    `,
    methods: {
        plot(){
            let size = 100, x = new Array(size), y = new Array(size), z = new Array(size);

            for(let i = 0; i < size; i++) {
                x[i] = y[i] = this.selectedFunction.minVal + (this.selectedFunction.maxVal - this.selectedFunction.minVal) * i / size;
                z[i] = new Array(size);
            }

            for(let i = 0; i < size; i++) {
                for(j = 0; j < size; j++) {
                    z[i][j] = this.selectedFunction.fn(x[i], y[j]);//Math.sin(x[i]) * Math.cos(y[j]) * Math.sin(r2) / Math.log(r2+1);
                }
            }

            let data = [ {
                z: z,
                x: x,
                y: y,
                type: 'contour',
                colorscale: 'Jet',
                contours: {
                    coloring: 'heatmap'
                }
            }
            ];


            this.loadFrames();
            this.loadSliderSteps();
            this.loadLayout();

            this.frames.unshift(data);

            Plotly.newPlot('plotly', {
                data: data,
                layout: this.layout,
                frames: this.frames
            });
        },
        loadFrames(){
            this.frames = [];
            for (let i = 0; i < this.swarms.length; i++) {
                this.frames.push({
                    name: i.toString(),
                    data: [{
                        x: this.swarms[i].particles.map(p => p.position.x),
                        y: this.swarms[i].particles.map(p => p.position.y),
                        id: i,
                        type: 'scatter',
                        mode: 'markers',
                        text: [],
                        marker: {
                            color: 'rgb(17, 157, 255)',
                            size: this.markerSize
                        }
                    }]
                });
            }
        },
        loadSliderSteps(){
            this.sliderSteps = [];
            for (let i = 0; i < this.swarms.length; i++) {
                this.sliderSteps.push({
                  method: 'animate',
                  label: i+1,
                  args: [[i], {
                    mode: 'immediate',
                    transition: {duration: 20},
                    frame: {duration: 50, redraw: false},
                  }]
                });
              }
        },
        loadLayout(){
            this.layout = {
                xaxis: {
                    title: 'x',
                    range: [this.selectedFunction.minVal, this.selectedFunction.maxVal]
                },
                yaxis: {
                    title: 'y',
                    range: [this.selectedFunction.minVal, this.selectedFunction.maxVal]
                },
                height: 900,
                hovermode: 'closest',
                updatemenus: [{
                    x: 0,
                    y: 0,
                    yanchor: 'top',
                    xanchor: 'left',
                    showactive: false,
                    direction: 'left',
                    type: 'buttons',
                    pad: {t: 87, r: 10},
                    buttons: [{
                        method: 'animate',
                        args: [null, {
                            mode: 'immediate',
                            fromcurrent: true,
                            transition: {duration: 200},
                            frame: {duration: 150, redraw: false}
                        }],
                        label: 'Play'
                    }, {
                        method: 'animate',
                        args: [[null], {
                            mode: 'immediate',
                            transition: {duration: 0},
                            frame: {duration: 0, redraw: false}
                        }],
                        label: 'Pause'
                    }]
                }],
                sliders: [{
                    pad: {l: 130, t: 55},
                    currentvalue: {
                        visible: true,
                        prefix: 'Iteration: ',
                        xanchor: 'right',
                        font: {size: 16, color: '#666'}
                    },
                    steps: this.sliderSteps
                }]
            };
        }
    },
    watch:{
        swarms(newValue, oldValue){
            if(newValue){
                this.plot();
            }
        }
    }
})