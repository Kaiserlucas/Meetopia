import { Container, Point, Sprite, Text, Texture, Rectangle } from 'pixi.js';
import KeyManager from '../cycgame/extra/KeyManager';
import { getVectorDirection, normalizeVector } from '../cycgame/utils/Math';
import * as planck from 'planck';
import globals from "../data/globals";

const messageDuration = 7;

export default class Player extends Container {

    constructor(x, y, physics, name, isMainPlayer, id, world) {
        super();

        this.isMainPlayer = isMainPlayer;
        this.idleTileset = Texture.from("idle");
        this.walkTileset = Texture.from("walk");

        this.hitBoxYOffset = -15;

        this.direction = 0;
        this.animCounter = 0;
        this.animDuration = 0.1;
        this.animLimit = this.animDuration * 6;

        this.rightOffset = 0*96
        this.upOffset = 1*96
        this.leftOffset = 2*96
        this.downOffset = 3*96

        this.spriteHeight = 23;
        this.spriteWidth = 16;
        this.idleRightTexture = new Texture(this.idleTileset,new Rectangle(0,0,this.spriteWidth,this.spriteHeight));
        this.idleUpTexture = new Texture(this.idleTileset,new Rectangle(16,0,this.spriteWidth,this.spriteHeight));
        this.idleLeftTexture = new Texture(this.idleTileset,new Rectangle(32,0,this.spriteWidth,this.spriteHeight));
        this.idleDownTexture = new Texture(this.idleTileset,new Rectangle(48,0,this.spriteWidth,this.spriteHeight));
        this.sprite = new Sprite(this.idleDownTexture);

        this.key = new KeyManager();
        this.movementVector = new Point(0, 0);
        this.movementSpeed = 5;

        this.id = id;
        this.physics = physics;
        this.name = name;

        this.colliderRadius = 12;
        if(this.isMainPlayer) {
            this.physicsBody = this.physics.createBody({
                type: "dynamic",
                position: planck.Vec2(1 * x, 1 * y)
            });
        } else {
            this.physicsBody = this.physics.createBody({
                type: "static",
                position: planck.Vec2(1 * x, 1 * y)
            });
        }

        this.physicsBody.createFixture({
            shape: planck.Circle(this.colliderRadius / globals.ppm),
            density: 1.0,
            friction: 0.3,
        });

        this.x = this.physicsBody.getPosition().x * globals.ppm;
        this.y = this.physicsBody.getPosition().y * globals.ppm;

        var text = new Text(name, {
            fontFamily: "Arial",
            fontSize: 15,
            fill: "white",
            align: "center",
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowAngle: Math.PI / 6,
            dropShadowBlur: 4,
            dropShadowDistance: 6,
            stroke: '#000000',
            strokeThickness: 3
        });
        
        text.position.y = -25;
        text.anchor.set(0.5, 1.0);
        text.interactive = false;

        this.nameText = text;

        this.sprite.anchor.set(0.5);
        this.sprite.scale.set((80 / this.sprite.texture.height) / 1.5);
        this.spriteContainer = new Container();
        this.spriteContainer.addChild(this.sprite);

        this.textContainer = new Container();
        this.textContainer.addChild(text);

        this.addChild(this.spriteContainer);

        var messageText = new Text("", {
            fontFamily: "Arial",
            fontSize: 12,
            fill: "white",
            align: "center",
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowAngle: Math.PI / 6,
            dropShadowBlur: 4,
            dropShadowDistance: 6,
            stroke: '#000000',
            strokeThickness: 3
        });
        
        messageText.position.y = -50;
        messageText.anchor.set(0.5, 1.0);
        messageText.interactive = false;

        this.messageText = messageText;
        this.textContainer.addChild(messageText);

        world.namesContainer.addChild(this.textContainer);

        this.messageCounter = 0;
    }

