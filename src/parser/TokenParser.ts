import { Token, isTokenType } from "../types";
import { extractRawValueString } from "../types/values/RawValue";

export default class TokenParser {
    remaining: string;
    line = 1;

    constructor(base: string) {
        // First we clean the input
        this.remaining = base
            .replace(/[\t ]{2,}/g, "")
            .replace(/==/g, "=")
            .replace(/!=/g, "≠")
            .replace(/!=/g, "≠")
            .replace(/&&/g, "&")
            .replace(/\|\|/g, "|");
    }

    getNext(): Token | null {
        // We remove leading spaces
        const remaining = this.remaining.replace(/^\s*/, "");

        // First we check if this is simply whitespace
        if (/^\s*$/.test(remaining)) {
            return null;
        }

        const rawValue = extractNextRawValue(remaining);
        if (rawValue) {
            this.update(rawValue.nowRemaining);
            this.remaining = rawValue.nowRemaining;
            return rawValue.token;
        }
        const nonKeyword = extractNextNonKeyword(remaining);
        if (nonKeyword) {
            this.update(nonKeyword.nowRemaining);
            this.remaining = nonKeyword.nowRemaining;
            return nonKeyword.token;
        }
        const keyword = extractNextKeyword(remaining);
        if (keyword) {
            this.update(keyword.nowRemaining);
            this.remaining = keyword.nowRemaining;
            return keyword.token;
        }
        throw new Error(
            `${JSON.stringify(
                remaining
            )} was not recognized as a token `
        );
    }

    update(nowRemaining: string) {
        // We find the difference
        const diff = this.remaining.replace(nowRemaining, "");
        this.line += diff.match(/\n/g)?.length || 0;
    }
}

const extractNextRawValue = (
    input: string
): { token: Token; nowRemaining: string } | null => {
    const match = extractRawValueString(input);
    if (match) {
        const nowRemaining = input.replace(match, "");
        return {
            nowRemaining,
            token: { type: "Keyword", value: match }
        };
    }
    return null;
};

const extractNextNonKeyword = (
    input: string
): { token: Token; nowRemaining: string } | null => {
    const firstChar = input.match(/^([^\w])/);
    if (firstChar && firstChar[1]) {
        const match = firstChar[1];
        if (isTokenType(match)) {
            const nowRemaining = input.replace(firstChar[1], "");
            return {
                nowRemaining,
                token: { type: match }
            };
        }
    }
    return null;
};

const extractNextKeyword = (
    input: string
): { token: Token; nowRemaining: string } | null => {
    const matchRegex = /^[\w\.]+/;
    const match = input.match(matchRegex);
    if (match && match[0]) {
        const keyword = match[0];
        const nowRemaining = input.replace(keyword, "");
        return {
            nowRemaining,
            token: { type: "Keyword", value: keyword }
        };
    }
    return null;
};
