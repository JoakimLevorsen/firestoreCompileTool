import SyntaxComponent, { Position } from "../SyntaxComponent";

export default class ConstantDeclaration extends SyntaxComponent {
    private declarations: ConstantDeclaration[];

    constructor(
        position: Position,
        declarations: ConstantDeclaration[] = []
    ) {
        super(position);
        this.declarations = declarations;
    }

    public add(declaration: ConstantDeclaration) {
        this.declarations.push(declaration);
        this.setEnd(this.getEnd() + declaration.getEnd());
    }
}
