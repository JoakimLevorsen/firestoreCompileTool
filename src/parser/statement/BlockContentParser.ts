import Parser from "../Parser";
import { Token, tokenHasType, spaceTokens } from "../../types";
import SyntaxComponent from "../../types/SyntaxComponent";
import { BlockLine, BlockStatement } from "../../types/statements";
import { NonBlockStatementGroup } from ".";

export class BlockContentParser extends Parser {
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
                return new BlockStatement(
                    {
                        start: this.start,
                        end: token.location + 1
                    },
                    [...this.lines, result[0] as BlockLine]
                );
            }
            return null;
        } else if (this.nextLine) {
            this.lines.push(this.nextLine);
            this.nextLine = undefined;
            this.subParser = undefined;
        }
        // If the token wasn't } we'll run this function again since the subParser likely was reset. Though only if this addToken was not already called recursively.
        if (!selfCall) {
            return this.addToken(token, true);
        } else {
            throw this.errorCreator(token)("Unexpected token");
        }
    }

    public canAccept(token: Token): boolean {
        if (this.subParser && this.subParser.canAccept(token))
            return true;
        if (tokenHasType(token, [...spaceTokens])) return true;
        if (
            NonBlockStatementGroup(this.errorCreator).canAccept(token)
        )
            return true;
        // We do not account for being closed at all
        return false;
    }
}
