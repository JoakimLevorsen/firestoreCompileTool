import {
    EqualityOperators,
    IsOperators,
    LogicOperators,
    OrderOperators
} from "./expressions/equality";

export const Operators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators,
    ...OrderOperators
];
export type Operator = typeof Operators[number];
