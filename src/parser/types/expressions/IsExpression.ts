import Expression, { ComparisonType } from ".";
import { Position } from "../SyntaxComponent";

export type IsOperators = "is" | "isOnly" | "only";

export default class IsExpression extends Expression {
    protected operator: IsOperators;

    constructor(
        position: Position,
        operator: IsOperators,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}
