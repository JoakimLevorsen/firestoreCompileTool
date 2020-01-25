import SyntaxComponent, { Position } from "./SyntaxComponent";

export default class Indentifier extends SyntaxComponent {
    private name: string;

    constructor(position: Position, name: string) {
        super(position);
        this.name = name;
    }
}
