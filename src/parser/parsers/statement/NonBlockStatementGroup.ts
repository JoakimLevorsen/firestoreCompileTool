import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import ReturnStatementParser from "./ReturnStatementParser";
import IfStatementParser from "./IfStatementParser";

const NonBlockStatementGroup = (error: ErrorCreator) =>
    new ParserGroup(
        ...[
            new ReturnStatementParser(error),
            new IfStatementParser(error)
        ]
    );

export default NonBlockStatementGroup;
