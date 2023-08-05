import * as PIXI from 'pixi.js'; 
import Game from "../game/Game";

class GameScreen{
    constructor(options) {        
        this.view = new PIXI.Container();
        this.options = options;
        this.game = new Game(options);
        this.view.addChild(this.game.view);
    }   

    init(){
        //screen is added to stage and active
        if(this.game){
            this.game.init();
        }
    }

    resize(){
        //app should resize
        if (this.game) {
            this.game.resize();
        }
    }

    update(dt, dts){
        //update loop
        if(this.game){
            this.game.update(dt, dts);
        }
    }

}

export default GameScreen;