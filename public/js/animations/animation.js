export class Animation {
    constructor(name) {
        this.name = name;
        this.frameCount = 0;

        this.frames = [];
    }

    get currentFrame() {
        let expanded = [];
        let count = 0;
        let current = 0;
        let i = 0;

        while (count < this.length) {
            expanded.push(this.frames[i]);

            current++;
            count++;
            if (current === this.frames[i].frameLength) {
                i++;
                current = 0;
            }
        }

        return expanded[this.frameCount];
    }

    get length() {
        let len = 0;

        this.frames.forEach(f => {
            len += f.frameLength
        })

        return len;
    }

    update() {
        this.frameCount++;

        this.frameCount = this.frameCount % this.length;
    }

    reset() {
        this.frameCount = 0;
    }
}

export class AnimationFrame {
    constructor(frameLength) {
        this.frameLength = frameLength;

        this.spriteKeys = [];
    }
    
    addSprite(key) {
        this.spriteKeys.push(key);
    }
}

export class Animator {
    constructor(entity, defaultAnimation='default') {
        this.animationMap = new Map();
        this.rectMap = new Map();
        this.current = defaultAnimation;

        this.entity = entity;
    }

    get animationNames() {
        return Array.from(this.animationMap.keys());
    }

    get currentAnimation() {
        return this.animationMap.get(this.current);
    }

    get currentSpriteKeys() {
        if (this.currentAnimation) {
            return this.currentAnimation.currentFrame.spriteKeys;
        } else {
            return [];
        }
    }

    get currentRects() {
        return this.currentSpriteKeys.map(key => this.rectMap.get(key));
    }

    setGraphics() {
        this.rectMap.forEach((value, key) => {
            this.entity.graphics.addSprite(key, value);
        });
    }

    setAnimation(name) {
        if (this.current !== name) {
            console.log(name);

            if (this.currentAnimation) {
                this.currentAnimation.reset();
            }
            this.current = name;
        }
    }

    update() {
        if (this.currentAnimation) {
            this.entity.graphics.activeSprites = this.currentSpriteKeys;
            this.currentAnimation.update();
        } else {
            this.entity.graphics.activeSprites = [];
        }
    }
}
