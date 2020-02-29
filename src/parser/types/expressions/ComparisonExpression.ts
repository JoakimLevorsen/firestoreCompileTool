import { LiteralOrIdentifier } from "../LiteralOrIdentifier";
import { Operator } from "../Operators";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import { MemberExpression } from "./";

export type ComparisonType =
    | LiteralOrIdentifier
    | ComparisonExpression
    | MemberExpression;

export abstract class ComparisonExpression extends SyntaxComponent {
    constructor(
        position: Position,
        protected _operator: Operator,
        protected _left: ComparisonType,
        protected _right: ComparisonType
    ) {
        super(position);
    }

    public get left() {
        return this._left;
    }

    public get right() {
        return this._right;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ComparisonExpression)) return false;
        return (
            this.left.equals(other.left) &&
            this._operator === other._operator &&
            this.right.equals(other.right)
        );
    }
}
