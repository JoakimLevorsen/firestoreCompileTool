import RawValue from "../RawValue";
import { Constant, isConstant } from "./Constant";
import { ReturnExpression } from "./ReturnExpression";

export type Expression = RawValue | Constant | ReturnExpression;

export const isExpression = (input: any): input is Expression =>
    input instanceof RawValue ||
    isConstant(input) ||
    input instanceof ReturnExpression;
