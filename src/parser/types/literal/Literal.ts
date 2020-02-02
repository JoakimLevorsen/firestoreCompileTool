import SyntaxComponent, { Position } from "../SyntaxComponent";

export default abstract class Literal extends SyntaxComponent {
    protected _value: string | number | boolean;

    constructor(
        position: Position,
        value: string | number | boolean
    ) {
        super(position);
        this._value = value;
    }

    public abstract get value(): string | number | boolean;

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof Literal)) return false;
        return this.value === other.value;
    }
}
