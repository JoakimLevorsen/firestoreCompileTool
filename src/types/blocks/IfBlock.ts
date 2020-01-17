import { Condition } from "../conditions";
import { Block } from "./Block";
import { CodeBlock } from "./CodeBlock";
import { ReturnExpression } from "../expressions";

export class IfBlock extends Block {
    public condition: Condition;
    public ifTrue: ReturnExpression | CodeBlock | IfBlock;
    public ifFalse?: ReturnExpression | CodeBlock | IfBlock;

    constructor(
        condition: Condition,
        ifTrue: ReturnExpression | CodeBlock | IfBlock,
        ifFalse?: ReturnExpression | CodeBlock | IfBlock
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
        // First we check ifTrue returns
        if (ifTrue instanceof CodeBlock && !ifTrue.allPathsReturn())
            return false;
        if (ifFalse) {
            if (
                ifFalse instanceof CodeBlock &&
                !ifFalse.allPathsReturn()
            ) {
                return false;
            }
            return true;
        }
        return false;
    };

    public toRule = (): string => {
        const { condition, ifFalse, ifTrue } = this;
        if (ifFalse) {
            return `( (${condition.toRule()} && (${ifTrue.toRule()})) || (${ifFalse.toRule()}) )`;
        }
        return `(${condition.toRule()} && (${ifTrue.toRule()}))`;
    };
}

export class IfBlockBuilder {
    private condition?: Condition;
    private ifTrue?: ReturnExpression | CodeBlock | IfBlock;
    private ifFalse?: ReturnExpression | CodeBlock | IfBlock;

    public setCondition(to: Condition) {
        this.condition = to;
        return this;
    }

    public setIfTrue(to: ReturnExpression | CodeBlock | IfBlock) {
        this.ifTrue = to;
        return this;
    }

    public setIfFalse(to: ReturnExpression | CodeBlock | IfBlock) {
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
