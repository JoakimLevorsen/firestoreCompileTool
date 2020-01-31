import SyntaxComponent, { Position } from "../SyntaxComponent";
import { LiteralOrIndentifier } from "../LiteralOrIndentifier";
import { Operator } from "./Operators";

export type ComparisonType = LiteralOrIndentifier | Expression;

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
}
