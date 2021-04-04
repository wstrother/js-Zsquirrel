import controls from '../controls.js';


export default {
    dpad_forward: ({entity, controller}) => {
        let [dx] = controls.getDxDy(controller);
    
        return Math.sign(dx) === Math.sign(entity.physics.heading[0]);
    },

    dpad_backward: ({entity, controller}) => {
        let [dx] = controls.getDxDy(controller);
        
        return Math.sign(dx) === -Math.sign(entity.physics.heading[0]);
    },

    dpad_x_neutral: ({controller}) => {
        let [dx] = controls.getDxDy(controller);
    
        return dx === 0;
    },

    press_start: ({controller}) => {
        return controls.checkButton(controller, 'start');
    },

    animation_done: ({entity}) => {
        let animation = entity.animator.currentAnimation;

        return (animation.frameCount === animation.length - 1);
    }
}