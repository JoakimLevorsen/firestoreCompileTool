import { UniaryExpression } from ".";
import { ComparisonType } from "..";

export const NegationOperators = ["!"] as const;
export type NegationOperator = typeof NegationOperators[number];

export class NegationUniaryExpression extends UniaryExpression {
    constructor(
        start: number,
        protected _operator: NegationOperator,
        element: ComparisonType
    ) {
        super(start, _operator, element);
    }

    public get operator() {
        return this._operator;
    }
}
