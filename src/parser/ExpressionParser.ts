import { WAIT } from ".";
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
                this.conditionVal = token.value;
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
                if (token.value === "is") {
                    this.operatior = token.value;
                    this.stage = "awaiting conditionFin";
                    return WAIT;
                }
                return builderError("Unknown operator");
            case "awaiting conditionFin":
                if (token.type !== "Keyword") {
                    return builderError("Expected keyword");
                }
                if (!this.operatior || !this.conditionVal) {
                    return builderError("Internal error");
                }
                // Depending on the operator our next path changes.
                if (this.operatior === "is") {
                    if (!this.interfaces[token.value]) {
                        return builderError("Unknown interface");
                    }
                    return {
                        data: [
                            this.conditionVal,
                            "is",
                            this.interfaces[token.value]
                        ],
                        type: "Expression"
                    };
                }
                if (
                    this.operatior === "Equals" ||
                    this.operatior === "NotEquals"
                ) {
                    if (
                        token.value === "true" ||
                        token.value === "false"
                    ) {
                        // We got a value, so we just return that
                        return {
                            data: [
                                this.conditionVal,
                                this.operatior === "Equals"
                                    ? "="
                                    : "≠",
                                token.value
                            ],
                            type: "Expression"
                        };
                    }
                }
                // TODO: Add support for more == types than bool
                return builderError("Non valid comparison type");
        }
    }

    private buildError = (token: Token, stage: string) => (
        reason: string
    ) => new ParserError(reason, token, ExpressionParser, stage);
}
