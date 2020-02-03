import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import ReturnStatementParser from "./ReturnStatementParser";

const NonBlockStatementGroup = (error: ErrorCreator) =>
    new ParserGroup(...[new ReturnStatementParser(error)]);

export default NonBlockStatementGroup;
