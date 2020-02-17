import Parser from "./Parser";
import {
    MatchStatementParser,
    ConstStatementParser,
    InterfaceStatementParser
} from "./statement";
import { tokenHasType, spaceTokens, Token } from "../types/Token";
import FileWrapper from "../types/FileWrapper";
import {
    MatchStatement,
    InterfaceStatement,
    ConstStatement
} from "../types/statements";

export default class FileWrapperParser extends Parser {
    private subParser?:
        | MatchStatementParser
        | ConstStatementParser
        | InterfaceStatementParser;
    private itemToAdd?:
        | MatchStatement
        | InterfaceStatement
        | ConstStatement;
    private content: (
        | MatchStatement
        | InterfaceStatement
        | ConstStatement
    )[] = [];

    public addToken(token: Token): FileWrapper | null {
        if (this.subParser) {
            // If this subParser can accept the token, we assume its done
            if (this.subParser.canAccept(token)) {
                const result = this.subParser.addToken(token);
                if (result) {
                    this.itemToAdd = result;
                    const end =
                        token.type !== "Keyword"
                            ? token.location
                            : token.location + token.value.length - 1;
                    return new FileWrapper(end, [
                        ...this.content,
                        result
                    ]);
                }
                return null;
            }
            // Since we didn't return, we assume this parser is done
            if (this.itemToAdd) {
                this.content.push(this.itemToAdd);
                this.itemToAdd = undefined;
            }
            this.subParser = undefined;
        }
        if (tokenHasType(token.type, [...spaceTokens])) return null;
        if (token.type === "EOF") {
            return new FileWrapper(
                token.location + 2,
                this.itemToAdd
                    ? [...this.content, this.itemToAdd]
                    : this.content
            );
        }
        switch (token.type) {
            case "match":
                this.subParser = new MatchStatementParser(
                    this.errorCreator
                );
                break;
            case "interface":
                this.subParser = new InterfaceStatementParser(
                    this.errorCreator
                );
                break;
            case "const":
                this.subParser = new ConstStatementParser(
                    this.errorCreator
                );
                break;
            default:
                throw this.errorCreator(token)("Unexpected token");
        }
        // Now since we assigned the new subParser, we run this function again
        return this.addToken(token);
    }

    public canAccept(token: Token): boolean {
        if (this.subParser) {
            if (this.subParser.canAccept(token)) return true;
        }
        return tokenHasType(token.type, [
            ...spaceTokens,
            "match",
            "interface",
            "const",
            "EOF"
        ]);
    }
}
