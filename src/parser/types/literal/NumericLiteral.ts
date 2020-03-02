import Literal from "./";

export class NumericLiteral extends Literal {
    protected _value: number;

    constructor(start: number, value: number) {
        super(
            { start, end: start + value.toString().length - 1 },
            value
        );
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
