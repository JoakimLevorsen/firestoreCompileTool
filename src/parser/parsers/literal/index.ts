import { ErrorCreator } from "../../ParserError";
import Literal from "../../types/literal";
import { Token } from "../../types/Token";
import Parser from "../Parser";

export default abstract class LiteralParser extends Parser {
    constructor(withError: ErrorCreator) {
        super(withError);
    }

    public abstract addToken(token: Token): Literal | null;
}

export { BooleanLiteralParser } from "./BooleanLiteralParser";
export { InterfaceLiteralParser } from "./InterfaceLiteralParser";
export { LiteralParserGroup } from "./LiteralParserGroup";
export { NumericLiteralParser } from "./NumericLiteralParser";
export { StringLiteralParser } from "./StringLiteralParser";
export { TypeLiteralParser } from "./TypeLiteralParser";
