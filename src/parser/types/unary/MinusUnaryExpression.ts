import { UnaryExpression } from ".";
import { ComparisonType } from "../expressions";

export const MinusOperators = ["-"] as const;
export type MinusOperator = typeof MinusOperators[number];

export class MinusUnaryExpression extends UnaryExpression {
    constructor(
        start: number,
        protected _operator: MinusOperator,
        content: ComparisonType
    ) {
        super({ start, end: content.end }, _operator, content);
    }

    public get operator() {
        return this._operator;
    }
}
