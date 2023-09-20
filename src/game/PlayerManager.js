import * as PIXI from 'pixi.js';
import Player from '../components/Player'
import * as planck from 'planck';
import globals from "../data/globals";

import GameManager from './GameManager'
import {getDistanceP1P2} from "../cycgame/utils/Math";

export default class PlayerManager {
    constructor(world, physics) {
        this.physics = physics;
        this.world = world;
        this.playerCounter = 0;

        this.players = new Map();
    }

    update(dts) {
        let mainPlayerPos = {x: this.mainPlayer.x, y: this.mainPlayer.y};
        let mainPlayerTilePos = {x: this.mainPlayer.x / globals.ppm, y: this.mainPlayer.y / globals.ppm};
        
        if(this.isPlayerInsideMeetingRoom(mainPlayerTilePos)) {
            this.players.forEach((player) =>{
                player.update(dts);
                let playerTilePos = {x: player.x / globals.ppm, y: player.y / globals.ppm};
                let videoManager = GameManager.getInstance().getVideoManager();
                if(this.isPlayerInsideMeetingRoom(playerTilePos)) {
                    videoManager.enableVideo(player.getId());
                } else {
                    videoManager.disableVideo(player.getId());
                }
            });
        } else {
            this.players.forEach((player) =>{
                player.update(dts);
    
                let otherPlayerPos = {x: player.x, y: player.y};
                let otherPlayerTilePos = {x: player.x / globals.ppm, y: player.y / globals.ppm};
                let playerDistance = getDistanceP1P2(mainPlayerPos, otherPlayerPos);
                let videoManager = GameManager.getInstance().getVideoManager();
                if(playerDistance < 300 && !this.isPlayerInsideMeetingRoom(otherPlayerTilePos)) {
                    videoManager.enableVideo(player.getId())
                } else if(playerDistance > 350 || this.isPlayerInsideMeetingRoom(otherPlayerTilePos)) {
                    videoManager.disableVideo(player.getId())
                }
            });
        }



        if(this.mainPlayer) {
            this.mainPlayer.update(dts);
        }
    }

    isPlayerInsideMeetingRoom(playerPos) {
        let meetingRoomCoords = {minX: 24, maxX: 36, minY: 5, maxY: 15};
        if(playerPos.x <= meetingRoomCoords.maxX && playerPos.x >= meetingRoomCoords.minX && playerPos.y <= meetingRoomCoords.maxY && playerPos.y >= meetingRoomCoords.minY) {
            return true;
        } else { 
            return false;
        }

    }

    setMainPlayerMovement(movementVector) {
        this.mainPlayer.setLinearVelocity(movementVector,0);
    }

    addMainPlayer(x, y, name) {
        this.mainPlayer = new Player(x, y, this.physics, name, true, "", this.world);
        this.world.playerContainer.addChild(this.mainPlayer);
    }

    addPlayer(x, y, name, id) {
        let newPlayer = new Player(x, y, this.physics, name, false, id, this.world);
        this.players.set(id, newPlayer);
        this.world.playerContainer.addChild(newPlayer);
    }

    changeUserName(username, id) {
        let player = this.players.get(id);
        player.changeName(username);
    }

    changeUserPosition(id, xCoord, yCoord, rotation, isMoving) {
        let player = this.players.get(id);
        if(player) {
            player.physicsBody.setTransform(planck.Vec2(xCoord / globals.ppm, yCoord / globals.ppm), 0);
            player.isMoving = isMoving;
            player.direction = rotation;
            player.setSprite(0)
        }
    }

    getMainPlayerName() {
        if(this.mainPlayer) {
            return this.mainPlayer.name;
        } else {
            return null;
        }
    }

    getMainPlayerXCoord() {
        if(this.mainPlayer) {
            return this.mainPlayer.x;
        } else {
            return null;
        }
    }

    getMainPlayerYCoord() {
        if(this.mainPlayer) {
            return (this.mainPlayer.y - this.mainPlayer.hitBoxYOffset);
        } else {
            return null;
        }
    }

    setMainPlayerId(id) {
        if(this.mainPlayer) {
            return this.mainPlayer.id = id;
        }
    }

    getMainPlayerId() {
        if(this.mainPlayer) {
            return this.mainPlayer.getId();
        } else {
            return null;
        }
    }

    getMainPlayerRotation() {
        if(this.mainPlayer) {
            return this.mainPlayer.direction;
        } else {
            return null;
        }
    }

    isMainPlayerMoving() {
        return this.mainPlayer.isMoving;
    }

    setMessageForPlayer(id, message) {
        let player = this.players.get(id);
        if(player) {
            player.changeMessage(message);
        } else if(this.mainPlayer.getId() == id) {
            this.mainPlayer.changeMessage(message);
        }
    }

    doesPlayerExist(id) {
        return this.players.has(id);
    }

    removePlayer(id) {
        const player = this.players.get(id);
        
        if (player) {
            this.world.namesContainer.removeChild(player.textContainer);
            player.parent.removeChild(player);
            player.physics.destroyBody(player.physicsBody);
            player.destroy();
            this.players.delete(id);
        }
    }
}