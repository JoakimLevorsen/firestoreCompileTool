export type TokenType =
    | "{"
    | "}"
    | "["
    | "]"
    | "."
    | "|"
    | "&"
    | ":"
    | ";"
    | "/"
    | ","
    | "="
    | "≠"
    | "?"
    | "("
    | ")";

const nonKeyWordTokenArray: TokenType[] = [
    "{",
    "}",
    "[",
    "]",
    ".",
    ",",
    "|",
    "&",
    ":",
    ";",
    "/",
    ",",
    "=",
    "≠",
    "?",
    "(",
    ")"
];

export const AllNonKeywordTokenTypes: Set<TokenType> = new Set(
    nonKeyWordTokenArray
);

export type Token =
    | { type: TokenType }
    | { type: "Keyword"; value: string };

export const isTokenType = (input: any): input is TokenType => {
    if (typeof input !== "string") {
        return false;
    }
    if (input === "Keyword") {
        return true;
    }
    return AllNonKeywordTokenTypes.has(input as TokenType);
};

export const isToken = (input: any): input is Token => {
    if (typeof input !== "object") {
        return false;
    }
    const { type, value } = input;
    if (isTokenType(type)) {
        return true;
    } else if (type === "Keyword" && typeof value === "string") {
        return true;
    }
    return false;
};
