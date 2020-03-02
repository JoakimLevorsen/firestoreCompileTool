export interface Position {
    start: number;
    end: number;
}

export default abstract class SyntaxComponent {
    private position: Position;

    constructor(position: Position) {
        this.position = position;
    }

    public equals(other: SyntaxComponent): boolean {
        if (
            this.position.end !== other.position.end ||
            this.position.start !== other.position.start
        )
            return false;
        return this.internalEquals(other);
    }

    public getEnd = () => this.position.end;

    protected setEnd = (e: number) => (this.position.end = e);

    protected abstract internalEquals(
        other: SyntaxComponent
    ): boolean;
}
