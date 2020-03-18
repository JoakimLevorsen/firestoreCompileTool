import SyntaxComponent, { Position } from "../SyntaxComponent";
import { ConstStatement } from "./ConstStatement";
import { IfStatement } from "./IfStatement";
import { InterfaceStatement } from "./InterfaceStatement";
import { ReturnStatement } from "./ReturnStatement";

export type BlockLine =
    | ConstStatement
    | IfStatement
    | ReturnStatement
    | InterfaceStatement;

export class BlockStatement extends SyntaxComponent {
    constructor(position: Position, private _body: BlockLine[] = []) {
        super(position);
    }

    public get body() {
        return this._body;
    }

    public addItem(item: BlockLine) {
        this.setEnd(item.end);
        this.body.push(item);
    }

    protected internalEquals(other: BlockLine): boolean {
        if (!(other instanceof BlockStatement)) return false;
        return (
            this.body.length === other.body.length &&
            this.body.every((v, i) => v.equals(other.body[i]))
        );
    }
}
