import { IsEqualCondition, IsTypeCondition } from ".";
import { LogicGroup } from "..";

type RawCondition = IsTypeCondition | IsEqualCondition;

export type Condition = RawCondition | LogicGroup<Condition>;

export const isCondition = (input: any): input is Condition =>
    input instanceof IsEqualCondition ||
    input instanceof IsTypeCondition;
