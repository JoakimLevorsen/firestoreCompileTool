import ConditionParser from "../ConditionParser";
import {
    Token,
    ReturnExpression,
    valueForToken,
    InterfaceValue
} from "../../types";
import {
    ParserError,
    WAIT,
    ParserErrorBuilder,
    BaseParser
} from "..";

export class ReturnParser extends BaseParser {
    private stage:
        | "awaiting keyword"
        | "building condition"
        | "building expression" = "awaiting keyword";
    private partialError = ParserErrorBuilder(ReturnParser);
    private conditionBuilder = this.spawn(ConditionParser);

    addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | {
              type: "ReturnExpression";
              data: ReturnExpression;
          } {
        const errorBuilder = this.partialError(this.stage, token);
        switch (this.stage) {
            case "awaiting keyword":
                if (
                    token.type !== "Keyword" ||
                    token.value !== "return"
                ) {
                    return errorBuilder("Expecting keyword return");
                }
                this.stage = "building expression";
                return WAIT;
            case "building expression":
                // We get the first term
                if (token.type !== "Keyword") {
                    return errorBuilder("Expected keyword");
                }
                const firstVal = valueForToken(
                    token,
                    this.parentBlock
                );
                if (firstVal === null) {
                    return errorBuilder(
                        "Could not extract value from token"
                    );
                }
                if (firstVal instanceof InterfaceValue) {
                    return errorBuilder(
                        "Cannot return interface types"
                    );
                }
                // Now if the next character is a semi colon, just return this,
                // Otherwise this is an expression
                if (nextToken && nextToken.type === ";") {
                    return {
                        type: "ReturnExpression",
                        data: new ReturnExpression(firstVal)
                    };
                }
                // If we're here, it's a condition, so we build on
                this.stage = "building condition";
            // We fall into the next statement as intended
            case "building condition":
                const deepResponse = this.conditionBuilder.addToken(
                    token,
                    nextToken
                );
                if (
                    deepResponse === WAIT ||
                    deepResponse instanceof ParserError
                ) {
                    return deepResponse;
                }
                return {
                    type: "ReturnExpression",
                    data: new ReturnExpression(deepResponse.data)
                };
        }
    }
}
