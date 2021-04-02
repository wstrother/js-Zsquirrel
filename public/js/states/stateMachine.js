export class StateMachine {
    constructor(entity, defaultState) {
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


function getCondition(state, method, bool=true, buffer=false) {
    return () => {
        if (Boolean(method()) === bool) {
            return {state, buffer};
        }
    }
}


function getStateMethod(conditions, setBuffer) {
    return () => {
        for (const condition of conditions) {
            let to = condition();

            if (to) {
                return handleBuffer(to, setBuffer);
            }
        }
    }
}

function handleBuffer(to, setBuffer) {
    if (to.buffer) {
        debugger;
        setBuffer(to.state);
    } else {
        return to.state;
    }
}


function parseStateTransitions(json, conditionMap, stateMachine) {
    let conditions = json.transitions.map(
        transitionJson => parseTransition(transitionJson, conditionMap)
    );

    let setBuffer = (state) => {
        stateMachine.bufferMethod = () => {
            if (conditionMap.get('auto')()) 
            { 
                return state; 
            }
        }
    }

    return getStateMethod(
        conditions,
        setBuffer
    );
}

function parseTransition(json, conditionMap) {
    let [to, condition, bool, buffer] = json;

    condition = conditionMap.get(condition);

    return getCondition(to, condition, bool, buffer);
}


export function parseStateMachine(stateMachine, json, conditionMap) {
    json.states.forEach(
        stateJson => {
            stateMachine.addState(
                stateJson.name,
                parseStateTransitions(
                    stateJson,
                    conditionMap,
                    stateMachine
                )
            )
        }
    );
}


