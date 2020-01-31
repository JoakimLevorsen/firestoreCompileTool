import Parser from "./Parser";
import { Token } from "../types/Token";

export default class LiteralParser extends Parser {
    state?: "numeric" | "string" | "boolean";
    value?:
        | boolean
        | { bigNum?: number; seperator: false; smallNum?: number }
        | string;

    canAccept(token: Token) {
        switch (this.state) {
            case "boolean":
                return (
                    token.type === "Keyword" &&
                    (token.value === "true" ||
                        token.value === "false") &&
                    this.value !== undefined
                );
            case "string":
                return this.value !== undefined;
            case "numeric":
                if (this.value && typeof this.value === "object") {
                    if (!this.value.bigNum && !this.value.seperator)
                        return (
                            token.type === "." ||
                            token.type === "," ||
                            (token.type === "Keyword" &&
                                !isNaN(+token.value))
                        );
                    if (!this.value.seperator)
                        return (
                            token.type === "." || token.type === ","
                        );
                    if (this.value.seperator && !this.value.smallNum)
                        return (
                            token.type === "Keyword" &&
                            !isNaN(+token.value)
                        );
                    return false;
                }
            default:
                return (
                    token.type === '"' ||
                    token.type === "'" ||
                    (token.type === "Keyword" &&
                        (!isNaN(+token.value) ||
                            token.value === "true" ||
                            token.value === "false"))
                );
        }
    }
}
