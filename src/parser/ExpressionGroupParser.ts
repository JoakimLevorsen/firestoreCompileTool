import BaseParser from "./BaseParser";
import { ExpressionGroup } from "../types/ExpressionGroup";
import { Token, Expression } from "../types";
import ParserError from "./ParserError";
import { WAIT } from ".";
import ExpressionParser from "./ExpressionParser";

export default class ExpressionGroupParser extends BaseParser {
    private stage: "building expression" | "awaiting logic" =
        "building expression";
    private newExpression?: ExpressionGroup;
    private expressionParser = this.spawn(ExpressionParser);

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
                const deepResponse = this.expressionParser.addToken(
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
                    (nextToken.type === "SemiColon" ||
                        nextToken.type === "BlockClose" ||
                        nextToken.type === "BlockOpen")
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
                if (token.type === "Or" || token.type === "And") {
                    this.newExpression!.addLogic(
                        token.type === "And" ? "&&" : "||"
                    );
                    this.expressionParser = this.spawn(
                        ExpressionParser
                    );
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
