import { EqualityOperators } from "./EqualityExpression";
import { IsOperators } from "./IsExpression";
import { LogicOperators } from "./LogicalExpression";
import { MathOperators } from "./MathExpression";
import { OrderOperators } from "./OrderExpression";

export const ComparisonOperators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators,
    ...OrderOperators,
    ...MathOperators
];

export type ComparisonOperator = typeof ComparisonOperators[number];
