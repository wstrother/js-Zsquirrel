class InputDevice {
    constructor(name, mapping) {
        this.name = name;
        this.default = null;
        this.controller = null;
        this.mapping = mapping;
    }

    setController(controller) {
        this.controller = controller;
    }

    // returns state of current input
    getInput() {
        return this.default;
    }

    // returns cache of frame data for this device
    getFrames() {
        if (this.controller) {
            return this.controller.getDeviceFrames(this.name);
        }
    }

    // returns most recent input frame for this device
    getValue() {
        const frames = this.getFrames();

        if (frames) {
            return frames[frames.length - 1];
        } else {
            return this.default;
        }
    }

    // returns the previous input frame for this device
    getPrevious() {
        const frames = this.getFrames();

        if (frames && frames.length > 1) {
            return frames[frames.length - 2];
        } else {
            return this.default;
        }
    }

    update() {
        throw new Error("InputDevice is an abstract base class, update should be implemented by a sub class")
    }
}

const INIT_DELAY = 30;
const HELD_DELAY = 15;

export class Button extends InputDevice {
    constructor(name, mapping, initDelay=INIT_DELAY, heldDelay=HELD_DELAY) {
        super(name, mapping);

        this.default = false;
        this.held = 0;
        this.initDelay = initDelay;
        this.heldDelay = heldDelay;
    }

    getInput() {
        return this.mapping.getInput();
    }

    // returns a bool that helps determine the periodicity with which continuous
    // held inputs should be registerred, only matters in certain contexts
    get ignore() {
        const held = this.held;

        // if the held frames are greater than 1 but less than the initial delay
        if (held > 1 && held < this.initDelay) {
            return true;
        
        // if the held frames are beyond the initial delay but modulo to the held delay
        // then return true
        } else if (held > this.initDelay) {
            return !!((held - this.initDelay) % this.heldDelay);
        }

        // otherwise return false
        return false;
    }

    // use in contexts where continuous input should not register every frame
    check() {
        return this.held && !this.ignore;
    }

    // returns true on the frame after the button has been pressed and is released
    negativeEdge() {
        return this.getPrevious() && !this.getValue();
    }

    update() {

        if (this.getValue()) { this.held++; }
        else { this.held = 0; }
        
    }

}