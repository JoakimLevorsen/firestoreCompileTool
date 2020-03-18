import { BooleanLiteral } from "../literals";
import {
    EqualityExpression,
    IsExpression,
    LogicalExpression
} from "./comparison";

export type BinaryExpression =
    | LogicalExpression
    | EqualityExpression
    | BooleanLiteral
    | IsExpression;

export const isBinaryExpression = (
    input: any
): input is BinaryExpression =>
    input instanceof LogicalExpression ||
    input instanceof EqualityExpression ||
    input instanceof BooleanLiteral ||
    input instanceof IsExpression;
