import SyntaxComponent, { Position } from "../SyntaxComponent";
import InterfaceLiteral from "../literal/InterfaceLiteral";

export default class InterfaceDeclaration extends SyntaxComponent {
    private name: string;
    private content: InterfaceLiteral[];

    constructor(
        position: Position,
        name: string,
        content: InterfaceLiteral[] = []
    ) {
        super(position);
        this.name = name;
        this.content = content;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof InterfaceDeclaration)) return false;
        return (
            this.name === other.name &&
            this.content.length === other.content.length &&
            this.content.every((v, i) => v.equals(other.content[i]))
        );
    }
}
