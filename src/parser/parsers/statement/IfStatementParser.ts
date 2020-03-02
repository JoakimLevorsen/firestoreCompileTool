import {
    BinaryExpression,
    isBinaryExpression
} from "../../types/expressions/BinaryExpression";
import { BlockStatement, IfStatement } from "../../types/statements";
import { spaceTokens, tokenHasType } from "../../types/Token";
import ComparisonExpressionParser from "../expression/ComparisonExpressionParser";
import Parser from "../Parser";
import ParserGroup from "../ParserGroup";
import { BlockStatementParser } from "./";

export class IfStatementParser extends Parser {
    private state:
        | "awaiting keyword"
        | "building condition"
        | "building block"
        | "awaiting else"
        | "building alternate" = "awaiting keyword";
    private conditionBuilder = new ComparisonExpressionParser(
        this.errorCreator
    );
    private condition?: BinaryExpression;
    private blockBuilder = new BlockStatementParser(
        this.errorCreator
    );
    private block?: BlockStatement;
    private alternateParser?: ParserGroup;
    private alternate?: IfStatement | BlockStatement;
    private start = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): import("../../types/SyntaxComponent").default | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "awaiting keyword":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type === "if") {
                    this.state = "building condition";
                    return null;
                }
                throw error("Unexpected token");
            case "building condition":
                if (this.conditionBuilder.canAccept(token)) {
                    const result = this.conditionBuilder.addToken(
                        token
                    );
                    if (result && isBinaryExpression(result)) {
                        this.condition = result;
                    }
                    return null;
                } else {
                    // Then we assume we've moved on to the block
                    this.state = "building block";
                }
            case "building block":
                if (this.blockBuilder.canAccept(token)) {
                    const result = this.blockBuilder.addToken(token);
                    if (result && result instanceof BlockStatement) {
                        // If a block has been returned, this parser is done
                        this.block = result;
                        this.state = "awaiting else";
                        return new IfStatement(
                            this.start,
                            this.condition!,
                            this.block!
                        );
                    }
                    return null;
                }
                throw error("Unexpected token");
            case "awaiting else":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type === "else") {
                    this.state = "building alternate";
                    return null;
                }
                throw error("Unexpected token");
            case "building alternate":
                if (!this.alternateParser) {
                    if (tokenHasType(token.type, [...spaceTokens]))
                        return null;
                    this.alternateParser = new ParserGroup(
                        new IfStatementParser(this.errorCreator),
                        new BlockStatementParser(this.errorCreator)
                    );
                }
                if (this.alternateParser.canAccept(token)) {
                    const result = this.alternateParser.addToken(
                        token
                    );
                    if (result && result.length === 1) {
                        const actual = result[0];
                        if (
                            actual instanceof BlockStatement ||
                            actual instanceof IfStatement
                        ) {
                            this.alternate = actual;
                            return new IfStatement(
                                this.start,
                                this.condition!,
                                this.block!,
                                this.alternate
                            );
                        }
                    }
                    return null;
                }
                throw error("Unexpected token");
        }
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        switch (this.state) {
            case "awaiting keyword":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "if"
                ]);
            case "building condition":
                if (this.conditionBuilder.canAccept(token))
                    return true;
                // Otherwise we assume we've moved on to the block
                this.state = "building block";
            case "building block":
                return this.blockBuilder.canAccept(token);
            case "awaiting else":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "else"
                ]);
            case "building alternate":
                if (!this.alternateParser) {
                    if (tokenHasType(token.type, [...spaceTokens]))
                        return true;
                    this.alternateParser = new ParserGroup(
                        new IfStatementParser(this.errorCreator),
                        new BlockStatementParser(this.errorCreator)
                    );
                }
                return this.alternateParser.canAccept(token);
        }
    }
}
