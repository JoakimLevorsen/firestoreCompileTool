import { Operators } from "./expressions";

const tokenTypes = <const>["(", ")", "{", "}", "[", "]", ".", "EOF"];
type tokenTypes = typeof tokenTypes[number];

export const nonKeywordTokens = <const>[...tokenTypes, ...Operators];
type nonKeywordTokens = typeof nonKeywordTokens[number];

export type Token =
    | { type: nonKeywordTokens }
    | { type: "Keyword"; value: string };
