import SyntaxComponent, { Position } from "../SyntaxComponent";

export default class InterfaceMemberDeclaration extends SyntaxComponent {
    private name: string;
    private type: string[];

    constructor(position: Position, name: string, types: string[]) {
        super(position);
        this.name = name;
        this.type = types;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof InterfaceMemberDeclaration))
            return false;
        return (
            this.name === other.name &&
            this.type.length === other.type.length &&
            this.type.every((v, i) => v === other.type[i])
        );
    }
}
