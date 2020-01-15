import {
    IfBlock,
    Token,
    IfBlockBuilder,
    CodeBlock
} from "../../types";
import { ParserError, WAIT, ParserErrorBuilder } from "..";
import ConditionParserConstructor from "../ConditionParser";
import { CodeBlockParser, AbstractBlockParser } from ".";
import { BaseParser } from "../BaseParser";

export class IfBlockParser extends BaseParser
    implements AbstractBlockParser {
    /*
    This parsers stages are more complicated,
    true: is the codeblock to run if true 
    else: is the codeblock to run if the expression is false
    after: is the codeblock to run after else, only if else ran.
    */
    private stage:
        | "awaiting keyword"
        | "condition"
        | "true"
        | "else"
        | "after" = "awaiting keyword";
    private partialError = ParserErrorBuilder(IfBlockParser);
    private conditionParser = ConditionParserConstructor(
        this.blockChain
    );
    private blockBuilder = new IfBlockBuilder();
    private codeParser = this.spawn(CodeBlockParser);
    private blockStarted = false;
    private elseKeywordSeen = false;
    private elseBlock?: CodeBlock;

    postConstructor() {}

    addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: "IfBlock"; data: IfBlock } {
        const errorBuilder = this.partialError(this.stage, token);
        switch (this.stage) {
            case "awaiting keyword":
                if (
                    token.type === "Keyword" &&
                    token.value === "if"
                ) {
                    this.stage = "condition";
                    return WAIT;
                }
                return errorBuilder("Unexpected token");
            case "condition":
                const conditionReturn = this.conditionParser.addToken(
                    token,
                    nextToken
                );
                if (
                    conditionReturn === WAIT ||
                    conditionReturn instanceof ParserError
                ) {
                    return conditionReturn;
                }
                this.blockBuilder.setCondition(conditionReturn.data);
                this.stage = "true";
                return WAIT;
            case "true":
                if (!this.blockStarted) {
                    if (token.type === "{") {
                        this.blockStarted = true;
                        return WAIT;
                    } else
                        return errorBuilder(
                            "Expected block open after condition"
                        );
                }
                const codeResponse = this.codeParser.addToken(
                    token,
                    nextToken
                );
                if (
                    codeResponse === WAIT ||
                    codeResponse instanceof ParserError
                ) {
                    return codeResponse;
                }
                this.blockBuilder.setIfTrue(codeResponse.data);
                this.stage = "else";
                this.blockStarted = false;
                this.codeParser = this.spawn(CodeBlockParser);
                return WAIT;
            case "else":
                if (!this.elseKeywordSeen) {
                    if (
                        token.type === "Keyword" &&
                        token.value === "else"
                    ) {
                        this.elseKeywordSeen = true;
                        return WAIT;
                    }
                    // There is no else, we just continue.
                    this.stage = "after";
                    return WAIT;
                }
                if (!this.blockStarted) {
                    if (token.type === "{") {
                        this.blockStarted = true;
                        return WAIT;
                    }
                    return errorBuilder("Unexpected token");
                }
                const elseResponse = this.codeParser.addToken(
                    token,
                    nextToken
                );
                if (
                    elseResponse === WAIT ||
                    elseResponse instanceof ParserError
                ) {
                    return elseResponse;
                }
                this.elseBlock = elseResponse.data;
                this.codeParser = this.spawn(CodeBlockParser);
                this.stage = "after";
                return WAIT;
            case "after":
                // So this is weird, since we have to return before a } appears.
                const afterResponse = this.codeParser.addToken(
                    token,
                    nextToken,
                    false
                );
                if (
                    afterResponse === WAIT ||
                    afterResponse instanceof ParserError
                ) {
                    return afterResponse;
                }
                // Now we have the response before the } and we return it
                const newBlock = afterResponse.data;
                if (this.elseBlock) {
                    newBlock.insertFirst(this.elseBlock);
                }
                this.blockBuilder.setIfFalse(newBlock);
                return {
                    type: "IfBlock",
                    data: this.blockBuilder.getIfBlock()
                };
        }
    }
}
