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
        default:
            return { raw };
    }
});

const keywordRegex = new RegExp(
    `^([^\t\f\v ${escapedNonKeywordTokens
        .filter(({ raw }) => !/^\w*$/.test(raw))
        .reduce(
            (pV, v) =>
                pV != ""
                    ? `${pV}${v.escaped || v.raw}`
                    : v.escaped || v.raw,
            ""
        )}]+)`
);

const nonKeywordRegex = escapedNonKeywordTokens.map(
    ({ escaped, raw }) => ({
        type: raw,
        regex: new RegExp(`^${escaped || raw}`)
    })
);

interface TokenParserReturn {
    token: Token;
    location: number;
}

export class TokenParser {
    private location: number = 0;
    private original: string;
    private remaining: string;

    constructor(input: string) {
        this.original = input;
        this.remaining = input;
    }

    nextToken(): TokenParserReturn {
        // const spaceMatch = this.remaining.match(/^\s*/);
        // let firstSpacing = 0;
        // if (spaceMatch && spaceMatch[0]) {
        //     firstSpacing = spaceMatch[0].length;
        // }
        // this.location += firstSpacing;
        const { location, remaining } = this;
        // const toConsider = this.remaining.substr(firstSpacing);
        if (remaining === "")
            return { token: { type: "EOF" }, location };
        for (const { type, regex } of nonKeywordRegex) {
            const escaped = remaining.match(regex);
            if (escaped == null) continue;
            this.remaining = escaped.input!.substr(escaped[0].length);
            this.location += escaped[0].length;
            return { token: { type: type }, location };
        }
        const kMatch = remaining.match(keywordRegex);
        if (kMatch && kMatch[1]) {
            this.remaining = remaining.substr(kMatch[1].length);
            this.location += kMatch[1].length;
            return {
                token: { type: "Keyword", value: kMatch[1] },
                location
            };
        }
        throw new Error(
            "Token could not be extracted from " + remaining
        );
    }

    static extractAll(from: string) {
        const parser = new TokenParser(from);
        const tokens: TokenParserReturn[] = [];
        let token: TokenParserReturn;
        do {
            token = parser.nextToken();
            tokens.push(token);
        } while (token.token.type !== "EOF");
        return tokens;
    }
}
