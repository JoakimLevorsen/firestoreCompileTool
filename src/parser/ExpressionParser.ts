import { WAIT } from ".";
import {
    Expression,
    KeywordObject,
    Token,
    TokenType
} from "../types";
import BaseParser from "./BaseParser";
import ParserError from "./ParserError";

export default class ExpressionParser extends BaseParser {
    private stage:
        | "awaiting conditionVal"
        | "awaiting oprerator"
        | "awaiting conditionFin" = "awaiting conditionVal";
    private conditionVal?: KeywordObject;
    private operatior?: string;

    // tslint:disable-next-line: no-empty
    public postConstructor() {}

    public addToken(
        token: Token
    ): ParserError | WAIT | { type: "Expression"; data: Expression } {
        const builderError = this.buildError(token, this.stage);
        switch (this.stage) {
            case "awaiting conditionVal":
                if (token.type !== "Keyword") {
                    return builderError("Expected keyword");
                }
                if (
                    token.value === "true" ||
                    token.value === "false"
                ) {
                    // We got a value, so we just return that
                    if (token.value === "true") {
                        return { type: "Expression", data: true };
                    }
                    return { type: "Expression", data: false };
                }
                // Then we assume that the token is an item
                // TODO: Check this
                this.conditionVal = new KeywordObject(
                    token.value,
                    this.interfaces,
                    this.variablePathComponents
                );
                this.stage = "awaiting oprerator";
                return WAIT;
            case "awaiting oprerator":
                if (
                    token.type === "Equals" ||
                    token.type === "NotEquals"
                ) {
                    this.operatior = token.type;
                    this.stage = "awaiting conditionFin";
                    return WAIT;
                }
                if (token.type !== "Keyword") {
                    return builderError(
                        "Unexpected token type, condition is " +
                            this.conditionVal
                    );
                }
                // We now check for the valid keywords
                switch (token.value) {
                    case "is":
                    case "only":
                    case "isOnly":
                        this.operatior = token.value;
                        this.stage = "awaiting conditionFin";
                        return WAIT;
                    default:
                        return builderError("Unknown operator");
                }
            case "awaiting conditionFin":
                return this.finalizeExpression(token, builderError);
        }
    }

    private finalizeExpression(
        token: Token,
        builderError: (reason: string) => ParserError
    ): ReturnType<ExpressionParser["addToken"]> {
        if (token.type !== "Keyword") {
            return builderError("Expected keyword");
        }
        if (!this.operatior || !this.conditionVal) {
            return builderError("Internal error");
        }
        // Depending on the operator our next path changes.
        switch (this.operatior) {
            case "is":
            case "only":
            case "isOnly":
                return this.finalizeIsOperator(
                    token,
                    builderError,
                    this.operatior
                );
            case "Equals":
            case "NotEquals":
                return this.finalizeEqualsOperator(
                    token,
                    builderError
                );
            default:
                return builderError("Non valid comparison type");
        }
    }

    private finalizeIsOperator(
        token: Token,
        builderError: (reason: string) => ParserError,
        operatior: "is" | "only" | "isOnly"
    ): ReturnType<ExpressionParser["addToken"]> {
        if (token.type !== "Keyword") {
            return builderError("Expected keyword");
        }
        if (!this.interfaces[token.value]) {
            return builderError("Unknown interface");
        }
        return {
            data: [
                this.conditionVal!,
                operatior,
                this.interfaces[token.value]
            ],
            type: "Expression"
        };
    }

    private finalizeEqualsOperator(
        token: Token,
        builderError: (reason: string) => ParserError
    ): ReturnType<ExpressionParser["addToken"]> {
        // TODO: Add support for more == types than bool
        if (token.type !== "Keyword") {
            return builderError("Expected keyword");
        }
        if (token.value === "true" || token.value === "false") {
            // We got a value, so we just return that
            return {
                data: [
                    this.conditionVal!,
                    this.operatior === "Equals" ? "=" : "≠",
                    token.value
                ],
                type: "Expression"
            };
        }
        return builderError("Unknown equality value check");
    }

    private buildError = (token: Token, stage: string) => (
        reason: string
    ) => new ParserError(reason, token, ExpressionParser, stage);
}
