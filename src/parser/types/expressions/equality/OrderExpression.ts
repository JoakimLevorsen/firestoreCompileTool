import { Position } from "../../SyntaxComponent";
import {
    ComparisonExpression,
    ComparisonType
} from "../ComparisonExpression";

export const OrderOperators = ["<", "<=", ">=", ">"] as const;
export type OrderOperator = typeof OrderOperators[number];

export class OrderExpression extends ComparisonExpression {
    constructor(
        position: Position,
        protected _operator: OrderOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, _operator, left, right);
    }

    public get operator() {
        return this._operator;
    }
}
