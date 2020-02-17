import { Token } from "./types/Token";

export class ParserError extends Error {
    constructor(fromToken: Token, file: Token[], msg: string) {
        // First we find the index of the problematic token
        const index = file.findIndex(
            t => t.location === fromToken.location
        );
        if (index !== -1) {
            //  We get all the new lines on the way
            const newLinesCount = file
                .slice(0, index)
                .filter(t => t.type === "\n");
            if (newLinesCount.length === 0) {
                super(
                    `'${msg}' occured on ${JSON.stringify(
                        fromToken
                    )} on Line 0, char ${fromToken.location}`
                );
                return;
            }
            // This means the error must be on the newLinesCount line, with the char of the difference between the two locations
            const char = newLinesCount[newLinesCount.length - 1];
            super(
                `'${msg}' occured on ${JSON.stringify(
                    fromToken
                )} on Line ${newLinesCount.length +
                    1}, char ${fromToken.location - char.location}`
            );
            return;
        }
        super(`'${msg}' occured on ${JSON.stringify(fromToken)}`);
    }
}

export const ParserErrorCreator = (file: Token[]) => (
    token: Token
) => (msg: string) => new ParserError(token, file, msg);

export type ErrorCreator = ReturnType<typeof ParserErrorCreator>;

export default ParserErrorCreator;
