import { IsEqualCondition, IsTypeCondition } from ".";

export type Condition = IsTypeCondition | IsEqualCondition;

export const isCondition = (input: any): input is Condition =>
    input instanceof IsEqualCondition ||
    input instanceof IsTypeCondition;
