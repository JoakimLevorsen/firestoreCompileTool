import Indentifier from "../Identifier";
import Literal from "../literal/Literal";
import { LiteralOrIdentifier } from "../LiteralOrIdentifier";
import SyntaxComponent, { Position } from "../SyntaxComponent";

type MemberType = LiteralOrIdentifier | MemberExpression;
type PropertyType = Literal | Indentifier | MemberExpression;

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

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof MemberExpression)) return false;
        return (
            this.object.equals(other.object) &&
            this.property.equals(other.property)
        );
    }
}
