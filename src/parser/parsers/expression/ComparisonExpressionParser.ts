import { ParserError } from "../../ParserError";
import ComparisonExpression from "../../types/expressions/ComparisonExpression";
import EqualityExpression from "../../types/expressions/EqualityExpression";
import IsExpression from "../../types/expressions/IsExpression";
import LogicalExpression from "../../types/expressions/LogicalExpression";
import MemberExpression from "../../types/expressions/MemberExpression";
import {
    Operator,
    Operators
} from "../../types/expressions/Operators";
import Identifier from "../../types/Identifier";
import Literal from "../../types/literal/Literal";
import { spaceTokens, Token, tokenHasType } from "../../types/Token";
import Parser from "../Parser";
import MemberExpressionParser from "./MemberExpressionParser";

type ClassReturn =
    | ComparisonExpression
    | MemberExpression
    | Literal
    | Identifier
    | null;

export default class ComparisonExpressionParser extends Parser {
    private state: "first" | "operator" | "second" | "done" = "first";
    private firstValue?: ClassReturn;
    private comparison?: Operator;
    private secondValue?: ClassReturn;
    private subParser?:
        | ComparisonExpressionParser
        | MemberExpressionParser;
    private start = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): ClassReturn {
        const error = this.errorCreator(token);
        if (isNaN(this.start)) this.start = token.location;
        switch (this.state) {
            case "first":
                if (!this.subParser) {
                    if (tokenHasType(token.type, [...spaceTokens]))
                        return null;
                    this.subParser = this.createSubParser(token);
                }
                if (this.subParser.canAccept(token)) {
                    const result = this.subParser.addToken(token);
                    if (result) {
                        this.firstValue = result;
                        return result;
                    }
                    return null;
                }
                if (token.type === ")") {
                    this.state = "done";
                    if (this.firstValue) {
                        return this.firstValue;
                    }
                    throw error("Unexpected tokens");
                }
                if (tokenHasType(token.type, [...spaceTokens])) {
                    this.state = "operator";
                    return this.firstValue || null;
                }
                if (tokenHasType(token.type, Operators)) {
                    this.state = "operator";
                } else throw error("Unexpected token");
            case "operator":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return this.firstValue || null;
                if (tokenHasType(token.type, Operators)) {
                    this.comparison = token.type as Operator;
                    this.state = "second";
                    this.subParser = undefined;
                    return null;
                }
                throw error("Unexpected token");
            case "second":
                if (!this.subParser) {
                    this.subParser = new ComparisonExpressionParser(
                        this.errorCreator
                    );
                }
                if (this.subParser.canAccept(token)) {
                    const result = this.subParser.addToken(token);
                    if (result) {
                        this.secondValue = result;
                        return this.getReturnValue(token, error);
                    }
                    return null;
                }
                if (token.type === ")") {
                    if (!this.secondValue)
                        throw error("Unexpected token");
                    return this.getReturnValue(token, error);
                }
                throw error("Unexpected token");
            case "done":
                throw error("This should never happen");
        }
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        switch (this.state) {
            case "first":
                if (this.subParser) {
                    const allowed = this.subParser.canAccept(token);
                    if (allowed === true) return true;
                } else {
                    if (tokenHasType(token.type, [...spaceTokens]))
                        return true;
                    if (token.type === "(") return true;
                    return new MemberExpressionParser(
                        this.errorCreator
                    ).canAccept(token);
                }
                if (tokenHasType(token.type, [...spaceTokens])) {
                    this.state = "operator";
                    return true;
                }
            // If not we fall through to the operator stage
            case "operator":
                return tokenHasType(token.type, [
                    ...Operators,
                    ...spaceTokens
                ]);
            case "second":
                if (this.subParser) {
                    if (this.subParser.canAccept(token)) return true;
                    if (token.type === ")") return true;
                    return false;
                }
                if (token.type === "(") return true;
                return new ComparisonExpressionParser(
                    this.errorCreator
                ).canAccept(token);
            case "done":
                return false;
        }
    }

    private createSubParser(token: Token) {
        if (token.type === "(") {
            return new ComparisonExpressionParser(this.errorCreator);
        } else {
            return new MemberExpressionParser(this.errorCreator);
        }
    }

    private getReturnValue(
        token: Token,
        error: (msg: string) => ParserError
    ) {
        const end =
            token.location +
            (token.type === "Keyword" ? token.value.length : 0);
        const { start } = this;
        const position = { start, end };
        switch (this.comparison) {
            case "&&":
            case "||":
                return new LogicalExpression(
                    position,
                    this.comparison,
                    this.firstValue!,
                    this.secondValue!
                );
            case "==":
            case "!=":
                return new EqualityExpression(
                    position,
                    this.comparison,
                    this.firstValue!,
                    this.secondValue!
                );
            case undefined:
                throw error("Internal Error");
            default:
                return new IsExpression(
                    position,
                    this.comparison,
                    this.firstValue!,
                    this.secondValue!
                );
        }
    }
}
