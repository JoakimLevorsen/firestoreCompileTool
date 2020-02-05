import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import IfStatementParser from "./IfStatementParser";
import ReturnStatementParser from "./ReturnStatementParser";

const NonBlockStatementGroup = (error: ErrorCreator) =>
    new ParserGroup(
        ...[
            new ReturnStatementParser(error),
            new IfStatementParser(error)
        ]
    );

export default NonBlockStatementGroup;
