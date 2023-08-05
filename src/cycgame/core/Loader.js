import * as PIXI from 'pixi.js';

// https://pixijs.download/dev/docs/PIXI.Loader.html

class Loader extends PIXI.utils.EventEmitter{
    constructor(engine) {
        super();
        this.engine = engine;
        this.loader = this.engine.pixiApp.loader;
        this.renderer = this.engine.pixiApp.renderer;

        //add version to all loaded assets!
        this.loader.pre((resource, next) => {
            const url = resource.url;
            if (~url.indexOf(".json") || ~url.indexOf(".png") || ~url.indexOf(".jpg") || ~url.indexOf(".mp3")) {
                resource.url = resource.url + "?v=" + this.engine.version;
            }
            next();
        })
        this.loader.onProgress.add(this.progress.bind(this));
        this.loader.onComplete.add(this.completed.bind(this));
        this.loader.onError.add(this.error.bind(this));
        this.resources = this.loader.resources;
    }

    register(array) {
        array.forEach(info => {
            if (!this.resources[info.name]){
                this.loader.add(info.name, info.url);
            }else{
                console.log("//Loader:already loaded asset:", info);
            }
        });
    }

    load() {
        this.loader.load();
    }

    progress(loader, resource) {
        this.emit("progress", loader.progress);
    }

    completed() {
        this.emit("completed");

    }

    error() {
        this.emit("error");
    }
}

export default Loader;