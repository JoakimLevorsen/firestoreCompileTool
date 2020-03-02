import { ErrorCreator } from "../../ParserError";
import ParserGroup from "../ParserGroup";
import MemberExpressionParser from "./MemberExpressionParser";

const ExpressionGroupParser = (error: ErrorCreator) =>
    new ParserGroup(...[new MemberExpressionParser(error)]);

export default ExpressionGroupParser;
