import SyntaxComponent from "./SyntaxComponent";

export default class Identifier extends SyntaxComponent {
    private name: string;

    constructor(start: number, name: string) {
        super({ start, end: start + name.length });
        this.name = name;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof Identifier)) return false;
        return other.name === this.name;
    }
}
