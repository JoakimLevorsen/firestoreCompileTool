import { EqualityOperators } from "./EqualityExpression";
import { IsOperators } from "./IsExpression";
import { LogicOperators } from "./LogicalExpression";

export const Operators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators
];
export type Operator = typeof Operators[number];
