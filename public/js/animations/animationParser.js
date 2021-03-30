import { Rect } from '../geometry.js';
import { Animation, AnimationFrame } from './animation.js';

export class AnimationParser {
    constructor() {
        this.defaultLength = null;
        this.defaultRectSize = null;
        this.animationJson = null;

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
        });

        return json;
    }

    parseFile(json) {
        this.animationJson = json;
        json = this.expandMacros(json);

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
                json.mirror || [false, false]
            ));
        });

        if (reverse) {
            animation.frames.reverse();
        }
    
        return animation;
    }

    parseFrame(json, defaultLength, defaultSize, defaultMirror) {
        const frame = new AnimationFrame(
            json.frameLength || defaultLength
        );
                
        if (json.rects) {
            json.rects.forEach(sub => {
                frame.addSprite(
                this.parseRect(
                    sub,
                    defaultSize,
                    json.mirror || defaultMirror,
                    sub.offset || [0, 0]
                    )
                );
            });
        } else {
            frame.addSprite(
                this.parseRect(
                    json, 
                    defaultSize,
                    json.mirror || defaultMirror
                )
            );
        }
    
        return frame;
    }

    parseRect(json, defaultSize, defaultMirror, offset=[0, 0]) {
        let [ox, oy] = offset;
        let [mx, my] = json.mirror || defaultMirror;

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