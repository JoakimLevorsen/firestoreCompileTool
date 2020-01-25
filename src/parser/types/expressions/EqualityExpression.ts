import Expression, { ComparisonType } from ".";
import { Position } from "../SyntaxComponent";

export const EqualityOperators = <const>["==", "!="];
export type EqualityOperator = typeof EqualityOperators[number];

export default class EqualityExpression extends Expression {
    protected operator: EqualityOperator;

    constructor(
        position: Position,
        operator: EqualityOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}
