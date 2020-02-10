import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import BooleanLiteralParser from "./BooleanLiteralParser";
import NumericLiteralParser from "./NumericLiteralParser";
import StringLiteralParser from "./StringLiteralParser";
import TypeLiteralParser from "./TypeLiteralParser";
import InterfaceLiteralParser from "./InterfaceLiteralParser";

const LiteralParserGroup = (error: ErrorCreator): ParserGroup =>
    new ParserGroup(
        new BooleanLiteralParser(error),
        new NumericLiteralParser(error),
        new StringLiteralParser(error),
        new TypeLiteralParser(error),
        new InterfaceLiteralParser(error)
    );

export default LiteralParserGroup;
