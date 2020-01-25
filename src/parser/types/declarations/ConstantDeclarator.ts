import SyntaxComponent, { Position } from "../SyntaxComponent";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { LiteralOrIndentifier } from "../LiteralOrIndentifier";

export type ConstantValue = BinaryExpression | LiteralOrIndentifier;

export default class ConstantDeclarator extends SyntaxComponent {
    private indentifier: string;
    private value: ConstantValue;

    constructor(
        position: Position,
        indentifier: string,
        value: ConstantValue
    ) {
        super(position);
        this.indentifier = indentifier;
        this.value = value;
    }
}
