import { BlockStatementParser } from ".";
import {
    Identifier,
    spaceTokens,
    Token,
    tokenHasType
} from "../../types";
import {
    BinaryExpression,
    isBinaryExpression,
    MemberExpression
} from "../../types/expressions";
import { BlockStatement, IfStatement } from "../../types/statements";
import SyntaxComponent from "../../types/SyntaxComponent";
import ExpressionParser from "../expression/ExpressionParser";
import Parser from "../Parser";
import ParserGroup from "../ParserGroup";

export class IfStatementParser extends Parser {
    private state:
        | "awaiting keyword"
        | "building condition"
        | "building block"
        | "awaiting else"
        | "building alternate" = "awaiting keyword";
    private conditionBuilder = new ExpressionParser(
        this.errorCreator
    );
    private condition?:
        | BinaryExpression
        | Identifier
        | MemberExpression;
    private blockBuilder = new BlockStatementParser(
        this.errorCreator
    );
    private block?: BlockStatement;
    private alternateParser?: ParserGroup;
    private alternate?: IfStatement | BlockStatement;
    private start = NaN;

    public addToken(token: Token): SyntaxComponent | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "awaiting keyword":
                if (tokenHasType(token, [...spaceTokens]))
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
                    if (
                        result &&
                        (isBinaryExpression(result) ||
                            result instanceof Identifier ||
                            result instanceof MemberExpression)
                    ) {
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
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === "else") {
                    this.state = "building alternate";
                    return null;
                }
                throw error("Unexpected token");
            case "building alternate":
                if (!this.alternateParser) {
                    if (tokenHasType(token, [...spaceTokens]))
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

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "awaiting keyword":
                return tokenHasType(token, [...spaceTokens, "if"]);
            case "building condition":
                if (this.conditionBuilder.canAccept(token))
                    return true;
                // Otherwise we assume we've moved on to the block
                this.state = "building block";
            case "building block":
                return this.blockBuilder.canAccept(token);
            case "awaiting else":
                return tokenHasType(token, [...spaceTokens, "else"]);
            case "building alternate":
                if (!this.alternateParser) {
                    if (tokenHasType(token, [...spaceTokens]))
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
