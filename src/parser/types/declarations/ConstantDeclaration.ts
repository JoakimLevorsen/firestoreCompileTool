import SyntaxComponent, { Position } from "../SyntaxComponent";
import ConstantDeclarator from "./ConstantDeclarator";

export default class ConstantDeclaration extends SyntaxComponent {
    private declarations: ConstantDeclarator[];

    constructor(
        position: Position,
        declarations: ConstantDeclarator[] = []
    ) {
        super(position);
        this.declarations = declarations;
    }

    public add(declaration: ConstantDeclarator) {
        this.declarations.push(declaration);
        this.setEnd(this.getEnd() + declaration.getEnd());
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof ConstantDeclaration)) return false;
        return (
            this.declarations.length === other.declarations.length &&
            this.declarations.every((v, i) =>
                v.equals(other.declarations[i])
            )
        );
    }
}
