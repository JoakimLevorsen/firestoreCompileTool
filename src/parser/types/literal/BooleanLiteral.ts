import Literal from "./Literal";
import { Position } from "../SyntaxComponent";

export default abstract class BooleanLiteral extends Literal {
    protected value: boolean;

    constructor(position: Position, value: boolean, raw: string) {
        super(position, value, raw);
        this.value = value;
    }
}
