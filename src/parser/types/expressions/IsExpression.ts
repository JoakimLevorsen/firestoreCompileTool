import Expression, { ComparisonType } from ".";
import { Position } from "../SyntaxComponent";

export const IsOperators = <const>["is", "isOnly", "only"];
export type IsOperator = typeof IsOperators[number];

export default class IsExpression extends Expression {
    protected operator: IsOperator;

    constructor(
        position: Position,
        operator: IsOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}
