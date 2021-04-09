const DPAD_NAMES = ["up", "down", "left", "right"];

function getDpadButtons(controller) {
    return DPAD_NAMES.map(d => controller.devices.get(d));
}

// get values

function getDxDy(controller) {
    let [u, d, l, r] = getDpadButtons(controller);
    let [dx, dy] = [0, 0];

    if (u.held) { dy = -1 }
    if (d.held) { dy = 1 }
    if (l.held) { dx = -1 }
    if (r.held) { dx = 1 }

    return [dx, dy];
}

function getDxDyCheck(controller) {
    let [u, d, l, r] = checkButtons(controller, ...DPAD_NAMES);
    let [dx, dy] = [0, 0];

    if (u) {dy--;}
    if (d) {dy++;}
    if (l) {dx--;}
    if (r) {dx++;}

    return [dx, dy];
}

function checkButton(controller, name) {
    return controller.devices.get(name).check();
}

function checkButtons(controller, ...names) {
    return names.map(name => checkButton(controller, name));
}

function buttonHeld(controller, name) {
    return controller.devices.get(name).held;
}


// map callbacks

function udlrCallback(callback, check=false) {
    return (controller) => {
        let dx, dy;

        if (!check) {
            [dx, dy] = getDxDy(controller);
        } else {
            [dx, dy] = getDxDyCheck(controller);
        }
    
        if (dx || dy) {
            callback(dx, dy);
        }
    }
}

function buttonCallback(name, callback, check=true) {
    return (controller) => {
        if (check ? checkButton(controller, name) : buttonHeld(controller, name)) {
            callback(controller);
        }
    }
}

function addCallbacks(entity, controller, ...methods) {
    methods.forEach(
        m => entity.updateMethods.push(() => m(controller))
    );
}


export default {
    // getters
    getDxDy,
    checkButton,
    checkButtons,
    buttonHeld,

    // callback mappers
    mapUdlr: udlrCallback,

    mapUdlrConditional: (callback, conditional, check=false) => {
        let inner = udlrCallback(callback, check);
        
        return (controller) => {
            if (conditional(controller)) {
                inner(controller);
            }
        }
    },

    mapButton: buttonCallback,

    mapButtonConditional: (name, callback, conditional, check=true) => {
        let inner = buttonCallback(name, callback, check);

        return (controller) => {
            if (conditional(controller)) {
                inner(controller);
            }
        }
    },

    setUiControls: (controller, ...methods) => {
        addCallbacks(controller, controller, ...methods);
    },

    setControls: addCallbacks

}