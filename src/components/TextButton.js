import { NineSlicePlane, Text, TextMetrics, Texture } from 'pixi.js';
import Component from './Component';

export default class TextButton extends Component {
    constructor(obj) {
        super();

        this.config = Object.assign({
            text: "",
            fontColor: 0x4d8aeb,
            fontSize: 28,
            fontFamily: 'Arial',
            backgroundColor: 0x09224a,
            hoverBackgroundColor: 0x19335a,
            width: 210,
            paddingX: 18,
            paddingY: 12,
        }, obj);

        this.anchorX = 0.5;
        this.anchorY = 0.5;

        this.text = new Text(this.config.text);
        this.hover = false;
        let off = 85;
        this.bg = new NineSlicePlane(Texture.from("scale_rounded_border"), off, off, off, off);

        this.view.addChild(this.bg);
        this.view.addChild(this.text);

        this.view.interactive = true;
        this.view.buttonMode = true;
        this.view.on("pointerover", (e) => {
            this.hover = true;
            this.updateState();
        });
        this.view.on("pointerout", (e) => {
            this.hover = false;
            this.updateState();
        });
        this.view.on("pointertap", (e) => {
            this.emit("pointertap", e);
        });

        this.updateState();
    }

    updateState() {
        this.text.text = this.config.text;
        this.text.anchor.set(0.5);
        this.text.style.fontFamily = this.config.fontFamily;
        this.text.style.fontSize = this.config.fontSize;
        this.text.style.align = "center";
        this.text.style.fill = this.config.fontColor;

        let fixedWidth = this.config.width;
        let maxTextWidth = fixedWidth - this.config.paddingX * 2

        let textMetrics = TextMetrics.measureText(this.text.text, this.text.style);

        if(textMetrics.maxLineWidth > maxTextWidth * 2 && textMetrics.lines.length == 1){
            //force two line button
            this.text.style.wordWrap = true
            this.text.style.wordWrapWidth = textMetrics.maxLineWidth * 0.7;
        }

        let textMetrics2 = TextMetrics.measureText(this.text.text, this.text.style);

        // shrink text, to fit in fixedWidth Button
        if (this.text.width < maxTextWidth) {
            this.text.scale.set(1.0);
        } else {
            this.text.scale.set(maxTextWidth / textMetrics2.maxLineWidth);
        }

        if(this.hover){
            this.bg.tint = this.config.hoverBackgroundColor;
        } else {
            this.bg.tint = this.config.backgroundColor;
        }
        this.bg.width = fixedWidth;
        this.bg.height = this.text.height + this.config.paddingY * 2;
        this.bg.x = -this.bg.width * 0.5;
        this.bg.y = -this.bg.height * 0.5;

        this.width = this.bg.width;
        this.height = this.bg.height;
    }
}