import { LiteralOrIdentifier } from "../LiteralOrIdentifier";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import { Operator } from "./Operators";

export type ComparisonType = LiteralOrIdentifier | Expression;

export default abstract class Expression extends SyntaxComponent {
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

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof Expression)) return false;
        return (
            this.left.equals(other.left) &&
            this.operator === other.operator &&
            this.right.equals(other.right)
        );
    }
}
