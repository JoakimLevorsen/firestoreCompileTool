import BaseParser from "./BaseParser";
import { ExpressionGroup } from "../types/conditions/ConditionGroup";
import { Token, Expression } from "../types";
import ParserError from "./ParserError";
import { WAIT } from ".";
import ExpressionParser from "./ExpressionParser";

export default class ExpressionGroupParser extends BaseParser {
    private stage: "building expression" | "awaiting logic" =
        "building expression";
    private newExpression?: ExpressionGroup;
    private deepParser?: ExpressionGroupParser | ExpressionParser;

    postConstructor() {}

    addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | { type: "Expression"; data: Expression }
        | { type: "ExpressionGroup"; data: ExpressionGroup } {
        const builderError = this.buildError(token, this.stage);
        switch (this.stage) {
            case "building expression":
                if (!this.deepParser) {
                    /* If no parser has been set, we either set an Expression or ExpressionGroup parser.
                    Depending on if we encounter a (.
                        */
                    if (token.type === "(") {
                        this.deepParser = this.spawn(
                            ExpressionGroupParser
                        );
                        // Since this would create an infinite loop, we return here
                        return WAIT;
                    }
                    this.deepParser = this.spawn(ExpressionParser);
                }
                const deepResponse = this.deepParser.addToken(
                    token,
                    nextToken
                );
                if (
                    deepResponse === "WAIT" ||
                    deepResponse instanceof ParserError
                ) {
                    return deepResponse;
                }
                if (this.newExpression) {
                    this.newExpression.addExpression(
                        deepResponse.data
                    );
                } else {
                    this.newExpression = new ExpressionGroup(
                        deepResponse.data
                    );
                }
                // We check if this is the end of the expressionGroup
                if (
                    nextToken &&
                    (nextToken.type === ";" ||
                        nextToken.type === "{" ||
                        nextToken.type === "}")
                ) {
                    const expression = this.newExpression!.ifOnlyExpressionReturn();
                    if (expression) {
                        return {
                            type: "Expression",
                            data: expression
                        };
                    }
                    return {
                        type: "ExpressionGroup",
                        data: this.newExpression!
                    };
                }
                this.stage = "awaiting logic";
                return WAIT;
            case "awaiting logic":
                if (token.type === "|" || token.type === "&") {
                    this.newExpression!.addLogic(
                        token.type === "&" ? "&&" : "||"
                    );
                    this.deepParser = undefined;
                    this.stage = "building expression";
                    return WAIT;
                }
                return builderError("Unexpected token");
        }
    }

    private buildError = (token: Token, stage: string) => (
        reason: string
    ) => new ParserError(reason, token, ExpressionGroupParser, stage);
}
