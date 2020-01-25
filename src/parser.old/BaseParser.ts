import { WAIT, ParserError } from ".";
import { Token, Block } from "../types";

export type ParserConstructor<P extends BaseParser> = new (
    parentBlock: Block
) => P;

export default abstract class BaseParser {
    // The block of the parent item, if a parser creates it's own block, it will be a child of this
    protected parentBlock: Block;
    protected block?: Block;

    constructor(parentBlock: Block) {
        this.parentBlock = parentBlock;
        if (this.postConstructor) this.postConstructor();
    }

    // Setup after the constructor has run.
    postConstructor?(): void;

    // The next token is also included, since it lets a parser determine if it is needed for the next one.
    public abstract addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: string; data: any };

    protected spawn<P extends BaseParser>(
        constructor: ParserConstructor<P>
    ): P {
        // Spawn a new parser with indentical interfaces/path
        return new constructor(this.block || this.parentBlock);
    }
}

export { BaseParser };
