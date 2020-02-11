import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import ConstStatementParser from "./ConstStatementParser";
import IfStatementParser from "./IfStatementParser";
import { InterfaceStatementParser } from "./InterfaceStatementParser";
import ReturnStatementParser from "./ReturnStatementParser";

const NonBlockStatementGroup = (error: ErrorCreator) =>
    new ParserGroup(
        ...[
            new ReturnStatementParser(error),
            new IfStatementParser(error),
            new ConstStatementParser(error),
            new InterfaceStatementParser(error)
        ]
    );

export default NonBlockStatementGroup;
