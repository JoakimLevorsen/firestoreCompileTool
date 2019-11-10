import { charBlock } from ".";

export default class ParserError {
    private reason: string;
    private block: charBlock;
    // tslint:disable-next-line: ban-types
    private parser: Function;
    private stage: string | undefined;

    constructor(
        reason: string,
        block: charBlock,
        // tslint:disable-next-line: ban-types
        parser: Function,
        stage?: string
    ) {
        this.reason = reason;
        this.block = block;
        this.parser = parser;
        this.stage = stage;
    }

    public toString(): string {
        if (this.stage) {
            return `${this.parser.name} failure: due to ${
                this.reason
            } on ${JSON.stringify(this.block)} during ${this.stage}`;
        }
        return `${this.parser.name} failure: due to ${
            this.reason
        } on ${JSON.stringify(this.block)}`;
    }
}
