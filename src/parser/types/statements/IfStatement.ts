import { BinaryExpression } from "../expressions/BinaryExpression";
import SyntaxComponent from "../SyntaxComponent";
import { BlockStatement } from "./";

export class IfStatement extends SyntaxComponent {
    constructor(
        start: number,
        private _test: BinaryExpression,
        private _consequent: BlockStatement,
        private _alternate?: BlockStatement | IfStatement
    ) {
        // super has to be the first statement, so this turned kinda ugly
        super({
            start,
            end:
                start + (_alternate?.getEnd() ?? _consequent.getEnd())
        });
    }

    public get alternate() {
        return this._alternate;
    }

    public get consequent() {
        return this._consequent;
    }

    public get test() {
        return this._test;
    }

    public get allPathsReturn(): boolean {
        if (!this.alternate) return false;
        if (this.alternate instanceof IfStatement)
            return this.alternate.allPathsReturn;
        return true;
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
