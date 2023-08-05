import * as PIXI from 'pixi.js';
import app from "../app";
import TextButton from '../components/TextButton';

class StartScreen {
    constructor(options) {
        this.time = 0;
        this.view = new PIXI.Container();

        this.bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.bg.tint = app.colors.green;

        let style = {
            fontFamily: 'Tomarik_Brush',
            fontSize: 130,
            lineHeight: 1.2,
            fill: app.colors.white,
        }
        this.titleText = new PIXI.Text("Meetopia", style);

        this.btnStart = new TextButton({
            text: "Start",
            borderRoundness: 0.2,
            fontColor: app.colors.darkgrey,
            fontFamily: 'Tomarik_Brush',
            backgroundColor: app.colors.darkyellow,
            hoverBackgroundColor: app.colors.yellow,
        })

        this.btnStart.interactive = true;
        this.btnStart.buttonMode = true;
        this.btnStart.on("pointertap", this.onContinue.bind(this));

        this.view.addChild(this.bg);
        this.view.addChild(this.titleText);
        this.view.addChild(this.btnStart.view);

        this.nameInputLabel = document.createElement("label");
        this.nameInputLabel.className = "pixi-input-label";
        this.nameInputLabel.htmlFor = 'player-name';
        this.nameInputLabel.textContent = "Name";

        document.body.appendChild(this.nameInputLabel);

        this.nameInput = document.createElement("input");
        this.nameInput.className = "pixi-input";
        this.nameInput.id = 'player-name';
        this.nameInput.type = 'text';

        let playerNameCookie = this.getCookie("playerName");
        if(playerNameCookie != "") {
            this.nameInput.value = playerNameCookie;
        } else {
            this.nameInput.value = "Gast";
        }

        document.body.appendChild(this.nameInput);

        let params = new URLSearchParams(window.location.search);
        this.room = params.get('room');
    }

    init() {
    }

    onContinue() {
        const playerName = this.nameInput.value;
        document.cookie = `playerName=${playerName}; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/`;
        this.nameInput.style.display = 'none';
        this.nameInputLabel.style.display = 'none';
        app.screenManager.addScreen("GameScreen", {playerName: playerName, room: this.room});
    }

    onTestScreen() {
        app.screenManager.addScreen("TestScreen");
    }

    getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    resize() {
        this.bg.width = app.width;
        this.bg.height = app.height;

        this.titleText.anchor.set(0.5, 0.5);
        this.titleText.position.set(app.width * 0.5, app.height * 0.5);

        this.titleText.updateTransform();
        if (app.width * 0.8 < this.titleText.texture.width){
            this.titleText.scale.set((app.width * 0.8) / this.titleText.texture.width);
        }
        
        this.btnStart.setPosition(app.width * 0.5, this.titleText.y + this.titleText.height * 0.5 + 20, 0.5, 0.0);

        this.nameInputLabel.style.top = `${window.innerHeight * 0.85 - this.nameInputLabel.offsetHeight - 15}px`;
        this.nameInputLabel.style.left = '50%';
        this.nameInputLabel.style.transform = 'translateX(-50%)';

        this.nameInput.style.top = `${window.innerHeight * 0.85}px`;
        this.nameInput.style.left = '50%';
        this.nameInput.style.transform = 'translateX(-50%)';
        

    }

    update(dt, dts) {
        this.time += dts;
    }

}

export default StartScreen;