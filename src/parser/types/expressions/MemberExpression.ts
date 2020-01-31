import SyntaxComponent, { Position } from "../SyntaxComponent";
import { LiteralOrIndentifier } from "../LiteralOrIndentifier";
import Indentifier from "../Indentifier";
import NumericLiteral from "../literal/NumericLiteral";
import StringLiteral from "../literal/StringLiteral";

type MemberType = LiteralOrIndentifier | MemberExpression;
type PropertyType =
    | NumericLiteral
    | StringLiteral
    | Indentifier
    | MemberExpression;

export default class MemberExpression extends SyntaxComponent {
    protected object: MemberType;
    protected property: PropertyType;

    constructor(
        position: Position,
        object: MemberType,
        property: PropertyType
    ) {
        super(position);
        this.object = object;
        this.property = property;
    }
}
