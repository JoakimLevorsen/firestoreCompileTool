import Literal from "./Literal";
import { ValueType } from "../Token";

export default class TypeLiteral extends Literal {
    protected _value: ValueType;

    constructor(start: number, value: ValueType) {
        super({ start, end: start + value.length }, value);
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
