import {
    ParserError,
    WAIT,
    ParserErrorBuilder,
    BaseParser,
    GroupParser
} from ".";
import {
    Token,
    Condition,
    BlockChain,
    ConditionBuilder,
    valueForToken,
    InterfaceValue
} from "../types";

// Since a condition is most likely wrapped in parentesees
// or has && and/or || logic involved, we export a parser wrapped in a GroupParser.
export default function ConditionParserConstructor(
    blockChain?: BlockChain
): GroupParser<InnerConditionParser, Condition> {
    return new GroupParser(blockChain!, InnerConditionParser);
}

export type ConditionParser = ReturnType<
    typeof ConditionParserConstructor
>;

class InnerConditionParser extends BaseParser {
    private stage:
        | "awaiting first"
        | "awaiting comparison"
        | "awaiting second" = "awaiting first";
    private partialError = ParserErrorBuilder(InnerConditionParser);
    private builder = new ConditionBuilder();
    postConstructor = () => {};

    addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | {
              type: "Condition";
              data: Condition;
          } {
        const errorBuilder = this.partialError(this.stage, token);
        switch (this.stage) {
            case "awaiting first":
                if (token.type !== "Keyword") {
                    return errorBuilder(
                        `Expected keyword not ${token}`
                    );
                }
                const firstVal = valueForToken(
                    token,
                    this.getScope()
                );
                if (firstVal === null) {
                    return errorBuilder(`Could not extract value`);
                }
                if (firstVal instanceof InterfaceValue) {
                    return errorBuilder(
                        "Comparing an interface value to something would always yield the same response."
                    );
                }
                this.builder.setFirstValue(firstVal);
                this.stage = "awaiting comparison";
                return WAIT;
            case "awaiting comparison":
                if (token.type === "=" || token.type === "≠") {
                    this.builder.setOperator(token.type);
                } else if (
                    token.type === "Keyword" &&
                    (token.value === "is" ||
                        token.value === "only" ||
                        token.value === "isOnly")
                ) {
                    this.builder.setOperator(token.value);
                } else {
                    return errorBuilder(
                        "Expected comparison of ==, ||, is, only or isOnly"
                    );
                }
                this.stage = "awaiting second";
                return WAIT;
            case "awaiting second":
                if (token.type !== "Keyword") {
                    return errorBuilder(
                        `Expected keyword not ${token}`
                    );
                }
                const secondVal = valueForToken(
                    token,
                    this.getScope()
                );
                if (secondVal === null) {
                    return errorBuilder(`Could not extract value`);
                }
                this.builder.setSecondValue(secondVal);
                return {
                    type: "Condition",
                    data: this.builder.getCondition()
                };
        }
    }
}
