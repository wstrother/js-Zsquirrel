export class StateMachine {
    constructor(defaultState) {
        this.states = new Map();
        this.state = defaultState;
    }

    addState(state, method) {
        this.states.set(state, method);
    }

    getMethod(state) {
        return this.states.get(state);
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