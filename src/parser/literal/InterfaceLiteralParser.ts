import LiteralParser, { LiteralParserGroup } from ".";
import { IdentifierOrLiteralExtractor } from "..";
import {
    Identifier,
    nonKeywordTokens,
    spaceTokens,
    Token,
    tokenHasType,
    typeTokens
} from "../../types";
import Literal, {
    InterfaceLiteral,
    InterfaceLiteralValues
} from "../../types/literals";
import Parser from "../Parser";

const seperatorTokens: nonKeywordTokens[] = [",", ";", "\n"];

export class InterfaceLiteralParser extends LiteralParser {
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

    public addToken(token: Token): InterfaceLiteral | null {
        if (isNaN(this.start)) this.start = token.location;
        const error = this.errorCreator(token);
        switch (this.state) {
            case "nonOpen":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === "{") {
                    this.state = "awaitingName";
                    return null;
                }
                throw error("Unexpected token");
            case "awaitingName":
                if (
                    tokenHasType(token, [
                        ...spaceTokens,
                        ...seperatorTokens
                    ])
                )
                    return null;
                if (token.type === "Keyword") {
                    this.nextKey = token.value;
                    this.state = "awaitingColon";
                    return null;
                }
                if (token.type === "}") {
                    this.state = "closed";
                    return new InterfaceLiteral(
                        {
                            start: this.start,
                            end: token.location
                        },
                        this.currentValue,
                        this.currentValueOptional
                    );
                }
                throw error("Unexpected token");
            case "awaitingColon":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === "?:" || token.type === ":") {
                    this.state = "awaitingType";
                    this.nextKeyOptional = token.type === "?:";
                    return null;
                }
                throw error("Unexpected token");
            case "awaitingType": {
                if (!this.subParser) {
                    // If this is a space we ignore it
                    if (tokenHasType(token, [...spaceTokens]))
                        return null;
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
                    return null;
                } else {
                    if (this.subParser.canAccept(token)) {
                        const result = this.subParser.addToken(token);
                        if (result && result instanceof Literal) {
                            this.addType(result);
                        }
                        return null;
                    }
                    // Then we assume that value was done, and fall trough to the next case
                }
            }
            case "awaitingSeperatorOrClose":
                if (token.type === "|") {
                    this.state = "awaitingType";
                    return null;
                }
                if (token.type === "}") {
                    this.state = "closed";
                    return new InterfaceLiteral(
                        { start: this.start, end: token.location },
                        this.currentValue,
                        this.currentValueOptional
                    );
                }
                if (tokenHasType(token, [...seperatorTokens])) {
                    this.state = "awaitingName";
                    this.nextKey = undefined;
                    return null;
                }
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                throw error("Unexpected token");
            case "closed":
                throw error("No tokens expected");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "nonOpen":
                return tokenHasType(token, [...spaceTokens, "{"]);
            case "awaitingName":
                return (
                    tokenHasType(token, [
                        ...spaceTokens,
                        "}",
                        ...seperatorTokens
                    ]) || token.type === "Keyword"
                );
            case "awaitingColon":
                return tokenHasType(token, [
                    ...spaceTokens,
                    "?:",
                    ":"
                ]);
            case "awaitingType":
                if (this.subParser) {
                    if (this.subParser.canAccept(token)) return true;
                    // If this subParser couldn't handle the result, we fall trough to the next case
                } else {
                    return (
                        tokenHasType(token, [
                            ...spaceTokens,
                            ...typeTokens,
                            "{"
                        ]) || token.type === "Keyword"
                    );
                }
            case "awaitingSeperatorOrClose":
                return tokenHasType(token, [
                    ...spaceTokens,
                    ...seperatorTokens,
                    "}",
                    "|"
                ]);
            case "closed":
                return false;
        }
    }

    private addType(result: Literal | Identifier) {
        const currentlySet =
            (this.nextKeyOptional
                ? this.currentValueOptional.get(this.nextKey!)
                : this.currentValue.get(this.nextKey!)) ?? [];
        currentlySet.push(result);
        if (this.nextKeyOptional) {
            this.currentValueOptional.set(
                this.nextKey!,
                currentlySet
            );
        } else this.currentValue.set(this.nextKey!, currentlySet);
    }
}
