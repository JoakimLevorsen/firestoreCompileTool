import { isBinaryExpression } from "../../types/expressions/BinaryExpression";
import Identifier from "../../types/Identifier";
import { BooleanLiteral } from "../../types/literal";
import { ReturnStatement } from "../../types/statements";
import SyntaxComponent from "../../types/SyntaxComponent";
import { spaceTokens, tokenHasType } from "../../types/Token";
import ExpressionParser from "../expression/ExpressionParser";
import Parser from "../Parser";

export class ReturnStatementParser extends Parser {
    private subParser = new ExpressionParser(this.errorCreator);
    private hasGottonKeyword = false;
    private hasGottenSpaceAfterKeyword = false;
    private start = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): SyntaxComponent | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        if (
            !this.hasGottonKeyword ||
            !this.hasGottenSpaceAfterKeyword
        ) {
            if (tokenHasType(token, [...spaceTokens])) {
                if (
                    this.hasGottonKeyword &&
                    !this.hasGottenSpaceAfterKeyword
                )
                    this.hasGottenSpaceAfterKeyword = true;
                return null;
            }
        }
        if (!this.hasGottonKeyword) {
            if (token.type !== "return")
                throw error("Unexpected token");
            this.hasGottonKeyword = true;
            return null;
        }
        if (this.subParser.canAccept(token)) {
            const result = this.subParser.addToken(token);
            if (
                result &&
                (result instanceof BooleanLiteral ||
                    result instanceof Identifier ||
                    isBinaryExpression(result))
            ) {
                return new ReturnStatement(this.start, result);
            }
            return null;
        }
        throw error("Unexpected token");
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        if (!this.hasGottonKeyword) {
            return tokenHasType(token, [...spaceTokens, "return"]);
        }
        if (
            !this.hasGottonKeyword ||
            !this.hasGottenSpaceAfterKeyword
        ) {
            if (tokenHasType(token, [...spaceTokens])) return true;
        }
        if (this.subParser.canAccept(token)) return true;
        return false;
    }
}
