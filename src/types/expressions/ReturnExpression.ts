import { RawValue } from "..";
import { Condition, isCondition } from "../conditions";

export class ReturnExpression {
    private value: RawValue | Condition;
    constructor(value: RawValue | Condition) {
        this.value = value;
    }

    public getValue = () => this.value;
}
