import { ParserError, WAIT, ParserErrorBuilder } from ".";
import {
    Token,
    Condition,
    ConditionBuilder,
    valueForToken,
    InterfaceValue
} from "../types";
import GroupParser from "./GroupParser";

export default class ConditionParser extends GroupParser<Condition> {
    private subStage:
        | "awaiting first"
        | "awaiting comparison"
        | "awaiting second" = "awaiting first";
    private subPartialError = ParserErrorBuilder(ConditionParser);
    private builder = new ConditionBuilder();

    spawnClone = () => new ConditionParser(this.blockChain);

    subParse(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | {
              type: "Sub";
              data: Condition;
          } {
        const errorBuilder = this.subPartialError(
            this.subStage,
            token
        );
        switch (this.subStage) {
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
                this.subStage = "awaiting comparison";
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
                this.subStage = "awaiting second";
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
                    type: "Sub",
                    data: this.builder.getCondition()
                };
        }
    }
}
