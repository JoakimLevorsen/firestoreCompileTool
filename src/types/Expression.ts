import { Condition, isCondition } from ".";
import RawValue from "./RawValue";

export type Expression = RawValue | Condition;

export const isExpression = (input: any): input is Expression =>
    input instanceof RawValue || isCondition(input);
