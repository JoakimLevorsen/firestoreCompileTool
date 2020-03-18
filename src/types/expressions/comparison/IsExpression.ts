import { ComparisonExpression, ComparisonType } from "../comparison";

export const IsOperators = ["is", "isOnly", "only"] as const;
export type IsOperator = typeof IsOperators[number];

export class IsExpression extends ComparisonExpression {
    constructor(
        protected _operator: IsOperator,
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
