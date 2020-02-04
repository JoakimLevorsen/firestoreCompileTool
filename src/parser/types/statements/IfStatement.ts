import { BinaryExpression } from "../expressions/BinaryExpression";
import SyntaxComponent from "../SyntaxComponent";
import BlockStatement from "./BlockStatement";

export default class IfStatement extends SyntaxComponent {
    protected test: BinaryExpression;
    protected consequent: BlockStatement;
    protected alternate?: BlockStatement | IfStatement;

    constructor(
        start: number,
        test: BinaryExpression,
        consequent: BlockStatement,
        alternate?: BlockStatement | IfStatement
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

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof IfStatement)) return false;
        if (
            (this.alternate && !other.alternate) ||
            (!this.alternate && other.alternate)
        )
            return false;
        if (
            this.alternate &&
            other.alternate &&
            !this.alternate.equals(other.alternate)
        )
            return false;
        return (
            this.test.equals(other.test) &&
            this.consequent.equals(other.consequent)
        );
    }
}
