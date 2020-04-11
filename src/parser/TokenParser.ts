import {
    nonKeywordTokenTypes,
    Token,
    tokenTypes,
    tokenType
} from "../types/Token";

const escapedNonKeywordTokens = nonKeywordTokenTypes.map(raw => {
    switch (raw) {
        case ".":
        case "(":
        case ")":
        case "{":
        case "}":
        case "[":
        case "]":
        case "||":
        case "|":
            let escaped = "";
            for (const c of raw) {
                escaped += `\\${c}`;
            }
            return { escaped, raw };
        case "?:":
            return { escaped: "\\?:", raw };
        case "?.":
            return { escaped: "\\?\\.", raw };
        case "/*":
            return { escaped: "/\\*", raw };
        case "*/":
            return { escaped: "\\*/", raw };
        case "+":
        case "-":
        case "*":
        case "/":
            return { escaped: `\\${raw}`, raw };
        default:
            return { raw };
    }
});

const nonTokenRegex = new RegExp(
    `^([^\t\f\v ${escapedNonKeywordTokens
        .filter(({ raw }) => !/^\w*$/.test(raw))
        .reduce(
            (pV, v) =>
                pV !== ""
                    ? `${pV}${v.escaped ?? v.raw}`
                    : v.escaped ?? v.raw,
            ""
        )}]+)`
);

// We take all the possible tokens, and turn them into an object based on their length, containing the tokens as keys, so we can do O(1) lookups.
const organizedTokens = tokenTypes.reduce<{
    [index: number]: { [index: string]: boolean };
}>((pV, token) => {
    const l = token.length;
    if (!pV[l]) pV[l] = {};
    pV[l][token] = true;
    return pV;
}, {});
const maxTokenLength = Object.keys(organizedTokens).reduce(
    (pV, v) => (+v > pV ? +v : pV),
    0
);

export function* tokenParser(from: string): Generator<Token> {
    let location = 0;
    let remaining = from;
    let commentMode: "//" | "/**/" | null = null;
    let stringMode: '"' | "'" | null = null;

    // Regexes
    const lineCommentEnd = /^.*?\n/;
    const blockCommmentEnd = /^.*?\*\//;
    const qouteStringEnd = /^.*?([^\\]|^)"/;
    const apostropheStringEnd = /^.*?([^\\]|^)'/;

    while (remaining.length !== 0) {
        // To prevent infinite loops, we keep track of the old remaining
        let lastRemaining = remaining;
        // First we check for comment mode
        if (commentMode) {
            // Since we're in comment mode, we just cheat and continue untill the comment is over
            const regexToUse =
                commentMode === "//"
                    ? lineCommentEnd
                    : blockCommmentEnd;
            const commentContent = remaining.match(regexToUse);
            if (!commentContent) throw new Error("Unending comment");
            // Now we just add the comment to the lenght, and remove it from the remaining
            const commentLength = commentContent.length;
            remaining = remaining.substr(commentLength);
            location += commentLength;
            commentMode = null;
            continue;
        }
        if (stringMode) {
            const regexToUse =
                stringMode === "'"
                    ? apostropheStringEnd
                    : qouteStringEnd;
            const stringContent = remaining.match(regexToUse)?.[0];
            if (!stringContent) throw new Error("Unending string");
            // Now here we are a little cheeky, and first yield the string content, and then the end '/"
            // Only if the string has content that is
            if (stringContent.length > 1) {
                const stringSubContent = stringContent.substr(
                    0,
                    stringContent.length - 1
                );
                yield {
                    type: "Keyword",
                    location,
                    value: stringSubContent
                };
                location += stringSubContent.length;
            }
            // We disable string mode, and add the last "/' to the location
            location += 1;
            yield { type: stringMode, location };
            stringMode = null;
            remaining = remaining.substr(stringContent.length);
            // Now we continue on to the remaining code, since both string and commentmode can't be active
        }
        // Now we go through all the organized tokens to check if we've encountered any tokens (We start with the longest to make sure we don't interpret eg (== as = and =, or ?. as ? and .))
        let foundToken = false;
        for (
            let i = Math.min(maxTokenLength, remaining.length);
            i > 0;
            i--
        ) {
            // First we check if any tokens have this length
            const possibleToken = remaining.substr(0, i);
            const tokenMatch = organizedTokens[i]?.[possibleToken];
            if (tokenMatch) {
                // This means we encounted a function
                remaining = remaining.substr(possibleToken.length);
                yield { type: possibleToken as tokenType, location };
                location += possibleToken.length;
                foundToken = true;
                break;
            }
        }
        // If we didn't find a token we return a normal string token
        if (!foundToken) {
            // Though first we check for the sneeky \xa0 (fixed width space), that would've been missed by the previous code
            if (/^\xa0/.test(remaining)) {
                remaining = remaining.substr(1);
                yield { type: " ", location };
                location += 1;
            } else {
                // This means we have a keyword, keywords are often seperated by a space, but this is not mandetory. This means we have to take into account it can end with a reserved character.
                const match = remaining.match(nonTokenRegex);
                const keyword = match?.[1];
                if (keyword) {
                    remaining = remaining.substr(keyword.length);
                    yield {
                        type: "Keyword",
                        value: keyword,
                        location
                    };
                    location += keyword.length;
                }
                // Otherwise we have a token, and will loop around to extract it
            }
        }
        // Lastly we make sure remaining has changed, otherwise no token was extracted
        if (remaining.length === lastRemaining.length) {
            throw new Error(
                "Could not extract token from" + remaining
            );
        }
    }
    // This means we're done with extractin, so we just return and EOF
    return { type: "EOF", location };
}

export const getAllTokens = (file: string) => {
    const content: Token[] = [];
    const extractor = tokenParser(file);
    let done = false;
    do {
        const result = extractor.next();
        done = result.done || false;
        content.push(result.value);
    } while (!done);
    return content;
};
