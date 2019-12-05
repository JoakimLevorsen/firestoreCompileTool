import { Interface, KeywordObject } from "..";
import { isInterface } from "../Interface";

export type isTypeCondition = [
    KeywordObject,
    "is" | "only" | "isOnly",
    Interface
];

export const isIsTypeCondition = (
    input: any
): input is isTypeCondition => {
    if (!(input instanceof Array) || input.length !== 3) {
        return false;
    }
    const [first, operator, second] = input;
    if (!(first instanceof KeywordObject)) {
        return false;
    }
    if (
        typeof operator !== "string" ||
        !(
            operator === "is" ||
            operator === "only" ||
            operator === "isOnly"
        )
    ) {
        return false;
    }
    if (!isInterface(second)) {
        return false;
    }
    return true;
};
