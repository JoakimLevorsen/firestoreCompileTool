import { LogicOperators } from "./LogicalExpression";
import { EqualityOperators } from "./EqualityExpression";
import { IsOperators } from "./IsExpression";

export const Operators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators
];
export type Operator = typeof Operators[number];
