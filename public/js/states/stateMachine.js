export class StateMachine {
    constructor(entity, defaultState='default') {
        this.entity = entity;

        this.states = new Map();
        this._state = defaultState;

        this.bufferMethod = null;
    }

    addState(state, method) {
        this.states.set(state, method);
    }

    get state() {
        return this._state;
    }

    set state(state) {
        this._state = state;
        this.entity.events.emit('stateChange', state);
    }

    getMethod(state) {
        if (!this.bufferMethod) {
            return this.states.get(state);
        } else {
            return () => { 
                return this.checkBuffer() 
            };
        }
    }

    checkBuffer() {
        let to = this.bufferMethod();

        if (to) {
            this.bufferMethod = null;
            return to;
        }
    }

    update() {
        let state = this.getMethod(this.state);

        if (state) {
            let to = state();

            if (to) {
                this.state = to;
            }
        }
    }
}
