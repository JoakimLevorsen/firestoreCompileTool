import { nonKeywordTokens, Token } from "./types/Token";

const escapedNonKeywordTokens = nonKeywordTokens.map(raw => {
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
        default:
            return { raw };
    }
});

const keywordRegex = new RegExp(
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

    constructor(input: string) {
        this.remaining = input;
    }

    public nextToken(): Token {
        const { location, remaining } = this;
        if (remaining === "") return { type: "EOF", location };
        for (const { type, regex } of nonKeywordRegex) {
            const escaped = remaining.match(regex);
            if (escaped == null) continue;
            this.remaining = escaped.input!.substr(escaped[0].length);
            this.location += escaped[0].length;
            if (!this.commentMode) {
                if (type === "/*") this.commentMode = "/**/";
                else if (type === "//") this.commentMode = "//";
            }
            if (this.commentMode) {
                if (this.commentMode === "//" && type === "\n")
                    this.commentMode = undefined;
                else if (this.commentMode === "/**/" && type === "*/")
                    this.commentMode = undefined;
                return this.nextToken();
            }
            return { type, location };
        }
        const kMatch = remaining.match(keywordRegex);
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
