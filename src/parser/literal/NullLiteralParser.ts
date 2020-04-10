import LiteralParser from ".";
import { Token } from "../../types";
import { NullLiteral } from "../../types/literals";

export class NullLiteralParser extends LiteralParser {
    private hasReturned = false;

    public addToken(token: Token): NullLiteral | null {
        const error = this.errorCreator(token);
        if (this.hasReturned)
            throw error("Did not expect more tokens");
        if (token.type === "Keyword" && token.value === "null") {
            this.hasReturned = true;
            return new NullLiteral(token.location);
        }
        throw error("Unexpected token");
    }

    public canAccept(token: Token): boolean {
        if (this.hasReturned) return false;
        if (token.type === "Keyword" && token.value === "null")
            return true;
        return false;
    }
}
