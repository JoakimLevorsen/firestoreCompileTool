import SyntaxComponent, { Position } from "../SyntaxComponent";

export default abstract class Literal extends SyntaxComponent {
    protected value: string | number | boolean;

    constructor(
        position: Position,
        value: string | number | boolean
    ) {
        super(position);
        this.value = value;
    }
}
