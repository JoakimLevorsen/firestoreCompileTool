import { Position } from "../../SyntaxComponent";
import {
    ComparisonExpression,
    ComparisonType
} from "../ComparisonExpression";

export const IsOperators = ["is", "isOnly", "only"] as const;
export type IsOperator = typeof IsOperators[number];

export class IsExpression extends ComparisonExpression {
    constructor(
        position: Position,
        protected _operator: IsOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, _operator, left, right);
    }

    public get operator() {
        return this._operator;
    }
}
