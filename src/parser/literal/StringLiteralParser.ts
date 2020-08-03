import LiteralParser from ".";
import { Token, tokenHasType } from "../../types";
import { StringLiteral } from "../../types/literals";

export class StringLiteralParser extends LiteralParser {
    private state: "Not Opened" | "Open" | "Closed" = "Not Opened";
    private openToken?: '"' | "'";
    private value: string = "";
    private start: number = NaN;

    public addToken(token: Token): StringLiteral | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "Not Opened": {
                if (token.type === '"' || token.type === "'") {
                    this.state = "Open";
                    this.openToken = token.type;
                    return null;
                }
                throw error("Unexpected token");
            }
            case "Open": {
                if (token.type === this.openToken) {
                    this.state = "Closed";
                    return new StringLiteral(
                        this.start,
                        this.value,
                        this.openToken!
                    );
                }
                if (token.type === "Keyword") {
                    this.value += token.value;
                    return null;
                }
                this.value += token.type;
                return null;
            }
            case "Closed":
                throw error("Did not expect more tokens");
        }
    }

    public canAccept(token: Token): boolean {
        const { state } = this;
        if (state === "Open") return true;
        if (state === "Closed") return false;
        if (tokenHasType(token, ['"', "'"])) return true;
        return false;
    }
}
