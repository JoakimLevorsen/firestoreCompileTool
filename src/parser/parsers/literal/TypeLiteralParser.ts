import LiteralParser from ".";
import TypeLiteral from "../../types/literal/TypeLiteral";

export default class TypeLiteralParser extends LiteralParser {
    private hasReturned = false;

    public addToken(
        token: import("../../types/Token").Token
    ): TypeLiteral | null {
        const error = this.errorCreator(token);
        if (this.hasReturned)
            throw error("Did not expect more tokens");
        if (token.type !== "Keyword") throw error("Unexpected token");
        if (
            token.value === "string" ||
            token.value === "number" ||
            token.value === "boolean"
        ) {
            this.hasReturned = true;
            return new TypeLiteral(token.location, token.value);
        }
        throw error("Unexpected token");
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        if (this.hasReturned) return false;
        if (token.type !== "Keyword") return false;
        switch (token.value) {
            case "string":
            case "boolean":
            case "number":
                return true;
            default:
                return false;
        }
    }
}
