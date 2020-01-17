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

    spawnClone = () => new ConditionParser(this.parentBlock);

    resetSub() {
        this.subStage = "awaiting first";
        this.builder = new ConditionBuilder();
    }

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
                        `Expected keyword 1 not ${JSON.stringify(
                            token
                        )}`
                    );
                }
                const firstVal = valueForToken(
                    token,
                    this.parentBlock
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
                console.log(
                    `Set comparison to ${JSON.stringify(token)}`
                );
                this.subStage = "awaiting second";
                return WAIT;
            case "awaiting second":
                if (token.type !== "Keyword") {
                    return errorBuilder(
                        `Expected keyword 2 not ${JSON.stringify(
                            token
                        )} ${JSON.stringify(this.builder)}`
                    );
                }
                const secondVal = valueForToken(
                    token,
                    this.parentBlock
                );
                if (secondVal === null) {
                    console.log(
                        "Block is",
                        JSON.stringify(this.parentBlock)
                    );
                    return errorBuilder(`Could not extract value`);
                }
                this.builder.setSecondValue(secondVal);
                console.log(
                    "Did return value " +
                        JSON.stringify(this.builder.getCondition())
                );
                return {
                    type: "Sub",
                    data: this.builder.getCondition()
                };
        }
    }
}
