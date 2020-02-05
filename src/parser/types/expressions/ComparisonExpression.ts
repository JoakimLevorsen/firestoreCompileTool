import { LiteralOrIdentifier } from "../LiteralOrIdentifier";
import { Operator } from "../Operators";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import MemberExpression from "./MemberExpression";

export type ComparisonType =
    | LiteralOrIdentifier
    | ComparisonExpression
    | MemberExpression;

export default abstract class ComparisonExpression extends SyntaxComponent {
    protected operator: Operator;
    protected left: ComparisonType;
    protected right: ComparisonType;

    constructor(
        position: Position,
        operator: Operator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    public getOperator = () => this.operator;

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ComparisonExpression)) return false;
        return (
            this.left.equals(other.left) &&
            this.operator === other.operator &&
            this.right.equals(other.right)
        );
    }
}
