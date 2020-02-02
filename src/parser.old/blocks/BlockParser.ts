import { Block, Token } from "../../types";
import {
    WAIT,
    ParserError,
    AbstractBlockParser,
    InterfaceParser,
    MatchBlockParser,
    ConstantParser
} from "..";
import { BaseParser } from "../BaseParser";

export class BlockParser extends BaseParser
    implements AbstractBlockParser {
    private deepParser:
        | InterfaceParser
        | MatchBlockParser
        | ConstantParser
        | null = null;

    // Since this is the highest level parser, it's parent block must be it's own
    protected block = this.parentBlock;

    public getBlock() {
        return this.block;
    }

    addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: "Block"; data: Block } {
        if (!this.deepParser) {
            // Since we don't have a parser, we start one
            if (token.type !== "Keyword") {
                // If this is a block close we are done
                if (token.type === "}") {
                    return { type: "Block", data: this.block };
                }
                return new ParserError(
                    "Expected keyword",
                    token,
                    BlockParser
                );
            }
            switch (token.value) {
                case "interface":
                    this.deepParser = this.spawn(InterfaceParser);
                    break;
                case "const":
                    this.deepParser = this.spawn(ConstantParser);
                    break;
                case "match":
                    this.deepParser = this.spawn(MatchBlockParser);
                    break;
                default:
                    return new ParserError(
                        "Keyword not recognized",
                        token,
                        BlockParser
                    );
            }
        }
        const deepParserReturn = this.deepParser!.addToken(
            token,
            nextToken
        );
        if (
            deepParserReturn === WAIT ||
            deepParserReturn instanceof ParserError
        ) {
            return deepParserReturn;
        }
        // We got a result, so we save it and reset the parser for the next block
        if (deepParserReturn.type === "MatchBlock") {
            // If this is a MatchBlock, it has already been added as a child.
        } else if (deepParserReturn.type === "Constant") {
            this.block.addConstant(deepParserReturn.data);
        } else {
            this.block.addInterface(
                deepParserReturn.data.name,
                deepParserReturn.data.interface
            );
        }
        // Then we reset the deepParser
        this.deepParser = null;
        return WAIT;
    }
}