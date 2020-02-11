import { Position } from "../../SyntaxComponent";
import {
    ComparisonExpression,
    ComparisonType
} from "../ComparisonExpression";

export const IsOperators = ["is", "isOnly", "only"] as const;
export type IsOperator = typeof IsOperators[number];

export class IsExpression extends ComparisonExpression {
    protected operator: IsOperator;

    constructor(
        position: Position,
        operator: IsOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}
