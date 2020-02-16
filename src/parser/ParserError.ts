import { Token } from "./types/Token";

export class ParserError extends Error {
    constructor(fromToken: Token, file: Token[], msg: string) {
        super(`'${msg}' occured on ${JSON.stringify(fromToken)}`);
        // tslint:disable-next-line: no-unused-expression
        file;
    }
}

export const ParserErrorCreator = (file: Token[]) => (
    token: Token
) => (msg: string) => new ParserError(token, file, msg);

export type ErrorCreator = ReturnType<typeof ParserErrorCreator>;

export default ParserErrorCreator;
