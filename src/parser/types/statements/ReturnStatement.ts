import { BinaryExpression } from "../expressions/BinaryExpression";
import Identifier from "../Identifier";
import BooleanLiteral from "../literal/BooleanLiteral";
import SyntaxComponent, { Position } from "../SyntaxComponent";

type ExportType = BinaryExpression | Identifier | BooleanLiteral;

export default class ReturnStatement extends SyntaxComponent {
    private body: ExportType;

    constructor(position: Position, newBody: ExportType) {
        super(position);
        this.body = newBody;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ReturnStatement)) return false;
        return this.body.equals(other.body);
    }
}
