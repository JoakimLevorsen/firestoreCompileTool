import { Condition, isCondition } from ".";
import RawValue from "./RawValue";
import { ExpressionGroup } from "./ExpressionGroup";

export type Expression = RawValue | Condition | ExpressionGroup;

export const isExpression = (input: any): input is Expression =>
    input instanceof RawValue ||
    input instanceof ExpressionGroup ||
    isCondition(input);
