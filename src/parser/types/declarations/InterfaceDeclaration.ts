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

    add(content: InterfaceMemberDeclaration) {
        this.content.push(content);
        this.setEnd(this.getEnd() + content.getEnd());
    }
}
