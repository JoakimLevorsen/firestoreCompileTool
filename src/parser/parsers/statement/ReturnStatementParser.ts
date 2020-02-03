import ReturnStatement from "../../types/statements/ReturnStatement";
import SyntaxComponent from "../../types/SyntaxComponent";
import { spaceTokens, tokenHasType } from "../../types/Token";
import ComparisonExpressionParser from "../expression/ComparisonExpressionParser";
import Parser from "../Parser";

export default class ReturnStatementParser extends Parser {
    private subParser = new ComparisonExpressionParser(
        this.errorCreator
    );
    private hasGottonKeyword = false;
    private internalValue?: SyntaxComponent;
    private start = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): import("../../types/SyntaxComponent").default | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        if (tokenHasType(token.type, [...spaceTokens])) return null;
        if (!this.hasGottonKeyword) {
            if (token.type !== "return")
                throw error("Unexpected token");
            this.hasGottonKeyword = true;
            return null;
        }
        if (this.subParser.canAccept(token)) {
            const result = this.subParser.addToken(token);
            if (result) {
                this.internalValue = result;
                return new ReturnStatement(
                    { start: this.start, end: result.getEnd() },
                    result
                );
            }
        }
        if (token.type === ";" && this.internalValue) {
            return new ReturnStatement(
                {
                    start: this.start,
                    end: this.internalValue.getEnd()
                },
                this.internalValue
            );
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
        return token.type === ";";
    }
}
