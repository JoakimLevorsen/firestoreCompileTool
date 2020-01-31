import { Token } from "./types/Token";

export class ParserError extends Error {
    private token: Token;
    private msg: string;
    private file: Token[];

    constructor(fromToken: Token, file: Token[], msg: string) {
        super();
        this.token = fromToken;
        this.file = file;
        this.msg = msg;
    }
}

export const ParserErrorCreator = (file: Token[]) => (
    token: Token
) => (msg: string) => new ParserError(token, file, msg);

export type ErrorCreator = ReturnType<typeof ParserErrorCreator>;

export default ParserErrorCreator;
