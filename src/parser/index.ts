import { ParserError } from "./ParserError";
import { Block } from "../types";
import { extractNextToken } from "./TokenParser";
import { BlockParser } from "./blocks";
import { WAIT } from "./WAIT";

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
    let remaining = input;
    const blockParser = new BlockParser();
    let nextToken: ReturnType<typeof extractNextToken> = null;
    do {
        const thisToken = nextToken;
        nextToken = extractNextToken(remaining);
        if (nextToken) {
            remaining = nextToken.remaining;
        }
        if (!thisToken && nextToken) continue;
        if (thisToken === null) break;
        const response = blockParser.addToken(
            thisToken.token,
            nextToken ? nextToken.token : null
        );
        if (response instanceof ParserError) {
            throw response;
        }
        if (response !== WAIT) {
            return response.data;
        }
    } while (true);
    return null;
};

export default parse;
