import Literal from "./Literal";
import { Position } from "../SyntaxComponent";

export default class BooleanLiteral extends Literal {
    protected value: boolean;

    constructor(position: Position, value: boolean) {
        super(position, value);
        this.value = value;
    }
}
