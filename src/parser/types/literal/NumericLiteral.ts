import { Position } from "../SyntaxComponent";
import Literal from "./Literal";

export default class NumericLiteral extends Literal {
    protected _value: number;

    constructor(position: Position, value: number) {
        super(position, value);
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
