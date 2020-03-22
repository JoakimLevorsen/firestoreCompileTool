import SyntaxComponent from "../SyntaxComponent";
import { Identifier } from "../Identifier";
import { MemberExpression } from "./comparison";
import Literal from "../literals";

export class CallExpression extends SyntaxComponent {
    constructor(
        end: number,
        private _target: Identifier | MemberExpression,
        private _arguments: Array<
            Identifier | MemberExpression | Literal | CallExpression
        > = []
    ) {
        super({ start: _target.start, end });
    }

    public get target() {
        return this._target;
    }

    public get arguments() {
        return this._arguments;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof CallExpression)) return false;
        return (
            other.target.equals(this.target) &&
            other.arguments.every((a, i) =>
                this.arguments?.[i].equals(a)
            )
        );
    }
}
