import {
    ConstStatement,
    InterfaceStatement,
    MatchStatement
} from "./statements";
import SyntaxComponent from "./SyntaxComponent";

// The wrapper on the outside all of the contents of a file lie within
export default class FileWrapper extends SyntaxComponent {
    constructor(
        end: number,
        private _content: Array<
            MatchStatement | ConstStatement | InterfaceStatement
        >
    ) {
        super({ start: 0, end });
    }

    public get content() {
        return this._content;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof FileWrapper)) return false;
        if (other._content.length !== this._content.length)
            return false;
        // tslint:disable-next-line: forin
        for (const index in this._content) {
            const a = this._content[index];
            const b = this._content[index];
            if (!a.equals(b)) return false;
        }
        return true;
    }
}
