import BlockStatement from "../../types/statements/BlockStatement";
import SyntaxComponent from "../../types/SyntaxComponent";
import { spaceTokens, tokenHasType } from "../../types/Token";
import Parser from "../Parser";
import NonBlockStatementGroup from "./NonBlockStatementGroup";

export default class BlockStatementParser extends Parser {
    private state: "Unopened" | "Opened" | "Closed" = "Unopened";
    private lines: SyntaxComponent[] = [];
    private nextLine?: SyntaxComponent;
    private subParser?: ReturnType<typeof NonBlockStatementGroup>;
    private start = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): import("../../types/SyntaxComponent").default | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "Unopened":
                if (tokenHasType(token.type, [...spaceTokens]))
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
                        this.nextLine = result[0];
                    }
                    return null;
                } else if (this.nextLine) {
                    this.lines.push(this.nextLine);
                    this.nextLine = undefined;
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
            case "Closed":
                throw error("Unexpected Token");
        }
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        switch (this.state) {
            case "Unopened":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "{"
                ]);
            case "Opened":
                if (this.subParser && this.subParser.canAccept(token))
                    return true;
                if (tokenHasType(token.type, [...spaceTokens]))
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
