import { BinaryExpression } from "../../types/expressions";
import {
    BlockStatement,
    RuleHeader,
    RuleHeaders,
    RuleStatement
} from "../../types/statements";
import { spaceTokens, Token, tokenHasType } from "../../types/Token";
import ComparisonExpressionParser from "../expression/ComparisonExpressionParser";
import Parser from "../Parser";
import ParserGroup from "../ParserGroup";
import { BlockStatementParser } from "./BlockStatementParser";

export class RuleStatementParser extends Parser {
    private start = NaN;
    private state:
        | "awaiting header"
        | "awaiting nextOrOpen"
        | "awaiting rule"
        | "building rule" = "awaiting header";
    private headers: RuleHeader[] = [];
    private body?: BlockStatement | BinaryExpression;
    private subParser = new ParserGroup(
        new ComparisonExpressionParser(this.errorCreator),
        new BlockStatementParser(this.errorCreator)
    );

    public addToken(token: Token): RuleStatement | null {
        const error = this.errorCreator(token);
        if (isNaN(this.start) && token.type !== " ")
            this.start = token.location;
        switch (this.state) {
            case "awaiting header":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type !== "Keyword")
                    throw error("Unexpected token");
                if (!RuleHeaders.some(h => token.value === h))
                    throw error("Unexpected token");
                this.headers.push(token.value as RuleHeader);
                this.state = "awaiting nextOrOpen";
                return null;
            case "awaiting nextOrOpen":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (
                    !(
                        token.type === "," ||
                        token.type === "|" ||
                        token.type === ":"
                    )
                )
                    throw error("Unexpected token");
                if (token.type !== ":") {
                    this.state = "awaiting header";
                } else this.state = "awaiting rule";
                return null;
            case "awaiting rule":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
            case "building rule":
                this.state = "building rule";
                if (this.subParser.canAccept(token)) {
                    const result = this.subParser.addToken(token);
                    if (result && result[0]) {
                        // Since we know the result either is a BlockStatement or a ComparisonExpression, we just cast it
                        this.body = result[0] as BlockStatement;
                        const end =
                            token.location +
                            (token.type === "Keyword"
                                ? token.value.length - 1
                                : token.type.length - 1);
                        return new RuleStatement(
                            { start: this.start, end },
                            this.headers,
                            this.body
                        );
                    }
                    return null;
                }
                // If the token is ; we just accept it.
                if (token.type === ";") return null;
                throw error("Unexpected token");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "awaiting header":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
                if (token.type !== "Keyword") return false;
                return RuleHeaders.some(h => h === token.value);
            case "awaiting nextOrOpen":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    ",",
                    ":"
                ]);
            case "awaiting rule":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
            case "building rule":
                return (
                    this.subParser.canAccept(token) ||
                    token.type === ";"
                );
        }
    }
}
