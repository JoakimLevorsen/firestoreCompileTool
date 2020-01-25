export interface Position {
    start: number;
    end: number;
}

export default abstract class SyntaxComponent {
    private position: Position;

    constructor(position: Position) {
        this.position = position;
    }

    protected setEnd = (e: number) => (this.position.end = e);

    getEnd = () => this.position.end;
}
