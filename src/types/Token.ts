import {
    ComparisonOperator,
    ComparisonOperators
} from "./expressions/comparison";
import { UnaryOperators } from "./expressions/unary";

const tokenTypes = [
    "(",
    ")",
    "{",
    "}",
    "[",
    "]",
    ".",
    "?.",
    "EOF",
    "?:",
    ":",
    ";",
    ",",
    "|",
    '"',
    "'",
    "=",
    "/",
    "_",
    "=>",
    "/*",
    "*/",
    "//",
    ">",
    ">=",
    "<",
    "<="
] as const;

export const spaceTokens = ["\n", " ", "\t", "\r"] as const;
export const wordTokens = [
    "const",
    "return",
    "if",
    "else",
    "match",
    "interface"
] as const;
export const typeTokens = [
    "string",
    "boolean",
    "number",
    "null",
    "timestamp"
] as const;
export type ValueType = typeof typeTokens[number];

// We sort reverse alphabetically, so || comes before | in the list, and is not read as | and |
export const nonKeywordTokens = [
    ...tokenTypes,
    ...ComparisonOperators,
    ...UnaryOperators,
    ...spaceTokens,
    ...wordTokens,
    ...typeTokens
].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
export type nonKeywordTokens = typeof nonKeywordTokens[number];

export type Operator = ComparisonOperator;
export type OperatorToken = TypedToken<Operator>;

export interface TypedToken<T extends nonKeywordTokens> {
    type: T;
    location: number;
}

export type Token =
    | TypedToken<nonKeywordTokens>
    | { type: "Keyword"; value: string; location: number };

export const tokenHasType = (
    { type }: Token,
    types: nonKeywordTokens[]
) => types.some(t => type === t);
