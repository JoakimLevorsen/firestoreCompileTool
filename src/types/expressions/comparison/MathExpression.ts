import { ComparisonExpression, ComparisonType } from "../comparison";

export const MathOperators = ["+", "-", "*", "/"] as const;
export type MathOperator = typeof MathOperators[number];

export class MathExpression extends ComparisonExpression {
    constructor(
        protected _operator: MathOperator,
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
