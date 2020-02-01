import SyntaxComponent, { Position } from "./SyntaxComponent";

export default class Identifier extends SyntaxComponent {
    private name: string;

    constructor(position: Position, name: string) {
        super(position);
        this.name = name;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof Identifier)) return false;
        return other.name === this.name;
    }
}
