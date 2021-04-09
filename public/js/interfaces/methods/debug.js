




//
// Text Value Debugging
//

function getAverage (cache) {
    let sum = 0;
    cache.forEach(v => {
        sum += v;
    });

    return sum / cache.length;
}


// expects value to be number, string, boolean, null, or array of those types
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.map(v => formatValue(v)).toString();
    }

    if (typeof(value) === 'number') {
        if (!Number.isInteger(value)) {
            return value.toFixed(2);
        } else {
            return value.toString();
        }
    }

    if (typeof(value) === 'undefined') {
        return 'undefined';
    }

    return value.toString();
}



export default {

    getModelSetter: (model, key, getValue) => {
        return () => model.set(key, getValue());
    },

    getValueAverager: (getValue, cacheSize) => {
        let cache = [];
    
        return () => {
            let value = getValue();
    
            if (cache.length > cacheSize) {
                cache = cache.slice(1);
            }
    
            cache.push(value);
            return getAverage(cache);
        }
    },

    getIntervalSetText: (entity, getValue, interval, label=false) => {
        let frames = 0;
        let text;

        return () => {
            if (frames === 0) {
                text = formatValue(getValue());

                if (label) {
                    text = `${label}: ${text}`;
                }

                entity.graphics.setText(
                    formatValue(text)
                );
            }
    
            frames++;
            frames = frames % interval;
        }
    },


    //
    // Graphical Shape Debugging
    //
    getShapesUpdate: (layer, getShapes) => {
        return () => {
            layer.graphics.shapes = getShapes();
        }
    },

    getShapeCallback: (getShape, getEntities) => {
        return () => getEntities().map(e => getShape(e));
    },

    getCircle: (getPosition, radius) => {
        return (entity) => {
            return {radius, position: getPosition(entity)};
        }
    },

    getVector: (getVector, getOffset=false, scale=1) => {
        return (entity) => {
            let arg = {};
    
            if (scale === 1) {
                arg.vector = getVector(entity);
            } else {
                arg.vector = getVector(entity).getCopy().scale(scale);
            }
    
            if (getOffset) {
                arg.position = getOffset(entity);
            }
    
            return arg;
        }
    }
}