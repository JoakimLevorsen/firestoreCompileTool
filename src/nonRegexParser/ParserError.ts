import { charBlock } from ".";

export default class ParserError {
    reason: string;
    block: charBlock;
    parser: Function;
    stage: string | undefined;

    constructor(
        reason: string,
        block: charBlock,
        parser: Function,
        stage?: string
    ) {
        this.reason = reason;
        this.block = block;
        this.parser = parser;
        this.stage = stage;
    }

    toString(): string {
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
