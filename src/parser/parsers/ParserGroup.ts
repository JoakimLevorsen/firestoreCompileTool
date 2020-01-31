import Parser from "./Parser";
import SyntaxComponent from "../types/SyntaxComponent";
import { Token } from "../types/Token";

export default class ParserGroup extends Parser {
    private parsers: Parser[];

    constructor(...parsers: Parser[]) {
        super();
        this.parsers = parsers;
    }

    public addToken(token: Token): SyntaxComponent | null {
        // We keep any parser that succeeds
    }
    public canAccept(token: Token): boolean {
        return this.parsers.some(p => p.canAccept(token));
    }
}
