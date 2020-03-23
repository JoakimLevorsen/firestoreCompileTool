import { Identifier } from "../..";
import { MemberExpression } from "../../expressions";
import Literal from "../../literals";
import SyntaxComponent, { Position } from "../../SyntaxComponent";
import { ComparisonOperator } from "./ComparisonOperators";
import { CallExpression } from "../CallExpression";

export type ComparisonType =
    | Literal
    | Identifier
    | ComparisonExpression
    | MemberExpression
    | CallExpression;

export const isComparisonType = (
    input: any
): input is ComparisonType =>
    input instanceof Literal ||
    input instanceof Identifier ||
    input instanceof ComparisonExpression ||
    input instanceof MemberExpression ||
    input instanceof CallExpression;

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
