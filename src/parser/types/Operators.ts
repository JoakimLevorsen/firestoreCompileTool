import { EqualityOperators } from "./expressions/EqualityExpression";
import { IsOperators } from "./expressions/IsExpression";
import { LogicOperators } from "./expressions/LogicalExpression";

export const Operators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators
];
export type Operator = typeof Operators[number];
