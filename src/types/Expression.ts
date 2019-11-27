import { Interface, isInterface, isType, KeywordObject } from ".";
import { isInterfaceContent } from "./Interface";
import RawValue from "./RawValue";

type isTypeCondition = [
    KeywordObject,
    "is" | "only" | "isOnly",
    Interface
];
type isEqualCondition = [
    RawValue | KeywordObject,
    "=" | "≠",
    RawValue | KeywordObject
];

export type Condition = isTypeCondition | isEqualCondition;

export type Expression = RawValue | Condition;

export const isExpression = (input: any): input is Expression => {
    if (input instanceof RawValue) {
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
    if (
        !(one instanceof KeywordObject) &&
        !(one instanceof RawValue)
    ) {
        return false;
    }
    if (
        typeof two !== "string" ||
        !(
            two === "is" ||
            two === "only" ||
            two === "isOnly" ||
            two === "=" ||
            two === "≠"
        )
    ) {
        return false;
    }
    if (
        typeof three === "string" ||
        isType(three) ||
        isInterface(three) ||
        isInterfaceContent(three) ||
        three instanceof KeywordObject ||
        three instanceof RawValue
    ) {
        return true;
    }
    return false;
};
