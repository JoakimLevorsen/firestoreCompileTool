import { UniaryExpression } from ".";
import { ComparisonType } from "..";

export const MinusOperators = ["-"] as const;
export type MinusOperator = typeof MinusOperators[number];

export class MinusUniaryExpression extends UniaryExpression {
    constructor(
        start: number,
        protected _operator: MinusOperator,
        element: ComparisonType
    ) {
        super(start, _operator, element);
    }

    public get operator() {
        return this._operator;
    }
}
