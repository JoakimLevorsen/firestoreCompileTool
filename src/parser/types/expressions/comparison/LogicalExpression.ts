import { ComparisonExpression, ComparisonType } from ".";
import { Position } from "../../SyntaxComponent";

export const LogicOperators = ["&&", "||"] as const;
export type LogicOperator = typeof LogicOperators[number];

export class LogicalExpression extends ComparisonExpression {
    constructor(
        position: Position,
        protected _operator: LogicOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, _operator, left, right);
    }

    public get operator() {
        return this._operator;
    }
}
