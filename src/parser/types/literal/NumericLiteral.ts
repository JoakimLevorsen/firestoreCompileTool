import Literal from "./Literal";
import { Position } from "../SyntaxComponent";

export default class NumericLiteral extends Literal {
    protected value: number;

    constructor(position: Position, value: number) {
        super(position, value);
        this.value = value;
    }
}
