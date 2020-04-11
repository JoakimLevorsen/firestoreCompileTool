import { tokenParser } from "../../src/parser/TokenParser";
import Parser from "../../src/parser/Parser";
import ParserGroup from "../../src/parser/ParserGroup";
import { Token } from "../../src/types";
import SyntaxComponent from "../../src/types/SyntaxComponent";

export const tokenize = (input: string) => {
    const tParser = tokenParser(input);
    const tokens: Token[] = [];
    while (true) {
        const next = tParser.next().value;
        if (next.type === "EOF") return tokens;
        tokens.push(next);
    }
};

export const didntFinish = "Didn't finish";

const ParserRunner = <P extends Parser | ParserGroup>(
    input: Token[],
    parser: P
) => {
    let lastReturn: SyntaxComponent | SyntaxComponent[] | null = null;
    for (const token of input) {
        if (!parser.canAccept(token)) {
            return lastReturn;
        }
        const pReturn = parser.addToken(token);
        lastReturn = pReturn ?? null;
    }
    return lastReturn ?? didntFinish;
};

export default ParserRunner;
