import {
    Token,
    Constant,
    ConstantBuilder,
    valueForToken
} from "../../types";
import { ParserError, WAIT, ParserErrorBuilder } from "..";
import BaseParser from "../BaseParser";

export default class ConstantParser extends BaseParser {
    private stage: "keyword" | "name" | "equals" | "value" =
        "keyword";
    private partialError = ParserErrorBuilder(ConstantParser);
    private builder = new ConstantBuilder();

    postConstructor = () => {};

    addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: "Block"; data: Constant } {
        const errorBuilder = this.partialError(this.stage, token);
        switch (this.stage) {
            case "keyword":
                // Check for keyword
                if (
                    token.type === "Keyword" &&
                    token.value === "const"
                ) {
                    this.stage = "name";
                    return WAIT;
                }
                return errorBuilder(
                    `${JSON.stringify(
                        token
                    )} gotten instead of expected 'const'`
                );
            case "name":
                if (token.type === "Keyword") {
                    this.builder.setName(token.value);
                    this.stage = "equals";
                    return WAIT;
                }
                return errorBuilder(`Expected constant name.`);
            case "equals":
                if (token.type === "=") {
                    this.stage = "value";
                    return WAIT;
                }
                return errorBuilder("Expected ==");
            case "value":
                const value = valueForToken(token, this.getScope());
                if (value) {
                    return {
                        type: "Block",
                        data: this.builder
                            .setValue(value)
                            .getConstant()
                    };
                }
                return errorBuilder("Could not extract value");
        }
    }
}
