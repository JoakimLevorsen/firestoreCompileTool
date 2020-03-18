import { ErrorCreator } from "..";
import { Token } from "../../types";
import Literal from "../../types/literals";
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
