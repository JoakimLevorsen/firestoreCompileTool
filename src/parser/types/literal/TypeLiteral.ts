import { ValueType } from "../Token";
import Literal from "./Literal";

export default class TypeLiteral extends Literal {
    protected _value: ValueType;

    constructor(start: number, value: ValueType) {
        super({ start, end: start + value.length - 1 }, value);
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
