import { Token, CodeBlock, isCondition } from "../../types";
import { ParserError } from "../ParserError";
import { WAIT } from "../WAIT";
import { AbstractBlockParser, IfBlockParser } from ".";
import { ExpressionParser } from "..";
import { BaseParser } from "../BaseParser";

export class CodeBlockParser extends BaseParser
    implements AbstractBlockParser {
    private deepParser?: IfBlockParser | ExpressionParser;
    protected block = this.parentBlock.spawnChild(CodeBlock);

    addToken(
        token: Token,
        nextToken: Token | null,
        eatCloseBlock = true
    ): ParserError | WAIT | { type: "CodeBlock"; data: CodeBlock } {
        // This parser can have two states, using a subparser, or awaiting a new one
        if (!this.deepParser) {
            if (token.type !== "Keyword") {
                if (token.type === ";") {
                    if (!eatCloseBlock && nextToken?.type === "}") {
                        return {
                            type: "CodeBlock",
                            data: this.block
                        };
                    }
                    return WAIT;
                }
                if (token.type === "}" && eatCloseBlock) {
                    return {
                        type: "CodeBlock",
                        data: this.block
                    };
                }
                console.log("nextBlock is", nextToken);
                return new ParserError(
                    "Unexpected Token",
                    token,
                    CodeBlockParser
                );
            }
            if (token.value === "if") {
                this.deepParser = this.spawn(IfBlockParser);
            } else {
                this.deepParser = this.spawn(ExpressionParser);
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
        // We'll reset the parser for the next item
        this.deepParser = undefined;
        if (deepParserReturn.type === "Expression") {
            if (isCondition(deepParserReturn.data)) {
                return new ParserError(
                    "Did not expect condition",
                    token,
                    CodeBlockParser
                );
            }
            this.block.addContent(deepParserReturn.data);
        } else {
            this.block.addContent(deepParserReturn.data);
        }
        if (!eatCloseBlock && nextToken?.type === "}") {
            return { type: "CodeBlock", data: this.block };
        }
        console.log("Next token is", nextToken);
        return WAIT;
    }
}
