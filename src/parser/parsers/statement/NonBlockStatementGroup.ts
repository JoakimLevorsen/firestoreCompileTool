import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import {
    ConstStatementParser,
    IfStatementParser,
    ReturnStatementParser
} from "./";
import { InterfaceStatementParser } from "./InterfaceStatementParser";

export const NonBlockStatementGroup = (error: ErrorCreator) =>
    new ParserGroup(
        ...[
            new ReturnStatementParser(error),
            new IfStatementParser(error),
            new ConstStatementParser(error),
            new InterfaceStatementParser(error)
        ]
    );
