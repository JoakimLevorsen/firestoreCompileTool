import LogicalExpression from "./LogicalExpression";
import BooleanLiteral from "../literal/BooleanLiteral";
import EqualityExpression from "./EqualityExpression";

export type BinaryExpression =
    | LogicalExpression
    | EqualityExpression
    | BooleanLiteral;

export const isBinaryExpression = (
    input: any
): input is BinaryExpression =>
    input instanceof LogicalExpression ||
    input instanceof EqualityExpression ||
    input instanceof BooleanLiteral;
