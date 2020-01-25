import {
    Expression,
    Token,
    valueForToken,
    InterfaceValue,
    Condition
} from "../../types";
import {
    ParserError,
    WAIT,
    ParserErrorBuilder,
    BaseParser,
    ReturnParser,
    ConstantParser
} from "..";
import ConditionParser from "../ConditionParser";

export class ExpressionParser extends BaseParser {
    private stage: "awaiting start" | "using subparser" =
        "awaiting start";
    private subParser?:
        | ReturnParser
        | ConstantParser
        | ConditionParser;
    private partialError = ParserErrorBuilder(ExpressionParser);
    postConstructor = () => {};

    addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | {
              type: "Expression";
              data: Expression | Condition;
          } {
        const errorBuilder = this.partialError(this.stage, token);
        switch (this.stage) {
            /*
                      This expression could be a RawValue/KeywordValue, a condition, 
                      or any of the conditionParsers
                      */
            case "awaiting start":
                // If the next token is a ; we just return this value
                if (nextToken && nextToken.type === ";") {
                    const firstValue = valueForToken(
                        token,
                        this.parentBlock
                    );
                    if (firstValue === null) {
                        return errorBuilder(
                            "Could not extract value from token"
                        );
                    }
                    if (firstValue instanceof InterfaceValue) {
                        return errorBuilder(
                            "Can not return interfaceValue"
                        );
                    }
                    return { type: "Expression", data: firstValue };
                }
                // Since this wasn't a single value, we start on the parsers.
                this.stage = "using subparser";
                // First we set the parser though
                if (token.type === "Keyword") {
                    if (token.value === "return") {
                        this.subParser = this.spawn(ReturnParser);
                    } else if (token.value === "const") {
                        this.subParser = this.spawn(ConstantParser);
                    } else {
                        this.subParser = this.spawn(ConditionParser);
                    }
                } else return errorBuilder("Expected a keyword");
            case "using subparser":
                const deepResponse = this.subParser!.addToken(
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
                    type: "Expression",
                    data: deepResponse.data
                };
        }
    }
}
