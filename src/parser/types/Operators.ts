import { EqualityOperators } from "./expressions/equality";
import { IsOperators } from "./expressions/equality/IsExpression";
import { LogicOperators } from "./expressions/equality/LogicalExpression";

export const Operators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators
];
export type Operator = typeof Operators[number];
