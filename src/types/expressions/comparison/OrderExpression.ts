import { ComparisonExpression, ComparisonType } from "../comparison";

export const OrderOperators = ["<", "<=", ">=", ">"] as const;
export type OrderOperator = typeof OrderOperators[number];

export class OrderExpression extends ComparisonExpression {
    constructor(
        protected _operator: OrderOperator,
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
