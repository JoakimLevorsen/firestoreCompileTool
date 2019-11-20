import {
    Interface,
    isInterface,
    isType,
    KeywordObject,
    Type
} from ".";
import { isInterfaceContent } from "./Interface";

type isTypeCondition = [KeywordObject, "is", Interface];
type isEqualCondition = [
    KeywordObject,
    "=" | "≠",
    Type | KeywordObject | string
];
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
    if (!(one instanceof KeywordObject)) {
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
        isInterface(three) ||
        isInterfaceContent(three) ||
        three instanceof KeywordObject
    ) {
        return true;
    }
    return false;
};
