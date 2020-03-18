import { ComparisonExpression, ComparisonType } from "../comparison";

export const LogicOperators = ["&&", "||"] as const;
export type LogicOperator = typeof LogicOperators[number];

export class LogicalExpression extends ComparisonExpression {
    constructor(
        protected _operator: LogicOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(
            { start: left.start, end: right.end },
            _operator,
            left,
            right
        );
    }

    public get operator() {
        return this._operator;
    }
}
