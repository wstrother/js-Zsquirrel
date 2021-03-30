import { Rect } from '../geometry.js';
import { Animation, AnimationFrame } from './animation.js';

export class AnimationParser {
    constructor(expandLR=false) {
        this.defaultLength = null;
        this.defaultRectSize = null;
        this.animationJson = null;
        this.cellSize = null;

        this.expandLR = expandLR;
        this.rectMap = new Map();
        this.animatonMap = new Map();
    }

    getAnimationFrames(name) {
        let frames;

        this.animationJson.animations.forEach(anim => {
            if (anim.name === name) {
                frames = anim.frames;
            }
        });
        return frames;
    }

    expandMacros(json) {
        json.animations.forEach(animationJson => {
            if (!Array.isArray(animationJson.frames)) {
                animationJson.frames = this.getAnimationFrames(
                    animationJson.frames
                );
            }

            let frames = [];
            animationJson.frames.forEach(frame => {
                if (typeof(frame) === 'string') {
                    frames = frames.concat(this.getAnimationFrames(frame));
                }
                else {
                    frames.push(frame);
                }
            });
            animationJson.frames = frames;
            animationJson.mirrorOffsets = true;
        });

        return json;
    }

    expandLeftRight(json) {
        if (!this.cellSize) {
            throw Error("json.cellSize must be defined to use expandLeftRight");
        }

        let newAnimations = [];

        const checkDefault = (name) => {
            return !name.includes("_up") && !name.includes("_down")
        }

        let defaultAnimations = json.animations.filter(anim => checkDefault(anim.name));

        defaultAnimations.forEach(animationJson => {
            if (!animationJson.name.includes("_")) {
                let [mx, my] = animationJson.mirror || [false, false];
                mx = !mx;
                newAnimations.push({
                    name: animationJson.name + "_left",
                    mirror: [mx, my],
                    mirrorOffsets: true,
                    reverse: animationJson.reverse,
                    frameLength: animationJson.frameLength || this.defaultLength,
                    frames: this.getAnimationFrames(animationJson.name)
                });
            }
        })

        json.animations = json.animations.concat(newAnimations);

        return json;
    }

    parseFile(json) {
        this.animationJson = json;
        this.cellSize = json.cellSize;
        
        json = this.expandMacros(json);
        
        if (this.expandLR) {
            json = this.expandLeftRight(json);
        }

        this.defaultLength = json.frameLength || 1;
        this.defaultRectSize = json.size || [0, 0];
    
        json.animations.forEach(animJson => {
            this.animatonMap.set(animJson.name, this.parseAnimation(animJson));
        });
    }

    parseAnimation(json) {
        const animation = new Animation(json.name);
        const reverse = json.reverse;

        json.frames.forEach(frameJson => {
            animation.frames.push(this.parseFrame(
                frameJson,
                json.frameLength || this.defaultLength,
                json.size || this.defaultRectSize,
                json.mirror || [false, false],
                json.mirrorOffsets
            ));
        });

        if (reverse) {
            animation.frames.reverse();
        }
    
        return animation;
    }

    parseFrame(json, defaultLength, defaultSize, defaultMirror, mirrorOffsets) {
        const frame = new AnimationFrame(
            json.frameLength || defaultLength
        );
                
        if (json.rects) {
            json.rects.forEach(sub => {
                frame.addSprite(
                this.parseRect(
                    sub,
                    defaultSize,
                    defaultMirror,
                    sub.offset || [0, 0],
                    mirrorOffsets
                    )
                );
            });
        } else {
            frame.addSprite(
                this.parseRect(
                    json, 
                    defaultSize,
                    defaultMirror,
                    [0, 0],
                    mirrorOffsets
                )
            );
        }
    
        return frame;
    }

    getMirror(rectMirror, animMirror) {
        if (!rectMirror) {
            rectMirror = [false, false];
        }

        let [rmx, rmy] = rectMirror;
        let [amx, amy] = animMirror;

        if (amx) {
            rmx = !rmx;
        }

        if (amy) {
            rmy = !rmy;
        }

        return [rmx, rmy];
    }

    parseRect(json, defaultSize, defaultMirror, offset, mirrorOffsets) {
        let [ox, oy] = offset;
        let [mx, my] = this.getMirror(
            json.mirror,
            defaultMirror
        )

        let position = json.position;
        let size = json.size || defaultSize;
        let rect = json.rect;
        
        let [rw, rh] = size;
        let x, y;

        if (!rect) {    
            [x, y] = json.position;
            x *= rw;
            y *= rh;
        } else {
            [rw, rh, x, y] = rect;
            size = [rw, rh];
        }
        
        if (mirrorOffsets) {
            if (mx) {
                ox = this.cellSize[0] - (ox + rw);
            }
            if (my) {
                oy = this.cellSize[1] - (oy + rh);
            }
        }
        
        position = [x, y];

        let signature = [x, y, rw, rh, ox, oy, mx, my].join("_");

        if (!this.rectMap.has(signature)) {
            let rect = new Rect(x, y, rw, rh);
            rect.setMirror(mx, my);
            rect.setOffset(ox, oy);
            this.rectMap.set(signature, rect);
        }

        return signature;
    }

}