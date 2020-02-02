import SyntaxComponent, { Position } from "../SyntaxComponent";
import InterfaceMemberDeclaration from "./InterfaceMemberDeclaration";

export default class InterfaceDeclaration extends SyntaxComponent {
    private name: string;
    private content: InterfaceMemberDeclaration[];

    constructor(
        position: Position,
        name: string,
        content: InterfaceMemberDeclaration[] = []
    ) {
        super(position);
        this.name = name;
        this.content = content;
    }

    public add(content: InterfaceMemberDeclaration) {
        this.content.push(content);
        this.setEnd(this.getEnd() + content.getEnd());
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