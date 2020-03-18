import { ErrorCreator } from ".";
import { Identifier, Token } from "../types";

export const IdentifierExtractor = (
    token: Token,
    errorCreator: ErrorCreator
) => {
    const error = errorCreator(token);
    if (token.type !== "Keyword") throw error("Expected keyword");
    return new Identifier(token.location, token.value);
};
