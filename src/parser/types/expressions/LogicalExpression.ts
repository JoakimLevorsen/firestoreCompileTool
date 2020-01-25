import Expression, { ComparisonType } from ".";
import { Position } from "../SyntaxComponent";

export type LogicOperators = "&&" | "||";

export default class LogicalExpression extends Expression {
    protected operator: LogicOperators;

    constructor(
        position: Position,
        operator: LogicOperators,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}
