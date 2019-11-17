import { Token } from "../types";

export default class ParserError {
    private reason: string;
    private token: Token;
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
    }

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
