import { spaceTokens, Token, tokenHasType } from "../../types";
import { BlockStatement } from "../../types/statements";
import SyntaxComponent from "../../types/SyntaxComponent";
import Parser from "../Parser";
import { BlockContentParser } from "./BlockContentParser";

export class BlockStatementParser extends Parser {
    private state: "Unopened" | "Opened" | "Closed" = "Unopened";
    private lastReturn?: SyntaxComponent;
    private subParser = new BlockContentParser(this.errorCreator);
    private start = NaN;

    public addToken(token: Token): SyntaxComponent | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "Unopened":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === "{") {
                    this.state = "Opened";
                    return null;
                }
                throw error("Unexpected token");
            case "Opened":
                if (this.subParser.canAccept(token)) {
                    const result = this.subParser.addToken(token);
                    if (result) this.lastReturn = result;
                    return null;
                }
                if (token.type === "}") {
                    this.state = "Closed";
                    if (this.lastReturn) {
                        this.lastReturn.end = token.location + 1;
                        this.lastReturn.start = this.start;
                        return this.lastReturn;
                    }
                    return new BlockStatement(
                        {
                            start: this.start,
                            end: token.location + 1
                        },
                        []
                    );
                }
            case "Closed":
                throw error("Unexpected Token");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "Unopened":
                return tokenHasType(token, [...spaceTokens, "{"]);
            case "Opened":
                if (this.subParser.canAccept(token)) return true;
                return token.type === "}";
            case "Closed":
                return false;
        }
    }
}
