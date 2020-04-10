import chalk from "chalk";
import { Token } from "../types/Token";

export class ParserError extends Error {
    constructor(fromToken: Token, file: string, msg: string) {
        // First we find the index of the problematic token
        // First we get the line of the errors
        // We get the substring from start, till the problem arose
        const start = fromToken.location;
        const end =
            start +
            (fromToken.type === "Keyword"
                ? fromToken.value.length
                : fromToken.type.length) -
            1;
        const preError = file.substr(0, start);
        // Now we count the newLines
        const lines = preError.split("\n").length;
        // Now we get the characters after the last newLine (if this line contained anything else)
        const beforeErrorRegex = preError.match(/(\n|\r)[^\n\r]*$/);
        // We remove the first char, since that is the newline
        const beforeError = beforeErrorRegex?.[0].substr(1) ?? "";
        // Then we get the area with the error
        const errorArea = file.substr(start, end - start + 1);
        // Now we get the area after
        const afterErrorRegex = file.substr(end + 1).match(/^.*/);
        const afterError = afterErrorRegex?.[0] ?? "";
        super(
            `\n${chalk.redBright(
                "Error during compilation:"
            )}\n${msg}\n${beforeError}${chalk.red(
                errorArea
            )}${afterError}\non line ${lines}`
        );
    }
}

export const ParserErrorCreator = (file: string) => (
    token: Token
) => (msg: string) => new ParserError(token, file, msg);

export type ErrorCreator = ReturnType<typeof ParserErrorCreator>;

export default ParserErrorCreator;
