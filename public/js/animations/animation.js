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
        if (this.frameCount >= this.length) {
            this.frameCount = 0;
        }
    }
}

export class AnimationFrame {
    constructor(frameLength) {
        this.frameLength = frameLength;

        this.sprites = [];
    }
    
    addSprite(key) {
        this.sprites.push(key);
    }
}


