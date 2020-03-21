import { Identifier } from "..";
import { MemberExpression } from "../expressions";
import { BinaryExpression } from "../expressions/BinaryExpression";
import Literal from "../literals";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import { CallExpression } from "../expressions/CallExpression";

export type ConstStatementValue =
    | BinaryExpression
    | Identifier
    | Literal
    | MemberExpression
    | CallExpression;

export class ConstStatement extends SyntaxComponent {
    constructor(
        position: Position,
        private _name: string,
        private _value: ConstStatementValue
    ) {
        super(position);
    }

    public get name(): string {
        return this._name;
    }

    public get value(): ConstStatementValue {
        return this._value;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ConstStatement)) return false;
        return (
            this.name === other.name && this.value.equals(other.value)
        );
    }
}
