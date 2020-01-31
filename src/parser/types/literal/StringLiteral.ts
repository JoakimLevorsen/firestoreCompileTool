import Literal from "./Literal";
import { Position } from "../SyntaxComponent";

export default class StringLiteral extends Literal {
    protected value: string;

    constructor(position: Position, value: string) {
        super(position, value);
        this.value = value;
    }
}
