import { Expression } from ".";
import { isExpression } from "./Expression";

export class IfBlock {
    public condition: Expression;
    public ifTrue: Expression | IfBlock;
    public ifFalse?: Expression | IfBlock;

    constructor(
        condition: Expression,
        ifTrue: Expression | IfBlock,
        ifFalse?: Expression | IfBlock
    ) {
        this.condition = condition;
        this.ifTrue = ifTrue;
        this.ifFalse = ifFalse;
    }

    public toString(): string {
        const { condition, ifFalse, ifTrue } = this;
        if (this.ifFalse) {
            return `( (${condition} && ${ifTrue}) || (${ifFalse}) )`;
        }
        return `(${condition} && ${ifTrue})`;
    }
}

export class IfBlockBuilder {
    private condition?: Expression;
    private ifTrue?: Expression | IfBlock;
    private ifFalse?: Expression | IfBlock;

    public setCondition(to: Expression) {
        this.condition = to;
        return this;
    }

    public setIfTrue(to: Expression | IfBlock) {
        this.ifTrue = to;
        return this;
    }

    public setIfFalse(to: Expression | IfBlock) {
        this.ifFalse = to;
        return this;
    }

    public getIfBlock(): IfBlock {
        const { condition, ifTrue, ifFalse } = this;
        if (
            isExpression(condition) &&
            (isExpression(ifTrue) || ifTrue instanceof IfBlock) &&
            (isExpression(ifFalse) ||
                ifFalse instanceof IfBlock ||
                ifFalse === undefined)
        ) {
            return new IfBlock(condition, ifTrue, ifFalse);
        }
        throw new Error("Not all fields filled");
    }
}
