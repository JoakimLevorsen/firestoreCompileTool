import { ErrorCreator } from "../ParserError";
import Identifier from "../types/Identifier";
import { Token } from "../types/Token";

const IdentifierExtractor = (
    token: Token,
    errorCreator: ErrorCreator
) => {
    const error = errorCreator(token);
    if (token.type !== "Keyword") throw error("Expected keyword");
    return new Identifier(token.location, token.value);
};

export default IdentifierExtractor;
