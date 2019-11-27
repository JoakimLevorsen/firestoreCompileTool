import { Token, TokenType } from "../types";
import { extractRawValueString } from "../types/RawValue";

export const extractNextToken = (
    input: string
): { token: Token; remaining: string } | null => {
    // First we remove start spacing and replace == with = since no assignment exists, and != with ≠.
    const toConsider = input
        .replace(/^\s*/, "")
        .replace(/^==/, "=")
        .replace(/^!=/, "≠");

    // First we check if this is simply whitespace
    if (/^\s*$/.test(toConsider)) {
        return null;
    }

    const rawValue = extractNextRawValue(toConsider);
    if (rawValue) {
        return rawValue;
    }
    const nonKeyword = extractNextNonKeyword(toConsider);
    if (nonKeyword) {
        return nonKeyword;
    }
    const keyword = extractNextKeyword(toConsider);
    if (keyword) {
        return keyword;
    }
    throw new Error(`${input} was not recognized as a token`);
};

const extractNextRawValue = (
    input: string
): { token: Token; remaining: string } | null => {
    const match = extractRawValueString(input);
    if (match) {
        const remaining = input.replace(match, "");
        return {
            token: { type: "Keyword", value: match },
            remaining
        };
    }
    return null;
};

const nonKeywordTokens: { [id: string]: { type: TokenType } } = {
    "{": { type: "BlockOpen" },
    "}": { type: "BlockClose" },
    "[": { type: "IndexOpen" },
    "]": { type: "IndexClose" },
    ".": { type: "Dot" },
    "|": { type: "Or" },
    ":": { type: "Colon" },
    ";": { type: "SemiColon" },
    "/": { type: "Slash" },
    ",": { type: "Comma" },
    "=": { type: "Equals" },
    "≠": { type: "NotEquals" },
    "?": { type: "QuestionMark" }
};

const extractNextNonKeyword = (
    input: string
): { token: Token; remaining: string } | null => {
    const NonKeywordRegex = /^[{};,:?=≠|\/\[\]]/;
    const match = input.match(NonKeywordRegex);
    if (match && match[0]) {
        const remaining = input.replace(match[0], "");
        if (nonKeywordTokens[match[0]]) {
            return { token: nonKeywordTokens[match[0]], remaining };
        }
    }
    return null;
};

const extractNextKeyword = (
    input: string
): { token: Token; remaining: string } | null => {
    const matchRegex = /^[\w\.]+/;
    const match = input.match(matchRegex);
    if (match && match[0]) {
        const keyword = match[0];
        const remaining = input.replace(keyword, "");
        return {
            token: { type: "Keyword", value: keyword },
            remaining
        };
    }
    return null;
};
