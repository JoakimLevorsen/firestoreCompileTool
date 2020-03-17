import LiteralParser from ".";
import { TypeLiteral } from "../../types/literal";
import {
    tokenHasType,
    typeTokens,
    ValueType
} from "../../types/Token";

export class TypeLiteralParser extends LiteralParser {
    private hasReturned = false;

    public addToken(
        token: import("../../types/Token").Token
    ): TypeLiteral | null {
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

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        if (this.hasReturned) return false;
        return tokenHasType(token, [...typeTokens]);
    }
}
