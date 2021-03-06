import { Identifier } from "..";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { BooleanLiteral } from "../literals";
import SyntaxComponent from "../SyntaxComponent";
import { CallExpression } from "../expressions/CallExpression";

type ExportType =
    | BinaryExpression
    | Identifier
    | BooleanLiteral
    | CallExpression;

export class ReturnStatement extends SyntaxComponent {
    constructor(start: number, private _body: ExportType) {
        super({ start, end: _body.end });
    }

    public get body() {
        return this._body;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ReturnStatement)) return false;
        return this.body.equals(other.body);
    }
}
