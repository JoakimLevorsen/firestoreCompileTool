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
        if (
            token.type === "string" ||
            token.type === "number" ||
            token.type === "boolean"
        ) {
            this.hasReturned = true;
            return new TypeLiteral(token.location, token.type);
        }
        throw error("Unexpected token");
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        if (this.hasReturned) return false;
        switch (token.type) {
            case "string":
            case "boolean":
            case "number":
                return true;
            default:
                return false;
        }
    }
}
