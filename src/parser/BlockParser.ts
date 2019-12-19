import BaseParser from "./BaseParser";
import { Block, Token, TokenType } from "../types";
import { ParserError } from "./ParserError";
import { WAIT } from "../oldParsers";

export default class BlockParser extends BaseParser {
    private deepParser;

    postConstructor() {
        // We create the global state
        this.blockChain.push(new Block());
    }

    addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: "Block"; data: Block } {}
}
