import { nonKeywordTokens, Token } from "./types/Token";

const keywordRegex = new RegExp(
    `^(.*)(${nonKeywordTokens.reduce(
        (pV, v) => (pV == "" ? `${pV}|${v}` : v),
        ""
    )})`
);

const nonKeywordRegex = nonKeywordTokens.map(type => ({
    type,
    regex: new RegExp(`^${type}`)
}));

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
        const { location } = this;
        const spaceMatch = this.remaining.match(/^\s*/);
        let firstSpacing = 0;
        if (spaceMatch && spaceMatch[0]) {
            firstSpacing = spaceMatch[0].length;
        }
        this.location += firstSpacing;
        const toConsider = this.remaining.substr(firstSpacing);
        if (toConsider === "")
            return { token: { type: "EOF" }, location };
        for (const { type, regex } of nonKeywordRegex) {
            const result = toConsider.match(regex);
            if (result == null) continue;
            this.remaining = result[1];
            this.location += result[0].length - result[1].length;
            return { token: { type }, location };
        }
        const kMatch = toConsider.match(keywordRegex);
        if (kMatch && kMatch[1]) {
            return {
                token: { type: "Keyword", value: kMatch[1] },
                location
            };
        }
        throw new Error(
            "Token could not be extracted from " + toConsider
        );
    }

    static extractAll(from: string) {
        const parser = new TokenParser(from);
        const tokens: TokenParserReturn[] = [];
        let token: TokenParserReturn;
        do {
            token = parser.nextToken();
        } while (token.token.type !== "EOF");
        return tokens;
    }
}
