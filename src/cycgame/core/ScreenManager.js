import * as PIXI from 'pixi.js';

class ScreenManager {
    constructor(engine){
        this.engine = engine;
        this.screen = null;
        this.view = new PIXI.Container();
        this.screenView = new PIXI.Container();
        this.map = {};

        this.view.addChild(this.screenView);
        this.loading = false;
    }

    register(id, screen) {
        this.map[id] = screen;
    }

    getScreen(id, options) {
        if (this.map[id]) {
            return new this.map[id](options);
        }
        return null;
    }

    addScreen(screen, options){
        if (typeof screen == "string") {
            //replace string id with actual screen instance
            screen = this.getScreen(screen, options);
        }

        this.removeScreen();

        this.screen = screen;

        // add new screen
        this.screen.init();
        this.screenView.addChild(this.screen.view);
        this.screen.resize();
    }

    removeScreen(){
        if (this.screen){
            this.screenView.removeChild(this.screen.view);
            this.screen = null;
        }
    }

    resize() {
        if (this.screen){
            this.screen.resize();
        }
    }

    update(dt, dts){
        if (this.screen){
            this.screen.update(dt, dts);
        }
    }
}




export default ScreenManager;