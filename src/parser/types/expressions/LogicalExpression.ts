import Expression, { ComparisonType } from ".";
import { Position } from "../SyntaxComponent";

export const LogicOperators = <const>["&&", "||"];
export type LogicOperator = typeof LogicOperators[number];

export default class LogicalExpression extends Expression {
    protected operator: LogicOperator;

    constructor(
        position: Position,
        operator: LogicOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}
