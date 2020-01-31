import { Operators } from "./expressions/Operators";

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
    | { type: nonKeywordTokens }
    | { type: "Keyword"; value: string };
