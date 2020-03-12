import {
    MinusUniaryExpression,
    NegationUniaryExpression,
    UniaryExpression,
    UniaryOperator,
    UniaryOperators
} from "../../types/expressions";
import Identifier from "../../types/Identifier";
import Literal from "../../types/literal";
import { spaceTokens, Token, tokenHasType } from "../../types/Token";
import IdentifierOrLiteralExtractor from "../IdentifierOrLiteralExtractor";
import LiteralParser from "../literal";
import Parser from "../Parser";

export default class UniaryExpressionParser extends Parser {
    private stage: "awaiting start" | "parsing content" | "done" =
        "awaiting start";
    private subParser?: LiteralParser;
    private operator?: UniaryOperator;
    private start = NaN;

    public addToken(token: Token): UniaryExpression | null {
        const error = this.errorCreator(token);
        if (isNaN(this.start)) this.start = token.location;
        switch (this.stage) {
            case "awaiting start":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (!tokenHasType(token.type, UniaryOperators))
                    throw error("Expected operator");
                this.stage = "parsing content";
                this.operator = token.type as UniaryOperator;
                return null;
            case "parsing content":
                if (!this.subParser) {
                    const returned = IdentifierOrLiteralExtractor(
                        token,
                        this.errorCreator
                    );
                    if (
                        returned instanceof Identifier ||
                        returned instanceof Literal
                    ) {
                        this.stage = "done";
                        if (this.operator === "!")
                            return new NegationUniaryExpression(
                                this.start,
                                "!",
                                returned
                            );
                        return new MinusUniaryExpression(
                            this.start,
                            "-",
                            returned
                        );
                    }
                    if (returned instanceof Parser) {
                        this.subParser = returned;
                        return null;
                    }
                    this.subParser = returned.parser;
                    if (this.operator === "!")
                        return new NegationUniaryExpression(
                            this.start,
                            "!",
                            returned.value
                        );
                    return new MinusUniaryExpression(
                        this.start,
                        "-",
                        returned.value
                    );
                }
                if (this.subParser.canAccept(token)) {
                    const returned = this.subParser.addToken(token);
                    if (returned) {
                        if (this.operator === "!")
                            return new NegationUniaryExpression(
                                this.start,
                                "!",
                                returned
                            );
                        return new MinusUniaryExpression(
                            this.start,
                            "-",
                            returned
                        );
                    }
                    return null;
                }
                throw error("Unexpected token");
            case "done":
                throw error("Unexpected action");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.stage) {
            case "awaiting start":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    ...UniaryOperators
                ]);
            case "parsing content":
                if (this.subParser)
                    return this.subParser.canAccept(token);
                try {
                    IdentifierOrLiteralExtractor(
                        token,
                        this.errorCreator
                    );
                    return true;
                    // tslint:disable-next-line: no-empty
                } catch (e) {}
                return false;
            case "done":
                return false;
        }
    }
}
