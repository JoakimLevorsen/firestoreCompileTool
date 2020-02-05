import SyntaxComponent, { Position } from "../SyntaxComponent";
import { BinaryExpression } from "../expressions/BinaryExpression";
import Identifier from "../Identifier";
import Literal from "../literal/Literal";

type ValueType = BinaryExpression | Identifier | Literal;

export default class ConstStatement extends SyntaxComponent {
    constructor(
        position: Position,
        private _name: string,
        private _value: ValueType
    ) {
        super(position);
    }

    public get name() {
        return this.name;
    }

    public get value() {
        return this._value;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ConstStatement)) return false;
        return (
            this.name === other.name && this.value.equals(other.value)
        );
    }
}
