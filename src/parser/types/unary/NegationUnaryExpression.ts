import { UnaryExpression } from ".";
import { ComparisonType } from "../expressions";

export const NegationOperators = ["!"] as const;
export type NegationOperator = typeof NegationOperators[number];

export class NegationUnaryExpression extends UnaryExpression {
    constructor(
        start: number,
        protected _operator: NegationOperator,
        content: ComparisonType
    ) {
        super({ start, end: content.end }, _operator, content);
    }

    public get operator() {
        return this._operator;
    }
}
