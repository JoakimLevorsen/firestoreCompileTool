import {
    EqualityOperators,
    IsOperators,
    LogicOperators,
    OrderOperators
} from ".";

export const ComparisonOperators = [
    ...EqualityOperators,
    ...LogicOperators,
    ...IsOperators,
    ...OrderOperators
];

export type ComparisonOperator = typeof ComparisonOperators[number];
