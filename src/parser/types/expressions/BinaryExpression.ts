import { BooleanLiteral } from "../literal";
import { EqualityExpression, LogicalExpression } from "./";

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
