import { BinaryExpression } from "../expressions/BinaryExpression";
import Indentifier from "../Identifier";
import BooleanLiteral from "../literal/BooleanLiteral";
import SyntaxComponent, { Position } from "../SyntaxComponent";

export default class ReturnStatement extends SyntaxComponent {
    private body: SyntaxComponent;

    constructor(position: Position, newBody: SyntaxComponent) {
        super(position);
        this.body = newBody;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ReturnStatement)) return false;
        return this.body.equals(other.body);
    }
}
