import { ImageSubGraphics } from "../graphics.js";

export class AnimationGraphics extends ImageSubGraphics {
    constructor(entity, imageResource) {
        super(entity, imageResource);
        this.spriteMap = new Map();
        this.activeSprites = [];
    }

    addFrameSprite(key, rect) {
        this.addRect(rect);
        this.spriteMap.set(key, this.sprites[this.sprites.length - 1]);
    }

    draw(container) {
        let sprites = this.activeSprites.map(key => this.spriteMap.get(key));
        
        sprites.forEach(sprite => {
            this.drawSprite(container, sprite, this.entity.position);
        });
    }
}