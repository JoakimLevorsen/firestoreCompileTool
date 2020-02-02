import { ErrorCreator } from "../../ParserError";
import Literal from "../../types/literal/Literal";
import { Token } from "../../types/Token";
import Parser from "../Parser";

export default abstract class LiteralParser extends Parser {
    constructor(withError: ErrorCreator) {
        super(withError);
    }

    public abstract addToken(token: Token): Literal | null;
}
