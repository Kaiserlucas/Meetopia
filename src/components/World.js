import { Container, Sprite } from 'pixi.js';
import globals from "../data/globals";

export default class World extends Container {
    constructor() {
        super();
        this.mapContainer = new Container();
        this.playerContainer = new Container();
        this.foregroundContainer = new Container();
        this.namesContainer = new Container();

        this.addChild(this.mapContainer);
        this.addChild(this.playerContainer);
        this.addChild(this.foregroundContainer);
        this.addChild(this.namesContainer);
    }

}