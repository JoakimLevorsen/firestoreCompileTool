import { ErrorCreator } from "../ParserError";
import Indentifier from "../types/Identifier";
import { Token } from "../types/Token";

const IndentifierExtractor = (
    token: Token,
    errorCreator: ErrorCreator
) => {
    const error = errorCreator(token);
    if (token.type !== "Keyword") throw error("Expected keyword");
    return new Indentifier(
        {
            start: token.location,
            end: token.location + token.value.length
        },
        token.value
    );
};

export default IndentifierExtractor;
