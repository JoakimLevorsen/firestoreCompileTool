import Literal from "./Literal";
import { Position } from "../SyntaxComponent";

export default abstract class NumericLiteral extends Literal {
    protected value: number;

    constructor(position: Position, value: number, raw: string) {
        super(position, value, raw);
        this.value = value;
    }
}
