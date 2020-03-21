import SyntaxComponent from "../types/SyntaxComponent";

export default class CompilerError extends Error {
    constructor(
        private _item: SyntaxComponent | string,
        private _msg: string
    ) {
        super(`Got error ${_msg} on ${_item}`);
    }

    public get item() {
        return this._item;
    }

    public get msg() {
        return this._msg;
    }
}
