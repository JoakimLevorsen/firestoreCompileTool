import SyntaxComponent, { Position } from "../SyntaxComponent";

export default class InterfaceMemberDeclaration extends SyntaxComponent {
    private name: string;
    private type: string[];

    constructor(position: Position, name: string, types: string[]) {
        super(position);
        this.name = name;
        this.type = types;
    }
}
