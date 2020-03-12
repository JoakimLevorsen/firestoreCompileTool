import { MinusOperators, NegationOperators } from ".";

export const UniaryOperators = [
    ...NegationOperators,
    ...MinusOperators
];
export type UniaryOperator = typeof UniaryOperators[number];
