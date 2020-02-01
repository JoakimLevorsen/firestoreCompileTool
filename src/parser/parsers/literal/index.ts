import ParserGroup from "../ParserGroup";
import BooleanLiteralParser from "./BooleanLiteralParser";
import NumericLiteralParser from "./NumericLiteralParser";
import StringLiteralParser from "./StringLiteralParser";
import { ErrorCreator } from "../../ParserError";

export default (error: ErrorCreator) =>
    new ParserGroup(
        new BooleanLiteralParser(error),
        new NumericLiteralParser(error),
        new StringLiteralParser(error)
    );

export type LiteralParser =
    | BooleanLiteralParser
    | NumericLiteralParser
    | StringLiteralParser;
