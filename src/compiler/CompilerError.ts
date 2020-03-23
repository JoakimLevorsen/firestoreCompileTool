import chalk from "chalk";
import SyntaxComponent from "../types/SyntaxComponent";

export default class CompilerError extends Error {
    constructor(
        private _item: SyntaxComponent,
        private _msg: string
    ) {
        super(`Got error ${_msg} on ${JSON.stringify(_item)}`);
    }

    public get item() {
        return this._item;
    }

    public get msg() {
        return this._msg;
    }

    public prettyPrint(file: string): string {
        // First we get the line of the errors
        // We get the substring from start, till the problem arose
        const preError = file.substr(0, this.item.start);
        // Now we count the newLines
        const lines = preError.split("\n").length;
        // Now we get the characters after the last newLine (if this line contained anything else)
        const beforeErrorRegex = preError.match(/(\n|\r)[^\n\r]*$/);
        // We remove the first char, since that is the newline
        const beforeError = beforeErrorRegex?.[0].substr(1) ?? "";
        // Then we get the area with the error
        const errorArea = file.substr(
            this.item.start,
            this.item.end - this.item.start + 1
        );
        // Now we get the area after
        const afterErrorRegex = file
            .substr(this.item.end + 1)
            .match(/^.*/);
        const afterError = afterErrorRegex?.[0] ?? "";

        return `\n${chalk.redBright("Error during compilation:")}\n${
            this.msg
        }\n${beforeError}${chalk.red(
            errorArea
        )}${afterError}\non line ${lines}`;
    }
}
