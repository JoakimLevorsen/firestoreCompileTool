import { ComparisonExpression, ComparisonType } from ".";
import { Position } from "../../SyntaxComponent";

export const EqualityOperators = ["==", "!="] as const;
export type EqualityOperator = typeof EqualityOperators[number];

export class EqualityExpression extends ComparisonExpression {
    constructor(
        position: Position,
        protected _operator: EqualityOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, _operator, left, right);
    }

    public get operator() {
        return this._operator;
    }
}
