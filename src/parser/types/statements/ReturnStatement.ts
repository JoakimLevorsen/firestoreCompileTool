import { BinaryExpression } from "../expressions/BinaryExpression";
import Identifier from "../Identifier";
import { BooleanLiteral } from "../literal";
import SyntaxComponent from "../SyntaxComponent";

type ExportType = BinaryExpression | Identifier | BooleanLiteral;

export class ReturnStatement extends SyntaxComponent {
    constructor(start: number, private _body: ExportType) {
        super({ start, end: _body.getEnd() });
    }

    public get body() {
        return this._body;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ReturnStatement)) return false;
        return this.body.equals(other.body);
    }
}
