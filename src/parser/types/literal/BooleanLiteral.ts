import Literal from "./Literal";

export default class BooleanLiteral extends Literal {
    protected _value: boolean;

    constructor(start: number, value: boolean) {
        super(
            { start, end: start + String(value).length - 1 },
            value
        );
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
