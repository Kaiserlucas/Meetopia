import { Container } from 'pixi.js';
import TilesetTile from '../components/TilesetTile'
import globals from "../data/globals";
import GameManager from '../game/GameManager';
import app from '../app';

export default class TilesetMap {
    constructor(map, world, physics) {
        this.world = world;
        this.physics = physics;
        this.mapInfo = this.convertMapFormats(map);
        map = this.mapInfo.map;
        this.tilesets = this.mapInfo.tilesets;

        this.backgroundTileContainer = new Container();
        this.foregroundTileContainer = new Container();
        this.world.mapContainer.addChild(this.backgroundTileContainer);
        this.world.foregroundContainer.addChild(this.foregroundTileContainer);
        

        this.playerManager = GameManager.getInstance().getPlayerManager()
        this.pixelsPerMeter = globals.ppm;
        this.cullingWidth = 2;
        this.cullingHeight = 2;

        const filteredMapData = map.mapData.flat().filter(tile => tile.tile !== 0);

        // Calculating the min and max values
        this.maxX = filteredMapData.reduce((max, tile) => Math.max(max, tile.xCoord), Number.MIN_VALUE);
        this.maxY = filteredMapData.reduce((max, tile) => Math.max(max, tile.yCoord), Number.MIN_VALUE);
        this.minX = filteredMapData.reduce((min, tile) => Math.min(min, tile.xCoord), Number.MAX_VALUE);
        this.minY = filteredMapData.reduce((min, tile) => Math.min(min, tile.yCoord), Number.MAX_VALUE);

        this.MaxX = 0;
        this.MaxY = 0;
        this.MinY = 0;
        this.MaxY = 0;
        this.tiles = Array(this.maxX+1).fill().map(() => Array(this.maxY).fill(null));
        this.furniture = Array(this.maxX+1).fill().map(() => Array(this.maxY).fill(null));

        map.mapData.forEach(layer => {
            layer.forEach(tile => {
                let newTile = new TilesetTile(
                    tile.xCoord,
                    tile.yCoord,
                    this.physics,
                    tile.tile,
                    tile.layerProperties[1].value,
                    this.tilesets,
                )



                if(!this.tiles[tile.xCoord]) {
                    this.tiles[tile.xCoord] = [];
                }
                
                if(!this.tiles[tile.xCoord][tile.yCoord]) {
                    this.tiles[tile.xCoord][tile.yCoord] = [];
                }

                // Add the new tile to the array at these coordinates
                this.tiles[tile.xCoord][tile.yCoord].push(newTile);
                
                if(tile.layerProperties[0].value) {
                    this.foregroundTileContainer.addChild(newTile);
                } else {
                    this.backgroundTileContainer.addChild(newTile);
                }

            });
        });

        console.log("//available tiles:", world.children)

        let playerX = this.pixelsToTiles(this.playerManager.getMainPlayerXCoord());
        let playerY = this.pixelsToTiles(this.playerManager.getMainPlayerYCoord());

        playerX = this.capX(playerX);
        playerY = this.capY(playerY);

        this.MaxX = this.maxX +1;
        this.MinX = this.minX;
        this.MaxY = this.maxY +1;
        this.MinY = this.minY;

        this.maxWidth = this.MaxX;
        this.maxHeight = this.MaxY;

        this.timeUntilNextCull = 0;

        this.updateTiles();

    }

    //Convert Tiled Export format into something a processed form
    convertMapFormats(map) {
        let newMap = {};
    
        newMap.mapData = map.layers.map(layer => {
            let layerProperties = layer.properties;
            let chunks = layer.chunks;
    
            return chunks.flatMap(chunk => {
                let mapInfo = chunk.data;
                let tilesetWidth = chunk.width;
                let chunkX = chunk.x;
                let chunkY = chunk.y;
                let chunkWidth = chunk.width;
    
                return mapInfo.map((value, index) => ({
                    xCoord:((index % chunkWidth)+chunkX), 
                    yCoord: Math.floor((index / chunkWidth) +chunkY), 
                    tile:value, 
                    isSolid:false, 
                    layerProperties: layerProperties
                }));
            }).filter((tile) => tile.tilesetX != 0 || tile.tilesetY != 0);
        });

        let mapInfo = {map:newMap,tilesets:map.tilesets};
    
        return mapInfo;
    }

    updateTiles() {

        let playerPosX = this.playerManager.getMainPlayerXCoord();
        let playerPosY = this.playerManager.getMainPlayerYCoord();

        playerPosX = this.pixelsToTiles(playerPosX);
        playerPosY = this.pixelsToTiles(playerPosY);

        this.cullingWidth = Math.round(app.width / 2 / (globals.ppm * this.world.scale.x))+1;
        this.cullingHeight = Math.round(app.height / 2 / (globals.ppm * this.world.scale.y))+1;

        this.cullingWidth += 4;
        this.cullingHeight += 4;

        playerPosX = this.capX(playerPosX);
        playerPosY = this.capY(playerPosY);

        let newMaxX = this.capX(playerPosX + this.cullingWidth + 1);
        let newMinX = this.capX(playerPosX - this.cullingWidth + 1);
        let newMaxY = this.capY(playerPosY + this.cullingHeight + 1);
        let newMinY = this.capY(playerPosY - this.cullingHeight + 1);

        if(newMaxX == this.maxX+1) {
            newMinX = (this.maxX+1)-(this.cullingWidth*2) -1;
        }
        if(newMaxY == this.maxY+1) {
            newMinY = (this.maxY)-(this.cullingHeight*2) -1;
        }
        if(newMinX == this.minX) {
            newMaxX = (this.minX)+(this.cullingWidth*2);
        }

        if(newMinY == this.minY) {
            newMaxY = (this.minY)+(this.cullingHeight*2);
        }

        newMinX = this.capCullingWidth(newMinX);
        newMinY = this.capCullingHeight(newMinY);
        newMaxX = this.capCullingWidth(newMaxX);
        newMaxY = this.capCullingHeight(newMaxY);

        for(let x = Math.min(this.MinX,newMinX); x < Math.max(this.MaxX,newMaxX); x++) {
            for(let y = Math.min(this.MinY,newMinY); y < Math.max(this.MaxY,newMaxY); y++) {
                let tiles = this.tiles[x][y];
                if(tiles) {
                    if(x < newMinX || x >= newMaxX || y < newMinY || y >= newMaxY) {
                        tiles.forEach(tile => {
                            tile.visible = false;
                        });
                    } else if(x > this.MinX ||  x < this.MaxX || y > this.MinY ||  y < this.MaxY ) {
                        tiles.forEach(tile => {
                            tile.visible = true;
                        });
                    }
                }  
            }
        }

        this.MaxX = newMaxX;
        this.MinX = newMinX;
        this.MaxY = newMaxY;
        this.MinY = newMinY;
    }

    capX(playerXPos) {
        return Math.min(this.maxX+1, Math.max(this.minX, playerXPos));
    }

    capY(playerYPos) {
        return Math.min(this.maxY+1, Math.max(this.minY, playerYPos));
    }

    capCullingWidth(value) {
        return Math.min(Math.max(0,value),this.maxWidth);
    }

    capCullingHeight(value) {
        return Math.min(Math.max(0,value),this.maxHeight);
    }

    pixelsToTiles(pixelsCoord) {
        return Math.round(pixelsCoord / globals.ppm)
    }

    update(dts) {
        this.timeUntilNextCull -= dts;

        if(this.timeUntilNextCull <= 0) {
            this.updateTiles();
            this.timeUntilNextCull = globals.cullingUpdateTime;
        }


    }
}