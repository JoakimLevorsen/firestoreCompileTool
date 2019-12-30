import { Block } from "./Block";
import { IfBlock } from "./IfBlock";
import { Expression, ReturnExpression } from "../expressions";

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
            // If this is an if/else where both paths return
            if (
                line instanceof IfBlock &&
                line.hasFalse &&
                line.allPathsReturn()
            )
                return true;
        }
        return false;
    }
}
