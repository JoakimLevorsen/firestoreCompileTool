import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import {
    BooleanLiteralParser,
    InterfaceLiteralParser,
    NumericLiteralParser,
    StringLiteralParser,
    TypeLiteralParser
} from "./";

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
