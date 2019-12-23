import { WAIT, ParserError } from ".";
import { Token, Block, collapseBlockChain } from "../types";

export type ParserConstructor<P extends BaseParser> = new (
    blockChain?: Block[]
) => P;

export default abstract class BaseParser {
    // The chain of blocks to me
    protected blockChain: Block[];

    constructor(blockChain?: Block[]) {
        this.blockChain = blockChain || [];
        this.postConstructor();
    }

    // Setup after the constructor has run.
    public abstract postConstructor(): void;

    // The next token is also included, since it lets a parser determine if it is needed for the next one.
    public abstract addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: string; data: any };

    protected spawn<P extends BaseParser>(
        constructor: ParserConstructor<P>
    ): P {
        // Spawn a new parser with indentical interfaces/path
        return new constructor(this.blockChain);
    }

    public getScope = () => collapseBlockChain(this.blockChain);
}
