import { Position } from "../SyntaxComponent";
import Literal from "./Literal";

export default class StringLiteral extends Literal {
    protected _value: string;

    constructor(position: Position, value: string) {
        super(position, value);
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
