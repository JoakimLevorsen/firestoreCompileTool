import { ComparisonExpression, ComparisonType } from ".";

export const EqualityOperators = ["==", "!="] as const;
export type EqualityOperator = typeof EqualityOperators[number];

export class EqualityExpression extends ComparisonExpression {
    constructor(
        protected _operator: EqualityOperator,
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
