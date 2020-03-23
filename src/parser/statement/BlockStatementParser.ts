import { NonBlockStatementGroup } from ".";
import { spaceTokens, Token, tokenHasType } from "../../types";
import { BlockLine, BlockStatement } from "../../types/statements";
import SyntaxComponent from "../../types/SyntaxComponent";
import Parser from "../Parser";

export class BlockStatementParser extends Parser {
    private state: "Unopened" | "Opened" | "Closed" = "Unopened";
    private lines: BlockLine[] = [];
    private nextLine?: BlockLine;
    private subParser?: ReturnType<typeof NonBlockStatementGroup>;
    private start = NaN;

    public addToken(
        token: Token,
        selfCall = false
    ): SyntaxComponent | null {
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
                if (!this.subParser)
                    this.subParser = NonBlockStatementGroup(
                        this.errorCreator
                    );
                if (this.subParser.canAccept(token)) {
                    const result = this.subParser.addToken(token);
                    if (result && result.length > 0) {
                        if (result.length > 1)
                            throw error("Too many results");
                        this.nextLine = result[0] as BlockLine;
                    }
                    return null;
                } else if (this.nextLine) {
                    this.lines.push(this.nextLine);
                    this.nextLine = undefined;
                    this.subParser = undefined;
                }
                if (token.type === "}") {
                    this.state = "Closed";
                    return new BlockStatement(
                        {
                            start: this.start,
                            end: token.location + 1
                        },
                        this.lines
                    );
                }
                // If the token wasn't } we'll run this function again since the subParser likely was reset. Though only if this addToken was not already called recursively.
                if (!selfCall) {
                    return this.addToken(token, true);
                } else {
                    throw this.errorCreator(token)(
                        "Unexpected token"
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
                if (this.subParser && this.subParser.canAccept(token))
                    return true;
                if (tokenHasType(token, [...spaceTokens]))
                    return true;
                if (
                    NonBlockStatementGroup(
                        this.errorCreator
                    ).canAccept(token)
                )
                    return true;
                return token.type === "}";
            case "Closed":
                return false;
        }
    }
}
