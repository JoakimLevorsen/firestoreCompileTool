import { BaseParser, WAIT, ParserError } from "../../src/parser";
import TokenParser from "../../src/parser/TokenParser";
import { Token } from "../../src/types";

const tokenize = (input: string) => {
    const tParser = new TokenParser(input);
    const tokens: Token[] = [];
    while (true) {
        const next = tParser.getNext();
        if (!next) return tokens;
        tokens.push(next);
    }
};

export const didntFinish = "Didn't finish";

const ParserRunner = <P extends BaseParser>(
    input: string,
    parser: P
) => {
    const tokens = tokenize(input).map((token, index) => ({
        index,
        token
    }));
    type returnType = ReturnType<P["addToken"]>;
    for (const { index, token } of tokens) {
        const nextToken =
            tokens.length > index + 1
                ? tokens[index + 1].token
                : null;
        const pReturn = parser.addToken(token, nextToken);
        if (pReturn !== WAIT) {
            if (pReturn instanceof ParserError) {
                return pReturn;
            } else {
                return pReturn as returnType;
            }
        }
    }
    return didntFinish;
};

export default ParserRunner;
