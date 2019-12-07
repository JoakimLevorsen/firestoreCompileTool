import { WAIT } from ".";
import { Interface, Token } from "../types";
import ParserError from "./ParserError";

type ParserConstructor<P extends BaseParser> = new (
    interfaces: {
        [id: string]: Interface;
    },
    variablePathComponents: string[]
) => P;

export default abstract class BaseParser {
    protected interfaces: { [id: string]: Interface };
    protected variablePathComponents: string[];

    constructor(
        interfaces: {
            [id: string]: Interface;
        },
        variablePathComponents?: string[]
    ) {
        this.interfaces = interfaces;
        this.variablePathComponents = variablePathComponents || [];
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
        return new constructor(
            this.interfaces,
            this.variablePathComponents
        );
    }
}
