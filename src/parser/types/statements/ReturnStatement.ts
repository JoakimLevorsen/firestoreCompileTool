import { BinaryExpression } from "../expressions/BinaryExpression";
import Identifier from "../Identifier";
import { BooleanLiteral } from "../literal";
import SyntaxComponent from "../SyntaxComponent";

type ExportType = BinaryExpression | Identifier | BooleanLiteral;

export default class ReturnStatement extends SyntaxComponent {
    private body: ExportType;

    constructor(start: number, newBody: ExportType) {
        super({ start, end: newBody.getEnd() });
        this.body = newBody;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ReturnStatement)) return false;
        return this.body.equals(other.body);
    }
}
