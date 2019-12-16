import { Condition, IsEqualCondition, IsTypeCondition } from ".";
import {
    Expression,
    Interface,
    isInterface,
    KeywordObject,
    RawValue
} from "..";

type equalsValues = "=" | "≠";
type isValues = "is" | "only" | "isOnly";
type comparisonTypes = equalsValues | isValues;

export class ConditionBuilder {
    private firstValue?: RawValue | KeywordObject;
    private operator?: comparisonTypes;
    private secondValue?: RawValue | KeywordObject | Interface;

    public setFirstValue(to: RawValue | KeywordObject) {
        this.firstValue = to;
        return this;
    }

    public setOperator(to: comparisonTypes) {
        this.operator = to;
        return this;
    }

    public setSecondValue(to: RawValue | KeywordObject | Interface) {
        this.secondValue = to;
        return this;
    }

    public getCondition(): Condition {
        // First we check if it's the type
        if (
            this.firstValue instanceof KeywordObject &&
            (this.operator === "is" ||
                this.operator === "isOnly" ||
                this.operator === "only") &&
            isInterface(this.secondValue)
        ) {
            return new IsTypeCondition(
                this.firstValue,
                this.operator,
                this.secondValue
            );
        }
        // Then if it's an equal
        if (
            this.firstValue &&
            (this.operator === "=" || this.operator === "≠") &&
            (this.secondValue instanceof RawValue ||
                this.secondValue instanceof KeywordObject)
        ) {
            return new IsEqualCondition(
                this.firstValue,
                this.operator,
                this.secondValue
            );
        }
        throw new Error("Not all fields filled.");
    }

    public getExpression(): Expression {
        if (this.firstValue instanceof RawValue) {
            return this.firstValue;
        }
        throw new Error(
            "Can only export expression if firstvalue is RawValue"
        );
    }
}
