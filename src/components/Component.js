import * as PIXI from 'pixi.js';

export default class Component extends PIXI.utils.EventEmitter {
    constructor() {
        super();

        this.anchorX = 0; //base origin set by component, some are center, some topleft
        this.anchorY = 0; //base origin set by component, some are center, some topleft
        this.width = 0; //set and updated by component 
        this.height = 0; //set and updated by component 

        this.view = new PIXI.Container();
    }

    // position helper to layout different components with different sizes and origins
    setPosition(x, y, anchorX = 0.5, anchorY = 0.5) {
        this.setX(x, anchorX);
        this.setY(y, anchorY);
    }

    setX(x, anchorX = 0.5){
        this.view.x = x + (this.anchorX - anchorX) * this.width;
    }

    setY(y, anchorY = 0.5){
        this.view.y = y + (this.anchorY - anchorY) * this.height;
    }

    // returning the top side of component, ignoring rotation
    getTop() {
        return this.view.y - (this.anchorY * this.height);
    }

    // returning the bottom side of component, ignoring rotation
    getBottom() {
        return this.view.y + (this.anchorY * this.height);
    }
    
    // returning the left side of component, ignoring rotation
    getLeft() {
        return this.view.x - (this.anchorX * this.width);
    }

    // returning the right side of component, ignoring rotation
    getRight() {
        return this.view.x + (this.anchorX * this.width);
    }
}