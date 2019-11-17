import { Interface, isInterface, isType, Type } from ".";

type isTypeCondition = [string, "is", Interface];
type isEqualCondition = [string, "=" | "≠", Type | string];
export type Condition = isTypeCondition | isEqualCondition;

export type Expression = boolean | Condition;

export const isExpression = (input: any): input is Expression => {
    if (typeof input === "boolean") {
        return true;
    }
    if (
        typeof input !== "object" ||
        !(input instanceof Array) ||
        input.length !== 3
    ) {
        return false;
    }
    const [one, two, three] = input;
    if (typeof one !== "string") {
        return false;
    }
    if (
        typeof two !== "string" ||
        !(two === "is" || two === "=" || two === "≠")
    ) {
        return false;
    }
    if (
        typeof three === "string" ||
        isType(three) ||
        isInterface(three)
    ) {
        return true;
    }
    return false;
};
