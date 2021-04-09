import { Vector2 } from "../geometry.js";
import controls from './methods/controls.js';
import conditions from './methods/states/conditions.js';
import components from './methods/components.js';


export class EntityBehaviorInterface {
    constructor(context) {
        this.context = context;
    }

    setPhysics(entity, accel, friction, gravity, mass=1) {
        components.addPhysics(entity, friction, gravity);
        entity.physics.mass = mass;

        entity.events.listen('move', (dx, dy) => {
            let force = new Vector2(dx, dy);
            force.setMagnitude(accel);
            entity.physics.applyForce(force);
        });
    }

    setMovementControls(entity, controller) {
        const emitMove = controls.mapUdlr(
            (dx, dy) => {
                entity.events.emit('move', dx, dy);

                if (entity.paused) {
                    entity.physics.integrateForces();
                }
            }
        );

        controls.setUiControls(controller, emitMove);
    }

    setAnimationMachine(entity, controller, data) {
        components.parseStates(
            entity,
            data,
            this.getConditions(
                conditions,
                {entity, controller},
                'animation_done'
            )
        );
        
        components.addPhysics(entity);

        entity.updateMethods.push(() => {
            entity.animator.setAnimation(
                this.getAnimationName(entity)
            );
        });
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

    queue(entity) {
        entity.events.queueEvents(
            {name: 'test', duration: 5, lerp: false},
            {name: 'test2', duration: 10, args: [1, 2, 3]}
        )

        entity.events.listen(
            'test', 
            timer => console.log('test', timer.ratio));
        
        entity.events.listen('test2', (...args) => console.log('test 2', ...args));
    }
}
