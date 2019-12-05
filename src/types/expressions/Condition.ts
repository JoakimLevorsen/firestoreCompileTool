import { isEqualCondition, isTypeCondition } from ".";
import { isIsEqualCondition } from "./isEqualCondition";
import { isIsTypeCondition } from "./isTypeCondition";

export type Condition = isTypeCondition | isEqualCondition;

export const isCondition = (input: any): input is Condition =>
    isIsEqualCondition(input) || isIsTypeCondition(input);
