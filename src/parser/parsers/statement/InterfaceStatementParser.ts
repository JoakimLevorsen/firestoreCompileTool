import { InterfaceLiteral } from "../../types/literal";
import { InterfaceStatement } from "../../types/statements";
import { spaceTokens, Token, tokenHasType } from "../../types/Token";
import { InterfaceLiteralParser } from "../literal";
import Parser from "../Parser";

export class InterfaceStatementParser extends Parser {
    private start = NaN;
    private state:
        | "awaiting keyword"
        | "awaiting name"
        | "awaiting value"
        | "parsing value" = "awaiting keyword";
    private name?: string;
    private value?: InterfaceLiteral;
    private subParser = new InterfaceLiteralParser(this.errorCreator);

    public addToken(token: Token): InterfaceStatement | null {
        if (
            isNaN(this.start) &&
            !tokenHasType(token.type, [...spaceTokens])
        )
            this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "awaiting keyword":
                if (token.type !== "interface")
                    throw error("Unexpected token");
                this.state = "awaiting name";
                return null;
            case "awaiting name":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type !== "Keyword")
                    throw error("Unexpected token");
                this.name = token.value;
                this.state = "awaiting value";
                return null;
            case "awaiting value":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
            case "parsing value":
                this.state = "parsing value";
                if (this.subParser.canAccept(token)) {
                    const value = this.subParser.addToken(token);
                    if (value) {
                        this.value = value;
                        const end =
                            token.location +
                            (token.type === "Keyword"
                                ? token.value.length - 1
                                : token.type.length - 1);
                        return new InterfaceStatement(
                            { start: this.start, end },
                            this.name!,
                            this.value!
                        );
                    }
                    return null;
                }
                // If we have a value assigned we can fall through, otherwise somethings up
                if (!this.value || token.type !== ";")
                    throw error("Unexpected token");
                return new InterfaceStatement(
                    { start: this.start, end: token.location },
                    this.name!,
                    this.value!
                );
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "awaiting keyword":
                return token.type === "interface";
            case "awaiting name":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
                return token.type === "Keyword";
            case "awaiting value":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
            case "parsing value":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
                if (this.subParser.canAccept(token)) return true;
                if (!this.value) return false;
                return token.type === ";";
        }
    }
}
