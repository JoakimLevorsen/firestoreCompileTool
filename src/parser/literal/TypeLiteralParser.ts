import LiteralParser from ".";
import {
    Token,
    tokenHasType,
    typeTokens,
    ValueType
} from "../../types";
import { TypeLiteral } from "../../types/literals";

export class TypeLiteralParser extends LiteralParser {
    private hasReturned = false;

    public addToken(token: Token): TypeLiteral | null {
        const error = this.errorCreator(token);
        if (this.hasReturned)
            throw error("Did not expect more tokens");
        if (tokenHasType(token, [...typeTokens])) {
            this.hasReturned = true;
            return new TypeLiteral(
                token.location,
                token.type as ValueType
            );
        }
        throw error("Unexpected token");
    }

    public canAccept(token: Token): boolean {
        if (this.hasReturned) return false;
        return tokenHasType(token, [...typeTokens]);
    }
}
