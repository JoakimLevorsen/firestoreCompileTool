import { Position } from "../SyntaxComponent";
import Literal from "./Literal";

export default class BooleanLiteral extends Literal {
    protected _value: boolean;

    constructor(position: Position, value: boolean) {
        super(position, value);
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
