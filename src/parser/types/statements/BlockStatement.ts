import SyntaxComponent from "../SyntaxComponent";

export default class BlockStatement extends SyntaxComponent {
    private body: SyntaxComponent[];

    constructor(withBody: SyntaxComponent[] = []) {
        super({ start: 0, end: 0 });
        this.body = withBody;
    }

    public addItem(item: SyntaxComponent) {
        this.setEnd(item.getEnd());
        this.body.push(item);
    }
}
