import SyntaxComponent, { Position } from "../SyntaxComponent";
import { BinaryExpression } from "../expressions/BinaryExpression";
import Expression from "../expressions";
import Indentifier from "../Indentifier";
import BooleanLiteral from "../literal/BooleanLiteral";

type body = BinaryExpression | Indentifier | BooleanLiteral;

export default class ReturnStatement extends SyntaxComponent {
    private body: body;

    constructor(position: Position, body: body) {
        super(position);
        this.body = body;
    }
}
