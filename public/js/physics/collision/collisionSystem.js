import { Vector2 } from "../../geometry.js";
import { getRectCollision } from "../rectCollision.js";

export class CollisionSystem {
    constructor(layer) {
        this.entity = layer;

        this.entities = [];
        this.others = null;

        this.test = null;
    }

    update() {
        if (this.test) {
            let pairs;
    
            if (this.others) {
                pairs = getPairs(this.entities, this.others);
            } else {
                pairs = getPermutations(this.entities);
            }
            
            const test = ([entity, other]) => {
                let result = this.test(entity, other);

                if (result) {
                    this.entity.events.emit('collision', entity, other, result);
                }
            }

            pairs.forEach(test);
        }
    }
}

function getPermutations(entities) {
    let pairs = [];
    let tested = [];

    entities.forEach(entity => {
        tested.push(entity);

        entities.filter(e => !tested.includes(e)).forEach(other => {
            pairs.push([entity, other]);
        });
    });

    return pairs;
}

function getPairs(entities, others) {
    let pairs = []

    entities.forEach(entity => {
        others.forEach(other => {
            pairs.push(entity, other);
        });
    });

    return pairs;
}


export function spriteRectCollision(entity, other) {
    return getRectCollision(entity.collision.rect, other.collision.rect);
}

export function adjustSpriteRects(entity, other) {
    let [ex, ey, ox, oy] = [
        ...entity.collision.rect.center,
        ...other.collision.rect.center
    ];

    let adjustment = new Vector2(ex - ox, ey - oy).scale(0.01);

    entity.physics.applyForce(adjustment.getCopy());
    other.physics.applyForce(adjustment.getCopy().scale(-1));
}