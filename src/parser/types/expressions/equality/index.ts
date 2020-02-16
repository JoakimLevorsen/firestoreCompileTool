import { Position } from "../../SyntaxComponent";
import {
    ComparisonExpression,
    ComparisonType
} from "../ComparisonExpression";

export const EqualityOperators = ["==", "!="] as const;
export type EqualityOperator = typeof EqualityOperators[number];

export class EqualityExpression extends ComparisonExpression {
    protected operator: EqualityOperator;

    constructor(
        position: Position,
        operator: EqualityOperator,
        left: ComparisonType,
        right: ComparisonType
    ) {
        super(position, operator, left, right);
        this.operator = operator;
    }
}

export * from "./IsExpression";
export * from "./LogicalExpression";
export * from "./MemberExpression";
