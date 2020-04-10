import {
    BooleanLiteralParser,
    InterfaceLiteralParser,
    NumericLiteralParser,
    StringLiteralParser,
    TypeLiteralParser
} from ".";
import { ErrorCreator } from "../ParserError";
import ParserGroup from "../ParserGroup";
import { NullLiteralParser } from "./NullLiteralParser";

export const LiteralParserGroup = (
    error: ErrorCreator
): ParserGroup =>
    new ParserGroup(
        new BooleanLiteralParser(error),
        new NullLiteralParser(error),
        new NumericLiteralParser(error),
        new StringLiteralParser(error),
        new TypeLiteralParser(error),
        new InterfaceLiteralParser(error)
    );
