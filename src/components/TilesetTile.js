import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import globals from "../data/globals";

export default class Tile extends PIXI.Container {
    constructor(xCoord, yCoord, physics, value, solid, tilesets) {
        super();
        this.pixelsPerMeter = globals.ppm;
        this.tileDimensions = 32;

        let tilesetName = "";
        let startingID = -Number.MAX_VALUE;



        for(let i = 0; i < tilesets.length; i++) {
            if(tilesets[i].firstgid <= value) {
                startingID = tilesets[i].firstgid;
                tilesetName = tilesets[i].source.toLowerCase().split(".tsx").join("Tileset");;
            }
        }

        if(tilesetName != "") {

            value -= startingID-1;
            let tileX;
            let tileY;
            let tileset = PIXI.Texture.from(tilesetName);
            let tilesetWidth = Math.floor(tileset.width / this.tileDimensions);

            tileX = (value % tilesetWidth)-1;
            tileY = (Math.floor(value / tilesetWidth));

            if(tileX < 0) {
                tileX = tilesetWidth-1;
                tileY--;
            }
    
            this.hitboxScale = this.pixelsPerMeter / 100;
    
            let tileSize = 32;
            let rect = new PIXI.Rectangle(this.tileDimensions * tileX, this.tileDimensions * tileY, this.tileDimensions, this.tileDimensions);
            let tileTexture = new PIXI.Texture(tileset, rect);
            this.sprite = new PIXI.Sprite(tileTexture);
    
            this.sprite.width = 50;
            this.sprite.height = 50;
    
            this.addChild(this.sprite);
    
            this.x = (xCoord - 1) * this.pixelsPerMeter;
            this.y = (yCoord - 1) * this.pixelsPerMeter;
    
            if(solid) {
                this.physicsBody = physics.createBody({
                    type: "static",
                    position: planck.Vec2(xCoord - this.hitboxScale, yCoord - this.hitboxScale)
                });
        
                this.physicsBody.createFixture({
                    shape: planck.Box(1 * this.hitboxScale, 1 * this.hitboxScale)
                });
            }
        }
    }
}