import { KeywordObject, RawValue } from "..";

export type isEqualCondition = [
    RawValue | KeywordObject,
    "=" | "≠",
    RawValue | KeywordObject
];

export const isIsEqualCondition = (
    input: any
): input is isEqualCondition => {
    if (!(input instanceof Array) || input.length !== 3) {
        return false;
    }
    const [first, operator, second] = input;
    if (
        !(first instanceof KeywordObject || first instanceof RawValue)
    ) {
        return false;
    }
    if (
        typeof operator !== "string" ||
        !(operator === "=" || operator === "≠")
    ) {
        return false;
    }
    if (
        !(
            second instanceof KeywordObject ||
            second instanceof RawValue
        )
    ) {
        return false;
    }
    return true;
};
