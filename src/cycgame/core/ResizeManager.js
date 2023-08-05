import * as PIXI from 'pixi.js';

class ResizeManager extends PIXI.utils.EventEmitter{
    constructor(engine) {
        super();
        this.engine = engine;

        this.registerEvents();
    }

    registerEvents(){
        window.addEventListener("resize", this.resizeHandler.bind(this));
        window.addEventListener("orientationchange", this.resizeHandler.bind(this));
    }

    resizeHandler() {
        this.emit("resize");
    }

    resize(){
        let screenWidth = Math.floor(this.width);
        let screenHeight = Math.floor(this.height);
        
        this.engine.renderer.resize(screenWidth, screenHeight);
    }

    update(dt, dts){

    }

    get width(){
        return window.innerWidth;
    }

    get height(){
        return window.innerHeight;
    }


}
export default ResizeManager;