import SyntaxComponent, { Position } from "../SyntaxComponent";
import { LogicOperators } from "./LogicalExpression";
import { LiteralOrIndentifier } from "../LiteralOrIndentifier";
import { EqualityOperators } from "./EqualityExpression";
import { IsOperators } from "./IsExpression";

export const Operators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators
];
export type Operator = typeof Operators[number];

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
