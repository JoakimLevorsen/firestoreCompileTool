import { MemberExpression } from "..";
import Identifier from "../../Identifier";
import Literal from "../../literal";
import { LiteralOrIdentifier } from "../../LiteralOrIdentifier";
import SyntaxComponent, { Position } from "../../SyntaxComponent";
import { ComparisonOperator } from "./ComparisonOperators";

export type ComparisonType =
    | LiteralOrIdentifier
    | ComparisonExpression
    | MemberExpression;

export const isComparisonType = (
    input: any
): input is ComparisonType =>
    input instanceof Literal ||
    input instanceof Identifier ||
    input instanceof ComparisonExpression ||
    input instanceof MemberExpression;

export abstract class ComparisonExpression extends SyntaxComponent {
    constructor(
        position: Position,
        protected _operator: ComparisonOperator,
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

export * from "./ComparisonOperators";
export * from "./EqualityExpression";
export * from "./IsExpression";
export * from "./LogicalExpression";
export * from "../MemberExpression";
export * from "./OrderExpression";
export * from "./MathExpression";
