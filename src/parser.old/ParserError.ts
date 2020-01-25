import { Token } from "../types";

export class ParserError {
    private reason: string;
    private token: Token;
    private error: Error;
    // tslint:disable-next-line: ban-types
    private parser: Function;
    private stage: string | undefined;

    constructor(
        reason: string,
        token: Token,
        // tslint:disable-next-line: ban-types
        parser: Function,
        stage?: string
    ) {
        this.reason = reason;
        this.token = token;
        this.parser = parser;
        this.stage = stage;
        this.error = new Error(this.toString());
    }

    public getError = () => this.error;

    public toString(): string {
        if (this.stage) {
            return `${this.parser.name} failure: due to ${
                this.reason
            } on ${JSON.stringify(this.token)} during ${this.stage}`;
        }
        return `${this.parser.name} failure: due to ${
            this.reason
        } on ${JSON.stringify(this.token)}`;
    }
}

export const ParserErrorBuilder = (parser: Function) => (
    stage: string,
    token: Token
) => (reason: string) =>
    new ParserError(reason, token, parser, stage);
