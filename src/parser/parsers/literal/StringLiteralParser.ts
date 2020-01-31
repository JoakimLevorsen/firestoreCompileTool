import Parser from "../Parser";
import { tokenHasType } from "../../types/Token";
import StringLiteral from "../../types/literal/StringLiteral";

export default class StringLiteralParser extends Parser {
    private state: "Not Opened" | "Open" | "Closed" = "Not Opened";
    private openToken?: '"' | "'";
    private value: string = "";
    private start: number = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): import("../../types/SyntaxComponent").default | null {
        if (!this.start) this.start = token.location;
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
                        { start: this.start, end: token.location },
                        this.value
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

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        const { state } = this;
        if (state === "Open") return true;
        if (state === "Closed") return false;
        if (tokenHasType(token.type, ['"', "'"])) return true;
        return false;
    }
}
