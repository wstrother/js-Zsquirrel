
class Mapping {
    constructor(mapType, deviceName, id) {
        this.mapType = mapType;
        this.deviceName = deviceName;
        this.id = id;
    }

    getInput() {
        throw new Error("Mapping is an abstract base class, getInput should be implemented by a sub class")
    }
}


export class ButtonMappingKey extends Mapping {
    constructor(id, keyboard) {
        super("buttonMappingKey", "keyboard", id);

        keyboard.addKey(this.id);
        this.getInput = () => {
            return keyboard.getState(this.id);
        }
    }
}

export class KeyboardState {
    // some code courtesy of Meth Meth Method...

    constructor() {
        this.states = new Map();
        this.PRESSED = 1;
        this.RELEASED = 0;
    }

    addKey(code) {
        this.states.set(code, this.RELEASED);
    }

    getState(code) {
        if (!this.states.has(code)) {
            return false;
        } 

        return !!this.states.get(code);
    }

    handleEvent(event) {
        const {code} = event;
        if (code === "Escape") {
            debugger;
        }

        if (!this.states.has(code)) {
            // Did not have key mapped.
            return;
        }
        else {
            event.preventDefault();
        }

        const keyState = event.type === 'keydown' ? this.PRESSED : this.RELEASED;

        if (this.states.get(code) === keyState) {
            return;
        }

        this.states.set(code, keyState);
    }

    listenTo(window) {
        ['keydown', 'keyup'].forEach(eventName => {
            window.addEventListener(eventName, event => {
                this.handleEvent(event);
            });
        });
    }
}
