import SyntaxComponent from "../types/SyntaxComponent";
import { Token } from "../types/Token";
import Parser from "./Parser";

export default class ParserGroup {
    private parsers: Parser[];

    constructor(...parsers: Parser[]) {
        this.parsers = parsers;
    }

    public addToken(token: Token): SyntaxComponent[] | null {
        // We keep any parser that succeeds
        const survivingParsers: Parser[] = [];
        const returns: SyntaxComponent[] = [];
        for (const parser of this.parsers) {
            try {
                const result = parser.addToken(token);
                if (result !== null) returns.push(result);
                survivingParsers.push(parser);
            } catch (e) {
                // We ignore parsers that fail, unless it was the last one
                if (this.parsers.length === 1) {
                    throw e;
                }
            }
        }
        this.parsers = survivingParsers;
        if (survivingParsers.length === 0)
            throw new Error("Ran out of parsers");
        if (returns.length === 0) return null;
        return returns;
    }
    public canAccept(token: Token): boolean {
        return this.parsers.some(p => p.canAccept(token));
    }
}
