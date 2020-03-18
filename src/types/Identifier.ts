import SyntaxComponent from "./SyntaxComponent";

export class Identifier extends SyntaxComponent {
    constructor(start: number, private _name: string) {
        super({ start, end: start + _name.length - 1 });
    }

    public get name() {
        return this._name;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof Identifier)) return false;
        return other.name === this.name;
    }
}
