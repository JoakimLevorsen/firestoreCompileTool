import { BinaryExpression } from "../expressions/BinaryExpression";
import { LiteralOrIdentifier } from "../LiteralOrIdentifier";
import SyntaxComponent, { Position } from "../SyntaxComponent";

export type ConstantValue = BinaryExpression | LiteralOrIdentifier;

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

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ConstantDeclarator)) return false;
        return (
            this.indentifier === other.indentifier &&
            this.value === other.value
        );
    }
}
