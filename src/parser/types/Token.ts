import { Operators } from "./expressions/Operators";
import { TokenParser } from "../TokenParser";

const tokenTypes = <const>[
    "(",
    ")",
    "{",
    "}",
    "[",
    "]",
    ".",
    "EOF",
    "?:",
    ":",
    ";",
    ",",
    "\n",
    " ",
    "\t",
    "\r",
    "|",
    '"',
    "'"
];
type tokenTypes = typeof tokenTypes[number];

// We sort reverse alphabetically, so || comes before | in the list, and is not read as | and |
export const nonKeywordTokens = [
    ...tokenTypes,
    ...Operators
].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
type nonKeywordTokens = typeof nonKeywordTokens[number];

export type Token =
    | { type: nonKeywordTokens; location: number }
    | { type: "Keyword"; value: string; location: number };

export const tokenHasType = (
    type: nonKeywordTokens | "Keyword",
    types: nonKeywordTokens[]
) => types.some(t => type === t);
