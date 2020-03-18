import {
    ConstStatementParser,
    IfStatementParser,
    InterfaceStatementParser,
    ReturnStatementParser
} from ".";
import { ErrorCreator } from "..";
import ParserGroup from "../ParserGroup";

export const NonBlockStatementGroup = (error: ErrorCreator) =>
    new ParserGroup(
        ...[
            new ReturnStatementParser(error),
            new IfStatementParser(error),
            new ConstStatementParser(error),
            new InterfaceStatementParser(error)
        ]
    );
