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
    throw new Error(
        `${JSON.stringify(input)} was not recognized as a token`
    );
};

const extractNextRawValue = (
    input: string
): { token: Token; remaining: string } | null => {
    const match = extractRawValueString(input);
    if (match) {
        const remaining = input.replace(match, "");
        return {
            remaining,
            token: { type: "Keyword", value: match }
        };
    }
    return null;
};

const nonKeywordTokens: {
    [id: string]: { type: TokenType };
} = {
    ",": { type: "Comma" },
    ".": { type: "Dot" },
    "/": { type: "Slash" },
    ":": { type: "Colon" },
    ";": { type: "SemiColon" },
    "=": { type: "Equals" },
    "?": { type: "QuestionMark" },
    "[": { type: "IndexOpen" },
    "]": { type: "IndexClose" },
    "{": { type: "BlockOpen" },
    "|": { type: "Or" },
    "}": { type: "BlockClose" },
    "≠": { type: "NotEquals" }
};

const extractNextNonKeyword = (
    input: string
): { token: Token; remaining: string } | null => {
    const firstChar = input.match(/^([^\w])/);
    if (firstChar && firstChar[1]) {
        const match = nonKeywordTokens[firstChar[1]];
        if (match) {
            const remaining = input.replace(firstChar[1], "");
            return {
                remaining,
                token: match
            };
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
            remaining,
            token: { type: "Keyword", value: keyword }
        };
    }
    return null;
};
