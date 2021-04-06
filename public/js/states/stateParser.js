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
