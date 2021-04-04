import { parseStateMachine, StateMachine } from "../states/stateMachine.js";
import { Physics } from "../physics/physics.js";
import { Vector2 } from "../geometry.js";
import controls from './methods/controls.js';
import conditions from './methods/states/conditions.js';


export class EntityBehaviorInterface {
    constructor(context) {
        this.context = context;
    }

    setPhysics(entity, accel, friction) {
        entity.addComponent('physics', new Physics(entity));
        entity.events.listen('move', (dx, dy) => {
            let force = new Vector2(dx, dy);
            force.setMagnitude(accel);
            entity.physics.applyForce(force);
        });

        entity.physics.friction = friction;
    }

    setMovementControls(entity, controller) {
        const emitMove = controls.mapUdlr(
            (dx, dy) => entity.events.emit('move', dx, dy)
        );

        controls.setControls(entity, controller, emitMove);
    }

    setAnimationMachine(entity, controller, data) {
        let stateMachine = new StateMachine(entity, 'default');

        entity.addComponent('states', stateMachine);
        entity.addComponent('physics', new Physics(entity));

        entity.events.listen('stateChange', (state) => {
            console.log(`${entity.name}.state changed to ${state}`);
        });

        entity.updateMethods.push(() => {
            entity.animator.setAnimation(
                this.getAnimationName(entity)
            );
        });

        const conditionMap = this.getConditions(
            conditions,
            {entity, controller},
            'animation_done'
        );

        parseStateMachine(
            stateMachine, 
            data, 
            conditionMap
        );
    }

    getAnimationName(entity) {
        let state = entity.states.state;
        let names = entity.animator.animationNames

        if (!state) {
            state = "default";
        }

        let dirState = `${state}_${entity.physics.dirString}`;

        if (names.includes(dirState)) {
            return dirState;
        }
        else if (names.includes(state)) {
            return state;
        } else {
            return "default";
        }
    }

    getConditions(methodObj, argObj, autoKey) {
        const conditionMap = new Map();

        let add = (name, m) => { 
           conditionMap.set(name, () => m(argObj));
        }

        Object.keys(methodObj).forEach(key => {
            add(key, methodObj[key]);
        })

        add('auto', methodObj[autoKey]);

        return conditionMap
    }
}
