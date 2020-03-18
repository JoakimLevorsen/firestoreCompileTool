import { MinusOperators } from "./MinusUnaryExpression";
import { NegationOperators } from "./NegationUnaryExpression";

export const UnaryOperators = [
    ...MinusOperators,
    ...NegationOperators
];

export type UnaryOperator = typeof UnaryOperators[number];
