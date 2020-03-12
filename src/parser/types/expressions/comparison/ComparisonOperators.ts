import { EqualityOperators } from "./EqualityExpression";
import { IsOperators } from "./IsExpression";
import { LogicOperators } from "./LogicalExpression";
import { OrderOperators } from "./OrderExpression";

export const ComparisonOperators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators,
    ...OrderOperators
];

export type ComparisonOperator = typeof ComparisonOperators[number];
