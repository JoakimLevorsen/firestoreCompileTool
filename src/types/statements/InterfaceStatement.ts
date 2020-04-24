import { InterfaceLiteral } from "../literals";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import { Identifier } from "../Identifier";

export class InterfaceStatement extends SyntaxComponent {
    constructor(
        position: Position,
        private _name: string,
        private _content: InterfaceLiteral,
        private _extensions: Identifier[] = []
    ) {
        super(position);
    }

    public get name(): string {
        return this._name;
    }

    public get content(): InterfaceLiteral {
        return this._content;
    }

    public get extensions() {
        return this._extensions;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof InterfaceStatement)) return false;
        return (
            this.name === other.name &&
            this._content.equals(other._content)
        );
    }
}
