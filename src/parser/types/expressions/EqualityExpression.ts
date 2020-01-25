import Expression, { ComparisonType } from ".";
import { Position } from "../SyntaxComponent";

export type EqualityOperators = "==" | "!=";

export default class EqualityExpression extends Expression {
    protected operator: EqualityOperators;

    constructor(
        position: Position,
        operator: EqualityOperators,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}
