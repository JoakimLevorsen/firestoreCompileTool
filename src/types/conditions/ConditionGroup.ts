import { Condition } from "./Condition";

type Logic = "&&" | "||";

export class ExpressionGroup {
    private firstVal: Condition;
    private vals: Array<{ logic: Logic; val: Condition }>;
    private nextVal?: Logic;

    constructor(base: Condition) {
        this.firstVal = base;
        this.vals = [];
    }

    public addExpression(val: Condition) {
        const logic = this.nextVal;
        if (!logic) throw new Error("No logic for expression");
        this.vals.push({ logic, val });
        this.nextVal = undefined;
    }

    public addLogic(logic: Logic) {
        if (this.nextVal)
            throw new Error("Unused logic cannot be overridden");
        this.nextVal = logic;
    }

    public ifOnlyExpressionReturn = () =>
        this.vals.length === 0 ? this.firstVal : null;

    public toString = (): string =>
        this.vals.reduce(
            (pV, { logic, val }) =>
                `(${pV} ${logic} ${val.toString()})`,
            this.firstVal.toString()
        );
}
