import {
    BooleanLiteralParser,
    InterfaceLiteralParser,
    NumericLiteralParser,
    StringLiteralParser,
    TypeLiteralParser
} from ".";
import { ErrorCreator } from "../ParserError";
import ParserGroup from "../ParserGroup";

export const LiteralParserGroup = (
    error: ErrorCreator
): ParserGroup =>
    new ParserGroup(
        new BooleanLiteralParser(error),
        new NumericLiteralParser(error),
        new StringLiteralParser(error),
        new TypeLiteralParser(error),
        new InterfaceLiteralParser(error)
    );
