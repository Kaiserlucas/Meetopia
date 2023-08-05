import * as PIXI from 'pixi.js';

class UpdateManager extends PIXI.utils.EventEmitter{
    constructor(engine) {
        super();
        this.engine = engine;
    }

    start(){        
        this.initDynamicLoop();
    }

    initDynamicLoop(){
        this.engine.ticker.add((dt) => {
            if(this.engine.debug){
                this.engine.stats.begin();
            }
            this.update(dt, dt/60);
            if(this.engine.debug){
                this.engine.stats.end();
            }
        });
    }

    update(dt, dts){
        this.emit("update", dt, dts);
    }

}

export default UpdateManager;