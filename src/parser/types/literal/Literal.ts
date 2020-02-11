import SyntaxComponent, { Position } from "../SyntaxComponent";
import { InterfaceLiteralValues } from "./InterfaceLiteral";

type LiteralTypes =
    | string
    | number
    | boolean
    | InterfaceLiteralValues;

export abstract class Literal extends SyntaxComponent {
    protected _value: LiteralTypes;

    constructor(position: Position, value: LiteralTypes) {
        super(position);
        this._value = value;
    }

    public abstract get value(): LiteralTypes;

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof Literal)) return false;
        return this.value === other.value;
    }
}
