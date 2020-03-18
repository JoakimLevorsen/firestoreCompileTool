import SyntaxComponent from "../types/SyntaxComponent";

export default class CompilerError extends Error {
    constructor(item: SyntaxComponent | string, msg: string) {
        super(`Got error ${msg} on ${item}`);
    }
}
