import SyntaxComponent, { Position } from "../SyntaxComponent";

export class BlockStatement extends SyntaxComponent {
    private body: SyntaxComponent[];

    constructor(
        position: Position,
        withBody: SyntaxComponent[] = []
    ) {
        super(position);
        this.body = withBody;
    }

    public addItem(item: SyntaxComponent) {
        this.setEnd(item.getEnd());
        this.body.push(item);
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof BlockStatement)) return false;
        return (
            this.body.length === other.body.length &&
            this.body.every((v, i) => v.equals(other.body[i]))
        );
    }
}
