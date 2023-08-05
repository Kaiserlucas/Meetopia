import { Container, Graphics, Rectangle, Sprite } from 'pixi.js';
import app from '../app';
import KeyManager from '../cycgame/extra/KeyManager';
import * as planck from 'planck';
import globals from "../data/globals";
import tiledMap from "../data/maps/tiledMap";
import TilesetMap from '../components/TilesetMap'
import World from '../components/World'
import GameManager from './GameManager'
import { getDistanceP1P2, getDistanceVector, getVectorDirection, normalizeVector } from '../cycgame/utils/Math';


export default class Game {
    constructor(options) {
        this.view = new Container();
        this.options = options;
    }

    init() {
        this.pixelsPerMeter = globals.ppm;
        this.debug = new Graphics();
        this.key = new KeyManager();
        this.physics = planck.World({
            gravity: planck.Vec2(0.0, 0.0),
        });

        tiledMap.layers

        this.world = new World();

        GameManager.getInstance(this.world, this.physics, this.options.room);

        this.playerManager = GameManager.getInstance().getPlayerManager();
        this.networkManager = GameManager.getInstance().getNetworkManager();

        this.playerManager.addMainPlayer(21, 14, this.options.playerName);

        this.view.addChild(this.world);
        this.world.addChild(this.debug);

        this.tiledMap = new TilesetMap(tiledMap, this.world, this.physics)

          ////////////////////////////
         // Mouse / Touch movement //
        ////////////////////////////

        this.world.mapContainer.interactive = true;
        this.world.mapContainer.interactiveChildren = false;

        this.world.mapContainer.addListener('pointerdown', (event) => {
            this.pointerDown = true;
            this.movementVector = this.calculatePointerMovementVector(event.data.global);
        });

        this.world.mapContainer.addListener("pointermove", (event) => {
            if (this.pointerDown) {
                this.movementVector = this.calculatePointerMovementVector(event.data.global);
            }
        })
        this.world.mapContainer.addListener("pointerup", (event) => {
            this.movementVector = null;
            this.pointerDown = false;
        })
        this.world.mapContainer.addListener("pointerupoutside", (event) => {
            this.movementVector = null;
            this.pointerDown = false;
        })

        if(app.width < 500){
           GameManager.getInstance().getChatManager().disableChat();
        }


        // Copy url button
        const controlsContainer = document.getElementById('controls-container');

        const copyUrlButton = document.createElement('button');
        copyUrlButton.id = 'copy-url-button';
        copyUrlButton.title = 'Link zum Raum kopieren'

        const copyUrlIcon = document.createElement('i');
        copyUrlIcon.className = 'fas fa-clipboard';

        copyUrlButton.appendChild(copyUrlIcon);
        copyUrlButton.addEventListener('click', this.copyUrl.bind(this));
        controlsContainer.appendChild(copyUrlButton);

    }

    copyUrl() {
        // Get the base URL without query parameters
        const baseUrl = window.location.origin + window.location.pathname;
        const currentUrl = baseUrl + "?room=" + GameManager.getInstance().getNetworkManager().roomId;
    
        navigator.clipboard.writeText(currentUrl).then(() => {
            // Success feedback
            const copyUrlButton = document.getElementById('copy-url-button');
            copyUrlButton.innerHTML = '<i class="fas fa-clipboard-check"></i>';
            setTimeout(() => {
                copyUrlButton.innerHTML = '<i class="fas fa-clipboard"></i>';
            }, 1000);
        }, () => {
            console.error('Failed to copy URL');
        });
    }

    calculatePointerMovementVector(touchPosition) {
        let playerX = (this.playerManager.getMainPlayerXCoord() *this.world.scale.x) + this.world.x;
        let playerY = (this.playerManager.getMainPlayerYCoord() * this.world.scale.y) + this.world.y;

        let playerPosition = {x: playerX, y: playerY};
        
        return normalizeVector(getDistanceVector(touchPosition, playerPosition));
    }

    update(dt, dts) {
        this.tiledMap.update(dts);
        this.updatePhysics(dts);
        this.playerManager.update(dts);
        if(this.pointerDown) {
            this.playerManager.setMainPlayerMovement(this.movementVector);
        }
        this.networkManager.update(dts);
        this.updateCamera();

        this.world.mapContainer.hitArea = new Rectangle(
            -this.world.x / this.world.scale.x,
            -this.world.y / this.world.scale.y, 
            app.width / this.world.scale.x, 
            app.height  / this.world.scale.y);

    }

    updatePhysics(dts) {
        let velocityIterations = 6;
        let positionIterations = 2;

        this.physics.step(dts, velocityIterations, positionIterations);
    }

    updateCamera() {
        let worldScale = 1.0;
        // zoom out on small devices
        if(app.width < 500){
            worldScale = 0.80;
        }

        this.world.scale.set(worldScale);
        let pX = this.playerManager.getMainPlayerXCoord() * worldScale;
        let pY = this.playerManager.getMainPlayerYCoord() * worldScale;
        let worldX = -pX + app.width * 0.5;
        let worldY = -pY + app.height * 0.5;

        let minX = -(this.tiledMap.minX - 1) * this.pixelsPerMeter * worldScale; 
        let minY = -(this.tiledMap.minY - 1) * this.pixelsPerMeter * worldScale; 
        let maxX = -this.tiledMap.maxX * this.pixelsPerMeter * worldScale + app.width; 
        let maxY = -this.tiledMap.maxY * this.pixelsPerMeter * worldScale + app.height;

        // left
        if (worldX > minX){
            worldX = minX;
        }
        // top
        if(worldY > minY){
            worldY = minY;
        }
        // right
        if (worldX < maxX) {
            worldX = maxX;
        }
        // bottom
        if (worldY < maxY) {
            worldY = maxY;
        }

        this.world.x = worldX;
        this.world.y = worldY;

    }

    updatePhysicsDebugView() {
        this.debug.clear();
        this.debug.lineStyle(1, 0x00ff2a, 1);

        for (let b = this.physics.getBodyList(); b; b = b.getNext()) {
            var p = b.getWorldCenter();
            let wpX = p.x * this.pixelsPerMeter;
            let wpY = p.y * this.pixelsPerMeter;
            for (var fixture = b.getFixtureList(); fixture; fixture = fixture.getNext()) {
                var shape = fixture.getShape();

                var type = shape.getType();
                if (type == "polygon") {
                    this.debug.moveTo(shape.getVertex(0).x * this.pixelsPerMeter + wpX, shape.getVertex(0).y * this.pixelsPerMeter + wpY);
                    for (var v = 1; v < shape.m_count; v++) {
                        this.debug.lineTo(shape.getVertex(v).x * this.pixelsPerMeter + wpX, shape.getVertex(v).y * this.pixelsPerMeter + wpY);
                    }
                    this.debug.lineTo(shape.getVertex(0).x * this.pixelsPerMeter + wpX, shape.getVertex(0).y * this.pixelsPerMeter + wpY);
                } else if(type == "circle") {
                    var r = shape.getRadius();
                    this.debug.drawCircle(wpX,wpY,r * this.pixelsPerMeter);
                } else {
                    console.log("Unknown type :",type);
                }

            }
        }
    }

    resize() {

    }
}