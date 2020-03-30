import Literal from ".";
import { ValueType } from "../Token";

export class TypeLiteral extends Literal {
    public type: ValueType = "string";
    protected _value: ValueType;

    constructor(start: number, value: ValueType) {
        super({ start, end: start + value.length - 1 }, value);
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
