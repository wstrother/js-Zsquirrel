
export class Meter {
    constructor(...args) {
        let size, value;
        if (args.length === 1) {
            value = 0;
            size = args[0];
        } else {
            [value, size] = args;
        }
        this._value = value;
        this.size = size;
    }

    get ratio() {
        return this.value / this.size;
    }

    get value() {
        return this._value
    }

    set value(value) {
        if (value < 0) {
            value = 0;
        }

        if (value > this.size) {
            value = this.size;
        }

        this._value = value;
    }
}

export class Timer extends Meter {
    constructor(size, name) {
        super(size, size);

        this.name = name;
        this.onTick = null;
        this.onDone = null;
    }

    tick() {
        this.value -= 1;

        if (this.onTick) {
            this.onTick(this);
        }

        if (this.value === 0 && this.onDone) {
            this.onDone(this);
        }
    }
}