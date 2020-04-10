import Literal from ".";

export class NullLiteral extends Literal {
    protected _value: null;

    constructor(start: number) {
        super({ start, end: start + 3 }, null);
        this._value = null;
    }

    public get value() {
        return null;
    }
}
