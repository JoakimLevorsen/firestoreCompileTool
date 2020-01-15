import { Constant, isConstant, RawValue, KeywordValue } from "../";
import { ReturnExpression } from "./ReturnExpression";

export type Expression =
    | RawValue
    | KeywordValue
    | Constant
    | ReturnExpression;

export const isExpression = (input: any): input is Expression =>
    input instanceof RawValue ||
    isConstant(input) ||
    input instanceof ReturnExpression ||
    input instanceof KeywordValue;
