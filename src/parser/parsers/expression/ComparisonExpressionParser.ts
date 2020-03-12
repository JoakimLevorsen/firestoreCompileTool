import {
    ComparisonExpression,
    ComparisonOperator,
    ComparisonOperators,
    EqualityExpression,
    IsExpression,
    LogicalExpression,
    MemberExpression,
    OrderExpression
} from "../../types/expressions";
import Identifier from "../../types/Identifier";
import Literal from "../../types/literal";
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
    private stage:
        | "awaiting first"
        | "building first"
        | "awaiting operator"
        | "awaiting second"
        | "buidling second"
        | "nextPart" = "awaiting first";
    private memParser: MemberExpressionParser = new MemberExpressionParser(
        this.errorCreator
    );
    private subParser?: ComparisonExpressionParser;
    private firstElement?:
        | Identifier
        | Literal
        | ComparisonExpression
        | MemberExpression;
    private operator?: ComparisonOperator;
    private secondElement?:
        | Identifier
        | Literal
        | ComparisonExpression
        | MemberExpression;
    private start = NaN;
    private remainingCloseParenthesees = 0;
    private lastExport?: ReturnType<
        ComparisonExpressionParser["exportExpression"]
    >;

    public addToken(token: Token): ClassReturn | null {
        const error = this.errorCreator(token);
        if (isNaN(this.start) && token.type !== " ")
            this.start = token.location;
        switch (this.stage) {
            case "awaiting first":
                if (token.type === "(") {
                    this.remainingCloseParenthesees++;
                    return null;
                }
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
            case "building first":
                if (this.memParser.canAccept(token)) {
                    const result = this.memParser.addToken(token);
                    if (result) {
                        this.firstElement = result;
                    }
                    this.stage = "building first";
                    return result;
                }
                // Then we assume we're done
                this.stage = "awaiting operator";
            case "awaiting operator":
                if (token.type === ")") {
                    this.remainingCloseParenthesees--;
                    if (this.remainingCloseParenthesees === 0)
                        return this.firstElement!;
                    else if (this.remainingCloseParenthesees < 0)
                        throw error("Unexpected close parenthesis");
                    return null;
                }
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (tokenHasType(token.type, ComparisonOperators)) {
                    this.operator = token.type as ComparisonOperator;
                    this.stage = "awaiting second";
                    return null;
                }
                throw error("Unexpected token");
            case "awaiting second": {
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                this.stage = "buidling second";
                if (token.type === "(") {
                    // This means we're dealing with a subexpression, we parse seperately
                    this.subParser = new ComparisonExpressionParser(
                        this.errorCreator
                    );
                    this.subParser.addToken(token);
                    return null;
                }
                // This means we're dealing with a normal expression
                this.memParser = new MemberExpressionParser(
                    this.errorCreator
                );
                const result = this.memParser.addToken(token);
                if (result) {
                    this.secondElement = result;
                    return this.exportExpression(token);
                }
                return null;
            }
            case "buidling second":
                if (this.subParser) {
                    if (this.subParser.canAccept(token)) {
                        const result = this.subParser.addToken(token);
                        if (result) {
                            this.secondElement = result;
                            return this.exportExpression(token);
                        }
                        return null;
                    }
                } else {
                    if (this.memParser.canAccept(token)) {
                        const result = this.memParser.addToken(token);
                        if (result) {
                            this.secondElement = result;
                            return this.exportExpression(token);
                        }
                        return null;
                    }
                }
            case "nextPart":
                // If this is an operator we turn the entire thing into the first element
                this.stage = "nextPart";
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type === ")") {
                    this.remainingCloseParenthesees--;
                    if (this.remainingCloseParenthesees === 0) {
                        this.lastExport = this.exportExpression(
                            token
                        );
                        return this.lastExport;
                    } else if (this.remainingCloseParenthesees < 0)
                        throw error("Unexpected close parenthesis");
                    return null;
                }
                if (tokenHasType(token.type, ComparisonOperators)) {
                    this.firstElement =
                        this.lastExport ??
                        this.exportExpression(
                            this.secondElement!.getEnd()
                        );
                    this.operator = token.type as ComparisonOperator;
                    this.secondElement = undefined;
                    this.lastExport = undefined;
                    this.memParser = new MemberExpressionParser(
                        this.errorCreator
                    );
                    this.stage = "awaiting second";
                    return null;
                }
                throw error("Unexpected token");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.stage) {
            case "awaiting first":
                if (tokenHasType(token.type, ["(", ...spaceTokens]))
                    return true;
            case "building first":
                if (this.memParser.canAccept(token)) return true;
                if (!this.firstElement)
                    throw this.errorCreator(token)(
                        "Unexpected token"
                    );
            case "awaiting operator":
                return tokenHasType(token.type, [
                    ")",
                    ...spaceTokens,
                    ...ComparisonOperators
                ]);
            case "awaiting second":
                if (tokenHasType(token.type, [...spaceTokens, "("]))
                    return true;
                return new MemberExpressionParser(
                    this.errorCreator
                ).canAccept(token);
            case "buidling second":
                if (this.subParser) {
                    if (this.subParser.canAccept(token)) return true;
                } else if (this.memParser.canAccept(token))
                    return true;
            case "nextPart":
                if (token.type === ")") return true;
            case "awaiting operator":
                return tokenHasType(token.type, [
                    ...ComparisonOperators,
                    ...spaceTokens
                ]);
        }
    }

    private getTokenEnd = (token: Token): number => {
        if (token.type === "Keyword")
            return token.location + token.value.length - 1;
        return token.location + token.type.length - 1;
    };

    private exportExpression(token: Token | number) {
        if (!this.operator) return this.firstElement!;
        const end =
            typeof token === "number"
                ? token
                : this.getTokenEnd(token);
        switch (this.operator) {
            case "&&":
            case "||":
                return new LogicalExpression(
                    {
                        start: this.start,
                        end
                    },
                    this.operator,
                    this.firstElement!,
                    this.secondElement!
                );
            case "is":
            case "only":
            case "isOnly":
                return new IsExpression(
                    {
                        start: this.start,
                        end
                    },
                    this.operator,
                    this.firstElement!,
                    this.secondElement!
                );
            case "==":
            case "!=":
                return new EqualityExpression(
                    {
                        start: this.start,
                        end
                    },
                    this.operator,
                    this.firstElement!,
                    this.secondElement!
                );
            default:
                return new OrderExpression(
                    {
                        start: this.start,
                        end
                    },
                    this.operator,
                    this.firstElement!,
                    this.secondElement!
                );
        }
    }
}
