import { RawValue } from "..";
import { Condition } from "../conditions";
import { KeywordValue } from "../values";

export class ReturnExpression {
    private value: RawValue | Condition | KeywordValue;
    constructor(value: RawValue | Condition | KeywordValue) {
        this.value = value;
    }

    public getValue = () => this.value;
}
