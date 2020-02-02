import LiteralParser from ".";
import BooleanLiteral from "../../types/literal/BooleanLiteral";

export default class BooleanLiteralParser extends LiteralParser {
    private hasReturned = false;

    public addToken(
        token: import("../../types/Token").Token
    ): BooleanLiteral | null {
        const error = this.errorCreator(token);
        if (this.hasReturned)
            throw error("Did not expect more tokens");
        if (
            token.type === "Keyword" &&
            (token.value === "true" || token.value === "false")
        ) {
            this.hasReturned = true;
            return new BooleanLiteral(
                {
                    start: token.location,
                    end: token.location + token.value.length
                },
                token.value === "true"
            );
        }
        throw error("Unexpected token");
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        if (this.hasReturned) return false;
        if (
            token.type === "Keyword" &&
            (token.value === "true" || token.value === "false")
        )
            return true;
        return false;
    }
}