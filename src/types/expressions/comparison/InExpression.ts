import { ComparisonExpression, ComparisonType } from "../comparison";

export const InOperators = ["in", "inn't"] as const;
export type InOperator = typeof InOperators[number];

export class InExpression extends ComparisonExpression {
    constructor(
        protected _operator: InOperator,
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
