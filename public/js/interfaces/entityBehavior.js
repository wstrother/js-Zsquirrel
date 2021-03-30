import { Vector2 } from "../geometry.js";
import { StateMachine } from "../stateMachine.js";


class Movement {
    constructor(entity) {
        this.entity = entity;
        this._heading = new Vector2(1, 0);
    }

    get heading() {
        return this._heading.coordinates;
    }

    get x() {
        return this._heading.x;
    }

    get y() {
        return this._heading.y;
    }

    get dirString() {
        let [x, y] = this.heading;

        if (x == 1) {
            return 'right';
        }

        if (x == -1) {
            return 'left';
        }

        if (y == -1) {
            return 'up';
        }

        if (y == 1) {
            return 'down';
        }

        return '';
    }

    reverse() {
        this._heading.x *= -1;
    }

    update() {
        let pivot = this.entity.animator.current.includes('pivot');

        if (pivot && animation_done(this.entity)) {
            console.log("Heading changed");
            this.reverse();
        }
    }
}


export class EntityBehaviorInterface {
    constructor(context) {
        this.context = context;
    }

    setAnimationMachine(entity, controller) {
        let stateMachine = new StateMachine('default');

        entity.addComponent('states', stateMachine);
        entity.addComponent('movement', new Movement(entity));

        entity.updateMethods.push(() => {
            entity.animator.setAnimation(
                this.getAnimationName(entity)
            );
        });

        stateMachine.addState(
            'default',
            () => {
                if (dpad_forward(entity, controller)) {
                    return 'walk';
                }

                if (dpad_backward(entity, controller)) {
                    return 'pivot';
                }
            }
        );

        stateMachine.addState(
            'walk',
            () => {
                if (!dpad_forward(entity, controller)) {
                    return 'default';
                }
            }
        );

        stateMachine.addState(
            'pivot',
            () => {
                if (animation_done(entity)) {
                    return 'default';
                }
            }
        );
    }

    getAnimationName(entity) {
        let state = entity.states.state;
        let names = entity.animator.animationNames

        if (!state) {
            state = "default";
        }

        let dirState = `${state}_${entity.movement.dirString}`;

        if (names.includes(dirState)) {
            return dirState;
        }
        else if (names.includes(state)) {
            return state;
        } else {
            return "default";
        }
    }
}


function animation_done(entity) {
    let animation = entity.animator.currentAnimation;

    return (animation.frameCount === animation.length - 1)
}


function dpad_forward(entity, controller) {
    let [u, d, l, r] = ["up", "down", "left", "right"].map(d => controller.devices.get(d));

    let [dx, dy] = [0, 0];
    
    // if (u.held) { dy = -1 }
    // if (d.held) { dy = 1 }
    if (l.held) { dx = -1 }
    if (r.held) { dx = 1 }

    let forward = Math.sign(dx) === Math.sign(entity.movement.x);

    return forward;
}

function dpad_backward(entity, controller) {
    let [u, d, l, r] = ["up", "down", "left", "right"].map(d => controller.devices.get(d));

    let [dx, dy] = [0, 0];
    
    // if (u.held) { dy = -1 }
    // if (d.held) { dy = 1 }
    if (l.held) { dx = -1 }
    if (r.held) { dx = 1 }

    let backward = Math.sign(dx) === -Math.sign(entity.movement.x);

    return backward;
}

function dpad_x_neutral(entity, controller) {
    let [u, d, l, r] = ["up", "down", "left", "right"].map(d => controller.devices.get(d));

    let [dx, dy] = [0, 0];
    if (l.held) { dx = -1 }
    if (r.held) { dx = 1 }

    let neutral = dx === 0;
    return neutral;
}

// class MovementFactory {
//     constructor(entity, controller) {
//         this.entity;
//         this.controller;
//     }

//     getMethod(name) {

//     }
// }