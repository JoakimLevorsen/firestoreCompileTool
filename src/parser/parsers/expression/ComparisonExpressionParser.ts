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
import { Token, tokenHasType } from "../../types/Token";
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
                if (tokenHasType(token.type, Operators)) {
                    this.state = "operator";
                } else throw error("Unexpected token");
            case "operator":
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
                        return result;
                    }
                    return null;
                }
                if (token.type === ")") {
                    if (!this.secondValue)
                        throw error("Unexpected token");
                    switch (this.comparison) {
                        case "&&":
                        case "||":
                            return new LogicalExpression(
                                {
                                    start: this.start,
                                    end: token.location
                                },
                                this.comparison,
                                this.firstValue!,
                                this.secondValue
                            );
                        case "==":
                        case "!=":
                            return new EqualityExpression(
                                {
                                    start: this.start,
                                    end: token.location
                                },
                                this.comparison,
                                this.firstValue!,
                                this.secondValue
                            );
                        case undefined:
                            throw error("Internal Error");
                        default:
                            return new IsExpression(
                                {
                                    start: this.start,
                                    end: token.location
                                },
                                this.comparison,
                                this.firstValue!,
                                this.secondValue
                            );
                    }
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
                if (this.subParser)
                    return this.subParser.canAccept(token);
                if (token.type === "(") return true;
                return new MemberExpressionParser(
                    this.errorCreator
                ).canAccept(token);
            // If not we fall through to the operator stage
            case "operator":
                return tokenHasType(token.type, Operators);
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
}
