import { Expression } from "..";
import { Condition } from "../conditions";
import { Block } from "./Block";
import { CodeBlock } from "./CodeBlock";

export class IfBlock extends Block {
    public condition: Condition;
    public ifTrue: Expression | CodeBlock | IfBlock;
    public ifFalse?: Expression | CodeBlock | IfBlock;

    constructor(
        condition: Condition,
        ifTrue: Expression | CodeBlock | IfBlock,
        ifFalse?: Expression | CodeBlock | IfBlock
    ) {
        super();
        this.condition = condition;
        this.ifTrue = ifTrue;
        this.ifFalse = ifFalse;
    }

    public hasFalse = this.ifFalse !== undefined;

    // Does ifTrue return? and ifFalse exists does it also?
    public allPathsReturn = () => {
        const { ifFalse, ifTrue } = this;
        if (ifFalse) {
            if (
                ifFalse instanceof CodeBlock &&
                !ifFalse.allPathsReturn()
            ) {
                return false;
            }
        }
        if (ifTrue instanceof CodeBlock && !ifTrue.allPathsReturn())
            return false;
        return true;
    };

    public toString(): string {
        const { condition, ifFalse, ifTrue } = this;
        if (this.ifFalse) {
            return `( (${condition} && ${ifTrue}) || (${ifFalse}) )`;
        }
        return `(${condition} && ${ifTrue})`;
    }
}

export class IfBlockBuilder {
    private condition?: Condition;
    private ifTrue?: Expression | CodeBlock | IfBlock;
    private ifFalse?: Expression | CodeBlock | IfBlock;

    public setCondition(to: Condition) {
        this.condition = to;
        return this;
    }

    public setIfTrue(to: Expression | CodeBlock | IfBlock) {
        this.ifTrue = to;
        return this;
    }

    public setIfFalse(to: Expression | CodeBlock | IfBlock) {
        this.ifFalse = to;
        return this;
    }

    public getIfBlock(): IfBlock {
        const { condition, ifTrue, ifFalse } = this;
        if (condition && ifTrue) {
            return new IfBlock(condition, ifTrue, ifFalse);
        }
        throw new Error("Not all fields filled");
    }
}
