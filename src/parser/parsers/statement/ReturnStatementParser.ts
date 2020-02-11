import { isBinaryExpression } from "../../types/expressions/BinaryExpression";
import Identifier from "../../types/Identifier";
import { BooleanLiteral } from "../../types/literal";
import ReturnStatement from "../../types/statements/ReturnStatement";
import { spaceTokens, tokenHasType } from "../../types/Token";
import ComparisonExpressionParser from "../expression/ComparisonExpressionParser";
import Parser from "../Parser";

export default class ReturnStatementParser extends Parser {
    private subParser = new ComparisonExpressionParser(
        this.errorCreator
    );
    private hasGottonKeyword = false;
    private hasGottenSpaceAfterKeyword = false;
    private start = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): import("../../types/SyntaxComponent").default | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        if (
            !this.hasGottonKeyword ||
            !this.hasGottenSpaceAfterKeyword
        ) {
            if (tokenHasType(token.type, [...spaceTokens])) {
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
            return tokenHasType(token.type, [
                ...spaceTokens,
                "return"
            ]);
        }
        if (this.subParser.canAccept(token)) return true;
        if (tokenHasType(token.type, [...spaceTokens])) return true;
        return false;
    }
}
