import { ErrorCreator, IdentifierExtractor } from ".";
import { Identifier, Token } from "../types";
import {
    BooleanLiteral,
    NumericLiteral,
    TypeLiteral
} from "../types/literals";
import {
    BooleanLiteralParser,
    InterfaceLiteralParser,
    NumericLiteralParser,
    StringLiteralParser,
    TypeLiteralParser
} from "./literal";

export const IdentifierOrLiteralExtractor = (
    token: Token,
    error: ErrorCreator
):
    | Identifier
    | BooleanLiteral
    | NumericLiteralParser
    | TypeLiteral
    | { parser: NumericLiteralParser; value: NumericLiteral }
    | InterfaceLiteralParser
    | StringLiteralParser => {
    const bParser = new BooleanLiteralParser(error);
    if (bParser.canAccept(token))
        return (bParser.addToken(token) as unknown) as BooleanLiteral;
    const nParser = new NumericLiteralParser(error);
    if (nParser.canAccept(token)) {
        const response = nParser.addToken(token);
        if (response instanceof NumericLiteral)
            return { parser: nParser, value: response };
        return nParser;
    }
    const tParser = new TypeLiteralParser(error);
    if (tParser.canAccept(token)) {
        const response = tParser.addToken(token);
        if (response) {
            return response;
        }
    }
    const sParser = new StringLiteralParser(error);
    if (sParser.canAccept(token)) {
        sParser.addToken(token);
        return sParser;
    }
    const iParser = new InterfaceLiteralParser(error);
    if (iParser.canAccept(token)) {
        iParser.addToken(token);
        return iParser;
    }
    return IdentifierExtractor(token, error);
};
