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

export * from "./BooleanLiteralParser";
export * from "./InterfaceLiteralParser";
export * from "./LiteralParserGroup";
export * from "./NumericLiteralParser";
export * from "./StringLiteralParser";
export * from "./TypeLiteralParser";