    update(dts) {

        if(this.isMainPlayer) {
            this.updateMovement(dts)
        }

        this.animCounter = (this.animCounter + dts) % this.animLimit;

        this.x = this.physicsBody.getPosition().x * globals.ppm;
        this.y = (this.physicsBody.getPosition().y * globals.ppm)+this.hitBoxYOffset;

        if(this.messageCounter > 0) {
            this.messageCounter -= 1*dts;
        }

        if(this.messageCounter <= 0) {
            this.messageText.text = "";
        }

        this.textContainer.x = this.x;
        this.textContainer.y = this.y;
    }

    updateMovement(dts){

        this.movementVector.x = 0;
        this.movementVector.y = 0;
    
        if (this.key.isDown("ArrowLeft") || this.key.isDown("KeyA")) {
            this.movementVector.x -= 1;
        }
        if (this.key.isDown("ArrowRight") || this.key.isDown("KeyD")) {
            this.movementVector.x += 1;
        }
        if (this.key.isDown("ArrowUp") || this.key.isDown("KeyW")) {
            this.movementVector.y -= 1;
        }
        if (this.key.isDown("ArrowDown") || this.key.isDown("KeyS")) {
            this.movementVector.y += 1;
        }
    
        normalizeVector(this.movementVector);

        this.setLinearVelocity(this.movementVector,dts);
    }

    setLinearVelocity(movementVector,dts) {
        this.movementVector = {x: movementVector.x, y:movementVector.y};
        let newVelocity = planck.Vec2(this.movementVector.x * this.movementSpeed, this.movementVector.y * this.movementSpeed);
        this.physicsBody.setLinearVelocity(newVelocity);

        this.x = this.physicsBody.getPosition().x * globals.ppm;
        this.y = (this.physicsBody.getPosition().y * globals.ppm)+this.hitBoxYOffset;

        if(this.movementVector.x != 0 || this.movementVector.y != 0){
            this.isMoving = true;
            this.direction = getVectorDirection(this.movementVector);
        } else {
            this.isMoving = false;
        }

        this.setSprite(dts);
    }

    setSprite(dts) {



        if(this.isMoving){
            let currentAnim = Math.floor(this.animCounter / this.animDuration);

            if(this.direction >= 0.8 && this.direction <=2.4) {
                this.walkTexture = new Texture(this.walkTileset,new Rectangle(this.downOffset + (currentAnim* this.spriteWidth),0,this.spriteWidth,this.spriteHeight));
                this.sprite.texture = this.walkTexture;
            } else if( this.direction >= -0.8 && this.direction < 0.8) {
                this.walkTexture = new Texture(this.walkTileset,new Rectangle(this.rightOffset + (currentAnim* this.spriteWidth),0,this.spriteWidth,this.spriteHeight));
                this.sprite.texture = this.walkTexture;
            } else if(this.direction < -0.8 && this.direction >= -2.4) {
                this.walkTexture = new Texture(this.walkTileset,new Rectangle(this.upOffset + (currentAnim* this.spriteWidth),0,this.spriteWidth,this.spriteHeight));
                this.sprite.texture = this.walkTexture;
            } else {
                this.walkTexture = new Texture(this.walkTileset,new Rectangle(this.leftOffset + (currentAnim* this.spriteWidth),0,this.spriteWidth,this.spriteHeight));
                this.sprite.texture = this.walkTexture;
            }

        } else {

            if(this.direction >= 0.8 && this.direction <=2.4) {
                this.sprite.texture = this.idleDownTexture;
            } else if( this.direction >= -0.8 && this.direction < 0.8) {
                this.sprite.texture = this.idleRightTexture;
            } else if(this.direction < -0.8 && this.direction >= -2.4) {
                this.sprite.texture = this.idleUpTexture;
            } else {
                this.sprite.texture = this.idleLeftTexture;
            }
        }
    }

    changeName(newName) {
        this.nameText.text = newName;
        this.name = newName;
    }

    changeMessage(message) {
        this.messageText.text = message;
        this.messageCounter = messageDuration;
    }

    getId() {
        if(this.id) {
            return this.id;
        } else {
            return null;
        }
    }
}