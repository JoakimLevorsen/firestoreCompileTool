import {
    spaceTokens,
    Token,
    tokenHasType,
    Identifier
} from "../../types";
import { InterfaceLiteral } from "../../types/literals";
import { InterfaceStatement } from "../../types/statements";
import { InterfaceLiteralParser } from "../literal";
import Parser from "../Parser";
import { IdentifierExtractor } from "../IdentifierExtractor";

export class InterfaceStatementParser extends Parser {
    private start = NaN;
    private state:
        | "awaiting keyword"
        | "awaiting name"
        | "awaiting valueOrExtends"
        | "awaiting extension"
        | "awaiting valueOrSeperator"
        | "parsing value" = "awaiting keyword";
    private name?: string;
    private value?: InterfaceLiteral;
    private extensions: Identifier[] = [];
    private subParser = new InterfaceLiteralParser(this.errorCreator);

    public addToken(
        token: Token,
        selfCall = false
    ): InterfaceStatement | null {
        if (
            isNaN(this.start) &&
            !tokenHasType(token, [...spaceTokens])
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
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type !== "Keyword")
                    throw error("Unexpected token");
                this.name = token.value;
                this.state = "awaiting valueOrExtends";
                return null;
            case "awaiting valueOrExtends":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === "extends") {
                    this.state = "awaiting extension";
                    return null;
                }
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
                            this.value!,
                            this.extensions
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
                    this.value!,
                    this.extensions
                );
            case "awaiting extension":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === "Keyword") {
                    this.extensions.push(
                        IdentifierExtractor(token, this.errorCreator)
                    );
                    this.state = "awaiting valueOrSeperator";
                    return null;
                }
                throw error("Unexpected token");
            case "awaiting valueOrSeperator":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === ",") {
                    this.state = "awaiting extension";
                    return null;
                }
                // This probably means we got a value, so we send it around
                this.state = "parsing value";
                if (!selfCall) {
                    return this.addToken(token, true);
                }
                throw error("Internal error");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "awaiting keyword":
                return token.type === "interface";
            case "awaiting name":
                if (tokenHasType(token, [...spaceTokens]))
                    return true;
                return token.type === "Keyword";
            case "awaiting valueOrExtends":
                if (tokenHasType(token, [...spaceTokens, "extends"]))
                    return true;
            case "awaiting valueOrSeperator":
                // We do this so we can still fall through from the above case to the below.
                if (
                    this.state === "awaiting valueOrSeperator" &&
                    tokenHasType(token, [...spaceTokens, ","])
                )
                    return true;
            case "parsing value":
                if (this.subParser.canAccept(token)) return true;
                if (!this.value) return false;
                return token.type === ";";
            case "awaiting extension":
                if (tokenHasType(token, [...spaceTokens]))
                    return true;
                if (token.type === "Keyword") return true;
                return false;
        }
    }
}
