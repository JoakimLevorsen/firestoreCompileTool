import Parser from "../../../src/parser/parsers/Parser";
import { TokenParser } from "../../../src/parser/TokenParser";
import SyntaxComponent from "../../../src/parser/types/SyntaxComponent";
import { Token } from "../../../src/parser/types/Token";

export const tokenize = (input: string) => {
    const tParser = new TokenParser(input);
    const tokens: Token[] = [];
    while (true) {
        const next = tParser.nextToken();
        if (next.type === "EOF") return tokens;
        tokens.push(next);
    }
};

export const didntFinish = "Didn't finish";

const ParserRunner = <P extends Parser>(
    input: Token[],
    parser: P
) => {
    let lastReturn: SyntaxComponent | undefined;
    for (const token of input) {
        if (!parser.canAccept(token)) return lastReturn;
        const pReturn = parser.addToken(token);
        // if (pReturn !== null) {
        lastReturn = pReturn || undefined;
        // }
    }
    return lastReturn || didntFinish;
};

export default ParserRunner;
