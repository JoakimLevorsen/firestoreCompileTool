import Identifier from "../../Identifier";
import Literal, {
    NumericLiteral,
    StringLiteral
} from "../../literal";
import SyntaxComponent, { Position } from "../../SyntaxComponent";

export class MemberExpression extends SyntaxComponent {
    constructor(
        position: Position,
        private _object: Literal | Identifier | MemberExpression,
        private _property:
            | NumericLiteral
            | StringLiteral
            | Identifier
            | MemberExpression,
        private _computed = false
    ) {
        super(position);
    }

    public get object() {
        return this._object;
    }

    public get property() {
        return this._property;
    }

    public get computed() {
        return this._computed;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof MemberExpression)) return false;
        return (
            this.object.equals(other.object) &&
            this.property.equals(other.property) &&
            this.computed === other.computed
        );
    }
}
