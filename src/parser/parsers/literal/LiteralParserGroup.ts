import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import BooleanLiteralParser from "./BooleanLiteralParser";
import NumericLiteralParser from "./NumericLiteralParser";
import StringLiteralParser from "./StringLiteralParser";

const LiteralParserGroup = (error: ErrorCreator) =>
    new ParserGroup(
        new BooleanLiteralParser(error),
        new NumericLiteralParser(error),
        new StringLiteralParser(error)
    );

export default LiteralParserGroup;
