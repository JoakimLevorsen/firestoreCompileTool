import { Interface, MatchGroup } from ".";
import { isInterface } from "./Interface";
import { isMatchGroup } from "./MatchGroup";

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

export interface Block {
    interfaces: { [id: string]: Interface };
    matchGroups: MatchGroup[];
}

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

export const isBlock = (input: any): input is Block => {
    if (typeof input !== "object") {
        return false;
    }
    const { interfaces, matchGroups } = input;
    if (
        interfaces &&
        typeof interfaces === "object" &&
        matchGroups &&
        matchGroups instanceof Array
    ) {
        // Check the interfaces
        if (!Object.values(interfaces).every(i => isInterface(i))) {
            return false;
        }
        if (matchGroups.every(m => isMatchGroup(m))) {
            return true;
        }
    }
    return false;
};
