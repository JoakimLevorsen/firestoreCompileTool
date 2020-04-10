import {
    ComparisonOperator,
    ComparisonOperators,
    KeywordComparisonOperators,
    NonKeywordComparisonOperators
} from "./expressions/comparison";
import { UnaryOperators } from "./expressions/unary";

const operatorTokenTypes = [
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
    "timestamp",
    "Map",
    "Array"
] as const;
export type ValueType = typeof typeTokens[number];

// We sort reverse alphabetically, so || comes before | in the list, and is not read as | and |
export const tokenTypes = [
    ...operatorTokenTypes,
    ...ComparisonOperators,
    ...UnaryOperators,
    ...spaceTokens,
    ...wordTokens,
    ...typeTokens
].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
export type tokenType = typeof tokenTypes[number];
export const nonKeywordTokenTypes = [
    ...operatorTokenTypes,
    ...NonKeywordComparisonOperators,
    ...UnaryOperators,
    ...spaceTokens
].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
export const keywordTokenTypes = [
    ...wordTokens,
    ...typeTokens,
    ...KeywordComparisonOperators
].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

export type Operator = ComparisonOperator;
export type OperatorToken = TypedToken<Operator>;

export interface TypedToken<T extends tokenType> {
    type: T;
    location: number;
}

export type Token =
    | TypedToken<tokenType>
    | { type: "Keyword"; value: string; location: number };

export const tokenHasType = ({ type }: Token, types: tokenType[]) =>
    types.some(t => type === t);
