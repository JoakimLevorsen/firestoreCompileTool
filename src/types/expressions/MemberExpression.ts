import { Identifier } from "..";
import Literal, { NumericLiteral, StringLiteral } from "../literals";
import SyntaxComponent from "../SyntaxComponent";

export class MemberExpression extends SyntaxComponent {
    constructor(
        end: number,
        private _object: Literal | Identifier | MemberExpression,
        private _property:
            | NumericLiteral
            | StringLiteral
            | Identifier
            | MemberExpression,
        private _computed = false,
        private _optional = false
    ) {
        super({ start: _object.start, end });
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

    public get optional() {
        return this._optional;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof MemberExpression)) return false;
        return (
            this.object.equals(other.object) &&
            this.property.equals(other.property) &&
            this.computed === other.computed &&
            this.optional === other.optional
        );
    }
}
