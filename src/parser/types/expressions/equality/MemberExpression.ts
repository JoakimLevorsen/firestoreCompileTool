import Indentifier from "../../Identifier";
import Literal from "../../literal";
import { LiteralOrIdentifier } from "../../LiteralOrIdentifier";
import SyntaxComponent, { Position } from "../../SyntaxComponent";

type PropertyType = Literal | Indentifier | MemberExpression;

export class MemberExpression extends SyntaxComponent {
    constructor(
        position: Position,
        private _object: LiteralOrIdentifier,
        private _property: PropertyType
    ) {
        super(position);
    }

    public get object() {
        return this._object;
    }

    public get property() {
        return this._property;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof MemberExpression)) return false;
        return (
            this.object.equals(other.object) &&
            this.property.equals(other.property)
        );
    }
}
