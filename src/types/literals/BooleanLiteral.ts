import Literal from ".";
import { ValueType } from "../Token";

export class BooleanLiteral extends Literal {
    public type: ValueType = "boolean";
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
