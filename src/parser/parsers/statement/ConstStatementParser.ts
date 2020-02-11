import { isBinaryExpression } from "../../types/expressions/BinaryExpression";
import Identifier from "../../types/Identifier";
import Literal from "../../types/literal";
import ConstStatement, {
    ConstStatementValue
} from "../../types/statements/ConstStatement";
import { spaceTokens, Token, tokenHasType } from "../../types/Token";
import ExpressionGroupParser from "../expression/ExpressionGroupParser";
import Parser from "../Parser";

export default class ConstStatementParser extends Parser {
    private start = NaN;
    private state:
        | "awaiting keyword"
        | "awaiting name"
        | "awaiting equals"
        | "awaiting value"
        | "parsing value" = "awaiting keyword";
    private name?: string;
    private value?: ConstStatementValue;
    private subParser = ExpressionGroupParser(this.errorCreator);

    public addToken(token: Token): ConstStatement | null {
        if (
            isNaN(this.start) &&
            !tokenHasType(token.type, [...spaceTokens])
        )
            this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "awaiting keyword":
                if (token.type !== "const")
                    throw error("Unexpected token");
                this.state = "awaiting name";
                return null;
            case "awaiting name":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type !== "Keyword")
                    throw error("Unexpected token");
                this.name = token.value;
                this.state = "awaiting equals";
                return null;
            case "awaiting equals":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type !== "=")
                    throw error("Unexpected token");
                this.state = "awaiting value";
                return null;
            case "awaiting value":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
            case "parsing value":
                this.state = "parsing value";
                if (this.subParser.canAccept(token)) {
                    const value = this.subParser.addToken(token);
                    if (value && value[0]) {
                        const first = value[0];
                        if (
                            first instanceof Literal ||
                            first instanceof Identifier ||
                            isBinaryExpression(first)
                        ) {
                            this.value = first;
                            const end =
                                token.location +
                                (token.type === "Keyword"
                                    ? token.value.length - 1
                                    : token.type.length - 1);
                            return new ConstStatement(
                                { start: this.start, end },
                                this.name!,
                                this.value!
                            );
                        }
                    }
                    return null;
                }
                // If we have a value assigned we can fall through, otherwise somethings up
                if (!this.value || token.type !== ";")
                    throw error("Unexpected token");
                return new ConstStatement(
                    { start: this.start, end: token.location },
                    this.name!,
                    this.value!
                );
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "awaiting keyword":
                return token.type === "const";
            case "awaiting name":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
                return token.type === "Keyword";
            case "awaiting equals":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "="
                ]);
            case "awaiting value":
                // If this returns false, it might be because we should fall through to the next case, so we do that if we have a value
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
            case "parsing value":
                if (this.subParser.canAccept(token)) return true;
                if (!this.value) return false;
                return token.type === ";";
        }
    }
}
