import LiteralParser from ".";
import { Token } from "../../types";
import { BooleanLiteral } from "../../types/literals";

export class BooleanLiteralParser extends LiteralParser {
    private hasReturned = false;

    public addToken(token: Token): BooleanLiteral | null {
        const error = this.errorCreator(token);
        if (this.hasReturned)
            throw error("Did not expect more tokens");
        if (
            token.type === "Keyword" &&
            (token.value === "true" || token.value === "false")
        ) {
            this.hasReturned = true;
            return new BooleanLiteral(
                token.location,
                token.value === "true"
            );
        }
        throw error("Unexpected token");
    }

    public canAccept(token: Token): boolean {
        if (this.hasReturned) return false;
        if (
            token.type === "Keyword" &&
            (token.value === "true" || token.value === "false")
        )
            return true;
        return false;
    }
}
