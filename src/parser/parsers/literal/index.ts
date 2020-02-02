import ParserGroup from "../ParserGroup";
import BooleanLiteralParser from "./BooleanLiteralParser";
import NumericLiteralParser from "./NumericLiteralParser";
import StringLiteralParser from "./StringLiteralParser";
import { ErrorCreator } from "../../ParserError";

const LiteralParser = (error: ErrorCreator) =>
    new ParserGroup(
        new BooleanLiteralParser(error),
        new NumericLiteralParser(error),
        new StringLiteralParser(error)
    );

export default LiteralParser;

export type LiteralParser =
    | BooleanLiteralParser
    | NumericLiteralParser
    | StringLiteralParser;
