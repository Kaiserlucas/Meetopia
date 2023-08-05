import GameApp from "./cycgame/App";
import Utils from "./cycgame/utils/Utils";
import assets_game from "./data/assets_game";
import assets_preload from "./data/assets_preload";
import PreloaderScreen from "./screens/PreloaderScreen";
import GameScreen from "./screens/GameScreen";
import StartScreen from "./screens/StartScreen";
import globals from "./data/globals";

class App extends GameApp{
    constructor() {
        super();
        this.query = Utils.getQueryParams();

        this.assets = {
            game: assets_game,
            preload: assets_preload,
        }

        this.colors = {
            green: 0x3c853c,
            darkgreen: 0x347434,
            yellow: 0xf2ef8b,
            darkyellow: 0xefea66,
            black: 0x000000,
            darkgrey: 0x222222,
            white: 0xffffff
        }
        
        this.init({
            version: globals.VERSION,
            backgroundColor: this.colors.green,
            showStats: globals.showFPS,
        });

        // register all screens
        this.screenManager.register("StartScreen", StartScreen);
        this.screenManager.register("GameScreen", GameScreen);
        this.screenManager.register("PreloaderScreen", PreloaderScreen);

        this.loader.register(this.assets.preload);

        this.loader.once("completed", () => {
            this.screenManager.addScreen("PreloaderScreen", {
                assets: this.assets.game,
                onComplete: () => {
                    this.screenManager.addScreen("StartScreen");
                }
            });
        });

        this.loader.load();
    }
}

export default new App();