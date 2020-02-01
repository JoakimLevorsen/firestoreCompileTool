import { ErrorCreator } from "../ParserError";
import Indentifier from "../types/Identifier";
import BooleanLiteral from "../types/literal/BooleanLiteral";
import NumericLiteral from "../types/literal/NumericLiteral";
import { Token } from "../types/Token";
import IndentifierExtractor from "./IndentifierExtractor";
import BooleanLiteralParser from "./literal/BooleanLiteralParser";
import NumericLiteralParser from "./literal/NumericLiteralParser";
import StringLiteralParser from "./literal/StringLiteralParser";

const IdentifierOrLiteralExtractor = (
    token: Token,
    error: ErrorCreator
):
    | Indentifier
    | BooleanLiteral
    | NumericLiteralParser
    | { parser: NumericLiteralParser; value: NumericLiteral }
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
    const sParser = new StringLiteralParser(error);
    if (sParser.canAccept(token)) {
        sParser.addToken(token);
        return sParser;
    }
    return IndentifierExtractor(token, error);
};

export default IdentifierOrLiteralExtractor;
