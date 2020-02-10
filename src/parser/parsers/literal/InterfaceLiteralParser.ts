import LiteralParser from ".";
import Identifier from "../../types/Identifier";
import InterfaceLiteral, {
    InterfaceLiteralValues
} from "../../types/literal/InterfaceLiteral";
import Literal from "../../types/literal/Literal";
import { spaceTokens, tokenHasType } from "../../types/Token";
import IdentifierOrLiteralExtractor from "../IdentifierOrLiteralExtractor";
import Parser from "../Parser";
import LiteralParserGroup from "./LiteralParserGroup";
export default class InterfaceLiteralParser extends LiteralParser {
    private currentValue: InterfaceLiteralValues = new Map();
    private currentValueOptional: InterfaceLiteralValues = new Map();
    private nextKey?: string;
    private nextKeyOptional = false;
    private subParser?:
        | ReturnType<typeof LiteralParserGroup>
        | Parser;
    private state:
        | "nonOpen"
        | "awaitingName"
        | "awaitingColon"
        | "awaitingType"
        | "awaitingSeperatorOrClose"
        | "closed" = "nonOpen";
    private start = NaN;

    public addToken(
        token: import("../../types/Token").Token
    ): InterfaceLiteral | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "nonOpen":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type === "{") {
                    this.state = "awaitingName";
                    return null;
                }
                throw error("Unexpected token");
            case "awaitingName":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type === "Keyword") {
                    this.nextKey = token.value;
                    return null;
                }
                if (token.type === "}") {
                    this.state = "closed";
                    return new InterfaceLiteral(
                        {
                            start: this.start,
                            end: token.location + 1
                        },
                        this.currentValue,
                        this.currentValueOptional
                    );
                }
                throw error("Unexpected token");
            case "awaitingColon":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type === "?:" || token.type === ":") {
                    this.state = "awaitingType";
                    this.nextKeyOptional = token.type === ":";
                    return null;
                }
                throw error("Unexpected token");
            case "awaitingType": {
                if (!this.subParser) {
                    // Since our LiteralExtractor will return immediately, we must account for this
                    const result = IdentifierOrLiteralExtractor(
                        token,
                        this.errorCreator
                    );
                    if (
                        result instanceof Literal ||
                        result instanceof Identifier
                    ) {
                        this.addType(result);
                        this.state = "awaitingSeperatorOrClose";
                    } else if (result instanceof Parser) {
                        this.subParser = result;
                    } else {
                        this.addType(result.value);
                        this.subParser = result.parser;
                    }
                } else {
                    if (this.subParser.canAccept(token)) {
                        const result = this.subParser.addToken(token);
                        if (result && result instanceof Literal) {
                            this.addType(result);
                        }
                        return null;
                    } else {
                        // Then we assume that value was done
                        this.subParser = LiteralParserGroup(
                            this.errorCreator
                        );
                        this.state = "awaitingSeperatorOrClose";
                    }
                }
                return null;
            }
            case "awaitingSeperatorOrClose":
                if (token.type === "|") {
                    this.state = "awaitingType";
                    return null;
                }
                if (
                    token.type === ";" ||
                    token.type === "," ||
                    token.type === "\n"
                ) {
                    this.state = "awaitingName";
                    this.nextKey = undefined;
                    return null;
                }
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                throw error("Unexpected token");
            case "closed":
                throw error("No tokens expected");
        }
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        switch (this.state) {
            case "nonOpen":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "{"
                ]);
            case "awaitingName":
                return (
                    tokenHasType(token.type, [...spaceTokens]) ||
                    token.type === "Keyword"
                );
            case "awaitingColon":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "?:",
                    ":"
                ]);
            case "awaitingType":
                return (
                    tokenHasType(token.type, [...spaceTokens]) ||
                    token.type === "Keyword"
                );
            case "awaitingSeperatorOrClose":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    ",",
                    ";",
                    "}"
                ]);
            case "closed":
                return false;
        }
    }

    private addType(result: Literal | Identifier) {
        const currentlySet =
            (this.nextKeyOptional
                ? this.currentValueOptional.get(this.nextKey!)
                : this.currentValue.get(this.nextKey!)) || [];
        currentlySet.push(result);
        if (this.nextKeyOptional) {
            this.currentValueOptional.set(
                this.nextKey!,
                currentlySet
            );
        } else this.currentValue.set(this.nextKey!, currentlySet);
    }
}
