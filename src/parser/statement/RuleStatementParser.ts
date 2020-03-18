import { BlockStatementParser } from ".";
import { spaceTokens, Token, tokenHasType } from "../../types";
import { BinaryExpression } from "../../types/expressions";
import {
    BlockStatement,
    RuleHeader,
    RuleHeaders,
    RuleStatement
} from "../../types/statements";
import ExpressionParser from "../expression/ExpressionParser";
import Parser from "../Parser";
import ParserGroup from "../ParserGroup";

export class RuleStatementParser extends Parser {
    private start = NaN;
    private state:
        | "awaiting header"
        | "awaiting nextOrOpen"
        | "awaiting params open"
        | "awaiting param"
        | "awaiting param seperator"
        | "awaiting arrow"
        | "awaiting rule"
        | "building rule" = "awaiting header";
    private headers: RuleHeader[] = [];
    private body?: BlockStatement | BinaryExpression;
    private params: Array<string | undefined> = [];
    private subParser = new ParserGroup(
        new ExpressionParser(this.errorCreator),
        new BlockStatementParser(this.errorCreator)
    );

    public addToken(token: Token): RuleStatement | null {
        const error = this.errorCreator(token);
        if (isNaN(this.start) && token.type !== " ")
            this.start = token.location;
        switch (this.state) {
            case "awaiting header":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type !== "Keyword")
                    throw error("Unexpected token");
                if (!RuleHeaders.some(h => token.value === h))
                    throw error("Unexpected token");
                this.headers.push(token.value as RuleHeader);
                this.state = "awaiting nextOrOpen";
                return null;
            case "awaiting nextOrOpen":
                if (tokenHasType(token, [...spaceTokens]))
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
                } else this.state = "awaiting params open";
                return null;
            case "awaiting params open":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type !== "(") throw error("Expected '('");
                this.state = "awaiting param";
                return null;
            case "awaiting param":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === ")") {
                    this.state = "awaiting arrow";
                    return null;
                }
                if (token.type !== "_" && token.type !== "Keyword")
                    throw error("Expected _ or keyword");
                this.state = "awaiting param seperator";
                if (token.type === "Keyword") {
                    this.params.push(token.value);
                } else this.params.push(undefined);
                return null;
            case "awaiting param seperator":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === ",") {
                    this.state = "awaiting param";
                    return null;
                }
                if (token.type === ")") {
                    this.state = "awaiting arrow";
                    return null;
                }
                throw error("Expected ',' or ')'");
            case "awaiting arrow":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type !== "=>") {
                    throw error("Expected => after parameters");
                }
                this.state = "awaiting rule";
                return null;
            case "awaiting rule":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
            case "building rule":
                this.state = "building rule";
                if (this.subParser.canAccept(token)) {
                    const result = this.subParser.addToken(token);
                    if (result && result[0]) {
                        // Since we know the result either is a BlockStatement or a ComparisonExpression, we just cast it
                        this.body = result[0] as BlockStatement;
                        if (this.params.length > 2)
                            throw error(
                                "Only two or less parameters expected for rule"
                            );
                        const [newDoc, oldDoc] = this.params;
                        const end =
                            token.location +
                            (token.type === "Keyword"
                                ? token.value.length - 1
                                : token.type.length - 1);
                        return new RuleStatement(
                            { start: this.start, end },
                            this.headers,
                            { newDoc, oldDoc },
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
                if (tokenHasType(token, [...spaceTokens]))
                    return true;
                if (token.type !== "Keyword") return false;
                return RuleHeaders.some(h => h === token.value);
            case "awaiting nextOrOpen":
                return tokenHasType(token, [
                    ...spaceTokens,
                    ",",
                    ":"
                ]);
            case "awaiting params open":
                return tokenHasType(token, [...spaceTokens, "("]);
            case "awaiting param":
                if (tokenHasType(token, [...spaceTokens, "_", ")"]))
                    return true;
                return token.type === "Keyword";
            case "awaiting param seperator":
                return tokenHasType(token, [
                    ...spaceTokens,
                    ",",
                    ")"
                ]);
            case "awaiting arrow":
                return tokenHasType(token, [...spaceTokens, "=>"]);
            case "awaiting rule":
                if (tokenHasType(token, [...spaceTokens]))
                    return true;
            case "building rule":
                return (
                    this.subParser.canAccept(token) ||
                    token.type === ";"
                );
        }
    }
}
