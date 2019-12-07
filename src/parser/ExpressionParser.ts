import { WAIT } from ".";
import {
    ConditionBuilder,
    Expression,
    KeywordObject,
    Token,
    Interface
} from "../types";
import RawValue from "../types/RawValue";
import BaseParser from "./BaseParser";
import ParserError from "./ParserError";

export default class ExpressionParser extends BaseParser {
    private stage:
        | "awaiting conditionVal"
        | "awaiting oprerator"
        | "awaiting conditionFin" = "awaiting conditionVal";
    private conditionBuilder = new ConditionBuilder();

    // tslint:disable-next-line: no-empty
    public postConstructor() {}

    public addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: "Expression"; data: Expression } {
        const builderError = this.buildError(token, this.stage);
        switch (this.stage) {
            case "awaiting conditionVal":
                if (token.type !== "Keyword") {
                    return builderError("Expected keyword");
                }
                // Then we assume that the token is an item or rawValue
                const rawValue = RawValue.toRawValue(token);
                if (rawValue) {
                    this.conditionBuilder.setFirstValue(rawValue);
                } else {
                    // TODO: Check this
                    this.conditionBuilder.setFirstValue(
                        new KeywordObject(
                            token.value,
                            this.interfaces,
                            this.variablePathComponents
                        )
                    );
                }
                // We check if a semiColon is upcomming, if so we return now
                if (nextToken && nextToken.type === "SemiColon") {
                    return {
                        data: this.conditionBuilder.getExpression(),
                        type: "Expression"
                    };
                }
                this.stage = "awaiting oprerator";
                return WAIT;
            case "awaiting oprerator":
                if (
                    token.type === "Equals" ||
                    token.type === "NotEquals"
                ) {
                    this.conditionBuilder.setOperator(
                        token.type === "Equals" ? "=" : "≠"
                    );
                    this.stage = "awaiting conditionFin";
                    return WAIT;
                }
                if (token.type !== "Keyword") {
                    return builderError(
                        "Unexpected token type, condition is " +
                            JSON.stringify(this.conditionBuilder)
                    );
                }
                // We now check for the valid keywords
                switch (token.value) {
                    case "is":
                    case "only":
                    case "isOnly":
                        this.conditionBuilder.setOperator(
                            token.value
                        );
                        this.stage = "awaiting conditionFin";
                        return WAIT;
                    default:
                        return builderError("Unknown operator");
                }
            case "awaiting conditionFin":
                if (token.type !== "Keyword") {
                    return builderError("Expected keyword");
                }
                const newRawValue = RawValue.toRawValue(token);
                const keywordValue = KeywordObject.toKeywordObject(
                    token.value,
                    this.interfaces,
                    this.variablePathComponents
                );
                const target =
                    newRawValue ||
                    this.interfaces[token.value] ||
                    keywordValue;
                if (target) {
                    return {
                        data: this.conditionBuilder
                            .setSecondValue(target)
                            .getCondition(),
                        type: "Expression"
                    };
                }
                return builderError("Wat");
        }
    }

    private buildError = (token: Token, stage: string) => (
        reason: string
    ) => new ParserError(reason, token, ExpressionParser, stage);
}
