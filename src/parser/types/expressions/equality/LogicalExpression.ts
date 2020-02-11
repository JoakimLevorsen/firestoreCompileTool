import { Position } from "../../SyntaxComponent";
import {
    ComparisonExpression,
    ComparisonType
} from "../ComparisonExpression";

export const LogicOperators = ["&&", "||"] as const;
export type LogicOperator = typeof LogicOperators[number];

export class LogicalExpression extends ComparisonExpression {
    protected op: LogicOperator;

    constructor(
        position: Position,
        operator: LogicOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.op = operator;
    }
}
