import * as PIXI from 'pixi.js';
import ScreenManager from "./core/ScreenManager"
import ResizeManager from "./core/ResizeManager"
import UpdateManager from "./core/UpdateManager"
import Loader from "./core/Loader"
import FontLoaderPlugin from "./extra/FontLoaderPlugin"
import HDText from "./extra/HDText"
import Stats from "./extra/Stats";

PIXI.Loader.registerPlugin(FontLoaderPlugin);
HDText.execute();

class App{
    constructor() {

    }
    
    init(obj){
        this.version = obj.version;

        // init PIXI
        // https://pixijs.download/release/docs/PIXI.Application.html
        this.pixiApp = new PIXI.Application({
            resolution: window.devicePixelRatio || 1.0,
            backgroundColor: typeof obj.backgroundColor == "number" ? obj.backgroundColor : 0x6495ed,
            antialiasing: false,
            transparent: false,
        });

        this.view = this.pixiApp.view
        this.ticker = this.pixiApp.ticker;
        this.renderStage = this.pixiApp.stage;
        this.renderer = this.pixiApp.renderer;

        document.body.appendChild(this.view);

        this.loader = new Loader(this);
        this.screenManager = new ScreenManager(this);
        this.resizeManager = new ResizeManager(this);
        this.updateManager = new UpdateManager(this);
        this.renderStage.addChild(this.screenManager.view);

        this.updateManager.on("update", this.handleUpdate.bind(this));
        this.resizeManager.on("resize", this.handleResize.bind(this));

        this.handleResize();
        this.updateManager.start();

        if (obj.showStats) {
            this.stats = new Stats();
            document.body.appendChild(this.stats.dom);
        }
    }

    handleResize() {
        this.resizeManager.resize();
        this.screenManager.resize();
    }

    handleUpdate(dt, dts){
        if(this.stats) this.stats.begin();
        this.resizeManager.update(dt, dts);
        this.screenManager.update(dt, dts);
        if (this.stats) this.stats.end();
    }

    get fps () {
        return this.ticker.FPS;
    }

    get stage(){
        return this.renderStage;
    }

    get width(){
        return this.pixiApp.screen.width;
    }

    get height(){
        return this.pixiApp.screen.height;
    }
}

export default App;