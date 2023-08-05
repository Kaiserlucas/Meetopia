import * as PIXI from 'pixi.js';
import app from "../app";
import { v4 as uuidv4 } from 'uuid';

class PreloaderScreen{
    constructor(options = {}) {        
        this.view = new PIXI.Container();
        this.time = 0;
        this.percentage = 0.0;
        this.minLoadingTimeSec = 0.5;
        this.loaded = false;
        this.completed = false;
        this.onComplete = options.onComplete;

        this.assets = options.assets || [];

        this.imageWidth = 650;
        this.progressWidth = 270;

        this.bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.bg.tint = app.colors.green;

        this.progressBg = PIXI.Sprite.from("preload_bar_bg");
        this.progressBar = PIXI.Sprite.from("preload_bar_progress");
        this.progressBarMask = PIXI.Sprite.from("preload_bar_progress");

        this.progressBg.tint = app.colors.darkgreen;
        this.progressBar.tint = app.colors.yellow;

        this.view.addChild(this.bg);
        this.view.addChild(this.progressBg);
        this.view.addChild(this.progressBar);
        this.view.addChild(this.progressBarMask);

        this.progressBar.mask = this.progressBarMask;

        let params = new URLSearchParams(window.location.search);
        this.room = params.get('room');
  
        if(!this.room) {
            let roomId=uuidv4();
            var currentUrl = window.location.href;
            var newUrl = currentUrl + '?room='+roomId;
            window.location.href = newUrl;
        }
    }   

    init(){
        //screen is added to stage and active

        app.loader.register(this.assets);

        app.loader.on("progress", (progress) => {
            this.percentage = progress / 100;
        });

        app.loader.once("completed", () => {
            this.loaded = true;
            this.percentage = 1.0;
        });

        app.loader.load();
    }

    complete(){
        if (this.completed){
            return;
        }
        this.completed = true;
        if(this.onComplete){
            this.onComplete();
        }
    }

    resize(){
        //app should resize
        this.bg.width = app.width;
        this.bg.height = app.height;

        this.progressBg.scale.set(this.progressWidth / this.progressBg.texture.width);
        this.progressBar.scale.set(this.progressBg.scale.x, this.progressBg.scale.y);
        this.progressBarMask.scale.set(this.progressBg.scale.x, this.progressBg.scale.y);

        let offX = (this.progressBg.width - this.progressBar.width) * 0.5;
        let offY = (this.progressBg.height - this.progressBar.height) * 0.5;
        this.progressBg.position.set(app.width * 0.5 - this.progressBg.width * 0.5, app.height * 0.5 - this.progressBg.height * 0.5 + offY);
        this.progressBar.position.set(this.progressBg.x + offX, this.progressBg.y + offY);
        this.progressBarMask.position.set(this.progressBar.x, this.progressBar.y);
    }

    updateProgressBarState(perc){
        this.progressBarMask.x = this.progressBar.x - ((1 - perc) * this.progressBarMask.width);
    }

    update(dt, dts){
        this.time += dts;

        this.updateProgressBarState(this.percentage);

        if (this.loaded && this.time > this.minLoadingTimeSec && this.percentage >= 1.0){
            this.complete();
        }
    }

}

export default PreloaderScreen;