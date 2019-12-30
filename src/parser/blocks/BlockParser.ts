import { Block, Token } from "../../types";
import {
    WAIT,
    ParserError,
    AbstractBlockParser,
    InterfaceParser,
    MatchBlockParser,
    ConstantParser
} from "..";

export class BlockParser extends AbstractBlockParser {
    private deepParser:
        | InterfaceParser
        | MatchBlockParser
        | ConstantParser
        | null = null;
    private block: Block = new Block();

    postConstructor() {
        // We create the global state
        this.blockChain.push(new Block());
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
        const deepParserReturn = this.deepParser.addToken(
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
            this.block.addMatchBlock(deepParserReturn.data);
        } else if (deepParserReturn.type === "Constant") {
            this.block.addConstant(deepParserReturn.data);
        } else {
            this.block.addInterface(
                deepParserReturn.data.name,
                deepParserReturn.data.interface
            );
        }
        return WAIT;
    }
}
