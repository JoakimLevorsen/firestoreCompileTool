import { ParserError } from "./ParserError";
import { Block, Token } from "../types";
import { BlockParser } from "./blocks";
import { WAIT } from "./WAIT";
import TokenParser from "./TokenParser";

export * from "./BaseParser";
export * from "./ParserError";
export * from "./WAIT";
export * from "./blocks";
export * from "./expression";
export * from "./ConditionParser";
export * from "./GroupParser";
export * from "./InterfaceParser";
export * from "./TypeParser";

const parse = (input: string, debug = false): Block | null => {
    const blockParser = new BlockParser(new Block());
    const tokenParser = new TokenParser(input);
    let nextToken: Token | null = null;
    do {
        const thisToken = nextToken;
        nextToken = tokenParser.getNext();
        if (!thisToken && nextToken) continue;
        if (thisToken === null) break;
        const response = blockParser.addToken(
            thisToken,
            nextToken ? nextToken : null
        );
        if (response instanceof ParserError) {
            console.log("failed on", tokenParser.line);
            throw response.getError();
        }
        if (response !== WAIT) {
            return response.data;
        } else console.log("Should wait");
    } while (true);
    return blockParser.getBlock();
    return null;
};

export default parse;
