import { EqualityOperators } from "./EqualityExpression";
import { IsOperators } from "./IsExpression";
import { LogicOperators } from "./LogicalExpression";
import { MathOperators } from "./MathExpression";
import { OrderOperators } from "./OrderExpression";
import { InOperators } from "./InExpression";

export const ComparisonOperators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators,
    ...InOperators,
    ...OrderOperators,
    ...MathOperators
];

export const NonKeywordComparisonOperators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...OrderOperators,
    ...MathOperators
];
export const KeywordComparisonOperators = [
    ...IsOperators,
    ...InOperators
];

export type ComparisonOperator = typeof ComparisonOperators[number];
