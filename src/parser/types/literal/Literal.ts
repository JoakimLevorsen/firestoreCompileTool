import SyntaxComponent, { Position } from "../SyntaxComponent";

export default abstract class Literal extends SyntaxComponent {
    protected value: string | number | boolean;
    private raw: string;

    constructor(
        position: Position,
        value: string | number | boolean,
        raw: string
    ) {
        super(position);
        this.value = value;
        this.raw = raw;
    }
}
