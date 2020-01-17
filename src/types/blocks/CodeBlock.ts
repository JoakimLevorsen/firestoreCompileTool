import { Block } from "./Block";
import { IfBlock } from "./IfBlock";
import { Expression, ReturnExpression } from "../expressions";
import { RawValue } from "../values";

export class CodeBlock extends Block {
    // A code block is a series of expressions and
    private content: Array<CodeBlock | IfBlock | Expression> = [];

    public addContent = (item: IfBlock | Expression) =>
        this.content.push(item);

    public insertFirst = (item: CodeBlock | IfBlock | Expression) =>
        (this.content = [item, ...this.content]);

    public allPathsReturn(): boolean {
        for (const line of this.content) {
            // If this line returns, we know we return.
            if (line instanceof ReturnExpression) return true;
            // If this line is just a RawValue we also know it returns
            if (line instanceof RawValue) return true;
            // If this is an if/else where both paths return
            if (line instanceof IfBlock && line.allPathsReturn())
                return true;
        }
        return false;
    }

    public toRule = (): string => {
        if (!this.allPathsReturn())
            throw new Error(
                "Cannot save block to rules that does not return"
            );
        // If we have an if block, we just export that
        const ifBlock = this.content.find(
            c => c instanceof IfBlock
        ) as IfBlock;
        if (ifBlock) {
            return ifBlock.toRule();
        }
        // Since theres no ifBlock, we just return the Expression
        const returnX = this.content.find(
            c => c instanceof ReturnExpression
        ) as ReturnExpression;
        if (returnX) {
            return returnX.toRule();
        }
        // If we just contain a raw value, we'll just return it
        const raw = this.content.find(
            c => c instanceof RawValue
        ) as RawValue;
        if (raw) {
            return raw.toRule();
        }
        throw new Error("Could not export to rule");
    };
}
