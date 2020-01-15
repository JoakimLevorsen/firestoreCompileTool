import { KeywordValue, RawValue } from "..";

type SubValue = RawValue | KeywordValue;

export class IsEqualCondition {
    public values: [SubValue, SubValue];
    public equal: boolean;
    constructor(
        firstValue: SubValue,
        equals: "=" | "≠" | boolean,
        secondValue: SubValue
    ) {
        this.values = [firstValue, secondValue];
        if (typeof equals === "boolean") {
            this.equal = equals;
        } else {
            this.equal = equals === "=";
        }
    }

    public toRule(): string {
        const [firstValue, secondValue] = this.values;
        const comparison = this.equal ? "==" : "!=";
        return `${firstValue} ${comparison} ${secondValue}`;
    }
}
