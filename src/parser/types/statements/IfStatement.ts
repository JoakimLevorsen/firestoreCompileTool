import SyntaxComponent, { Position } from "../SyntaxComponent";
import { BinaryExpression } from "../expressions/BinaryExpression";
import BlockStatement from "./BlockStatement";

export default class IfStatement extends SyntaxComponent {
    protected test: BinaryExpression;
    protected consequent: BlockStatement;
    protected alternate?: BlockStatement;

    constructor(
        start: number,
        test: BinaryExpression,
        consequent: BlockStatement,
        alternate?: BlockStatement
    ) {
        const end =
            start +
            test.getEnd() +
            consequent.getEnd() +
            (alternate?.getEnd() || 0);
        const position = { start, end };
        super(position);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}
