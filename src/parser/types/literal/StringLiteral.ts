import Literal from "./Literal";
import { Position } from "../SyntaxComponent";

export default abstract class StringLiteral extends Literal {
    protected value: string;

    constructor(position: Position, value: string, raw: string) {
        super(position, value, raw);
        this.value = value;
    }
}
