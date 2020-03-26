import {
    nonKeywordTokenTypes,
    Token,
    keywordTokenTypes
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

const nonKeywordRegex = escapedNonKeywordTokens.map(
    ({ escaped, raw }) => ({
        type: raw,
        regex: new RegExp(`^${escaped ?? raw}`)
    })
);

const keywordRegex = keywordTokenTypes.map(type => ({
    type,
    regex: new RegExp(`^${type}([^\\w]|$)`)
}));

export class TokenParser {
    public static extractAll(from: string) {
        const parser = new TokenParser(from);
        const tokens: Token[] = [];
        let token: Token;
        do {
            token = parser.nextToken();
            tokens.push(token);
        } while (token.type !== "EOF");
        return tokens;
    }
    private location: number = 0;
    private remaining: string;
    private commentMode?: "//" | "/**/";
    private stringMode?: '"' | "'";

    constructor(input: string) {
        this.remaining = input;
    }

    public nextToken(): Token {
        const { location, remaining } = this;
        if (remaining === "") return { type: "EOF", location };
        // If we're in string mode, we just return the next chunk untill the closing ' or "
        if (this.stringMode) {
            const regex =
                this.stringMode === '"'
                    ? /^((?:[^"]|\\")+[^\\])"/
                    : /^((?:[^\']|\\\')+[^\\])\'/;
            const value = remaining.match(regex)?.[1];
            if (value) {
                this.remaining = remaining.substr(value.length);
                this.location += value.length;
                return { type: "Keyword", location, value };
            }
        }
        for (const { type, regex } of nonKeywordRegex) {
            const escaped = remaining.match(regex);
            if (escaped == null) continue;
            this.remaining = escaped.input!.substr(escaped[0].length);
            this.location += escaped[0].length;
            if (!this.commentMode && !this.stringMode) {
                if (type === "/*") this.commentMode = "/**/";
                else if (type === "//") this.commentMode = "//";
                else if (type === "'" || type === '"') {
                    this.stringMode = type;
                    return { type, location };
                }
            }
            if (this.commentMode) {
                if (this.commentMode === "//" && type === "\n")
                    this.commentMode = undefined;
                else if (this.commentMode === "/**/" && type === "*/")
                    this.commentMode = undefined;
                return this.nextToken();
            }
            if (this.stringMode === type) {
                this.stringMode = undefined;
            }
            return { type, location };
        }
        for (const { type, regex } of keywordRegex) {
            const match = remaining.match(regex);
            if (!match) continue;
            // Then we can remove from remaining and return
            this.remaining = remaining.substr(type.length);
            this.location += type.length;
            if (this.commentMode) {
                return this.nextToken();
            }
            return { type, location };
        }
        const kMatch = remaining.match(nonTokenRegex);
        if (kMatch && kMatch[1]) {
            this.remaining = remaining.substr(kMatch[1].length);
            this.location += kMatch[1].length;
            if (this.commentMode) return this.nextToken();
            return {
                type: "Keyword",
                value: kMatch[1],
                location
            };
        }
        throw new Error(
            "Token could not be extracted from " + remaining
        );
    }
}
