import { ErrorCreator } from "../../ParserError";
import {
    MatchStatement,
    PathElement,
    RuleHeaders,
    RuleStatement
} from "../../types/statements";
import { spaceTokens, Token, tokenHasType } from "../../types/Token";
import Parser from "../Parser";
import { RuleStatementParser } from "./RuleStatementParser";

export class MatchStatementParser extends Parser {
    private start = NaN;
    private state:
        | "awaiting keyword"
        | "parsing path"
        | "awaiting rule block open"
        | "awaiting rule"
        | "parsing rule"
        | "closed" = "awaiting keyword";
    private pathComponents: PathElement[] = [];
    private pathParser = new PathParser();
    private subParser?: RuleStatementParser | MatchStatementParser;
    private rules: RuleStatement[] = [];
    private itemToAdd?: RuleStatement | MatchStatement;
    private subStatements: MatchStatement[] = [];

    public addToken(token: Token): MatchStatement | null {
        const error = this.errorCreator(token);
        if (isNaN(this.start) && token.type !== " ")
            this.start = token.location;
        switch (this.state) {
            case "awaiting keyword":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type !== "match")
                    throw error("Unexpected token");
                this.state = "parsing path";
                return null;
            case "parsing path":
                if (this.pathParser.canAccept(token)) {
                    const result = this.pathParser.addToken(
                        token,
                        this.errorCreator
                    );
                    if (result) {
                        this.pathComponents = result;
                    }
                    return null;
                }
                // If this was not part of the path, but we have a path set, we assume this state is over
                if (!this.pathComponents)
                    throw error("Unexpected token");
                this.state = "awaiting rule block open";
            case "awaiting rule block open":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type !== "{")
                    throw error("Unexpected token");
                this.state = "awaiting rule";
                return null;

            case "awaiting rule":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type === "}") {
                    this.state = "closed";
                    return new MatchStatement(
                        { start: this.start, end: token.location },
                        this.pathComponents!,
                        this.rules,
                        this.subStatements
                    );
                }
                // Now we assign the subParser
                if (!this.subParser) {
                    if (token.type === "match") {
                        this.subParser = new MatchStatementParser(
                            this.errorCreator
                        );
                    } else {
                        this.subParser = new RuleStatementParser(
                            this.errorCreator
                        );
                    }
                }
                if (this.subParser!.canAccept(token)) {
                    this.state = "parsing rule";
                } else throw error("Unexpected token");
            case "parsing rule":
                if (this.subParser!.canAccept(token)) {
                    const result = this.subParser!.addToken(token);
                    if (result) {
                        this.itemToAdd = result;
                    }
                    return null;
                }
                if (this.itemToAdd) {
                    if (this.itemToAdd instanceof RuleStatement) {
                        this.rules.push(this.itemToAdd);
                    } else this.subStatements.push(this.itemToAdd);
                }
                this.state = "awaiting rule";
                this.subParser = undefined;
                // Now we repeat this function since we need to recover the token
                return this.addToken(token);
            case "closed":
                throw error("Internal error");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "awaiting keyword":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "match"
                ]);
            case "parsing path":
                // We fall through to the next case if this doesn't pass
                if (this.pathParser.canAccept(token)) return true;
            case "awaiting rule block open":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "{"
                ]);
            case "parsing rule":
                // We fall back to awaiting rule if this doesn't work
                if (this.subParser!.canAccept(token)) return true;
            case "awaiting rule":
                if (tokenHasType(token.type, [...spaceTokens, "}"]))
                    return true;
                if (token.type === "match") return true;
                if (token.type !== "Keyword") return false;
                return RuleHeaders.some(h => token.value === h);
            case "closed":
                return false;
        }
    }
}

// tslint:disable-next-line: max-classes-per-file
class PathParser {
    private state:
        | "awaiting start"
        | "awaiting element"
        | "awaiting close"
        | "awaiting seperator" = "awaiting start";
    private expectingClose = false;
    private path: PathElement[] = [];

    public addToken(
        token: Token,
        ec: ErrorCreator
    ): PathElement[] | null {
        const error = ec(token);
        switch (this.state) {
            case "awaiting start":
                if (tokenHasType(token.type, [...spaceTokens]))
                    return null;
                if (token.type !== "/")
                    throw error("Unexpected token");
                this.state = "awaiting element";
                return null;
            case "awaiting element":
                if (!this.expectingClose && token.type === "{") {
                    this.expectingClose = true;
                    return null;
                }
                if (token.type !== "Keyword")
                    throw error("Unexpected token");
                this.path.push({
                    name: token.value,
                    wildcard: this.expectingClose
                });
                if (!this.expectingClose) {
                    this.state = "awaiting seperator";
                    return this.path;
                } else this.state = "awaiting close";
                return null;
            case "awaiting close":
                if (token.type !== "}")
                    throw error("Unexpected token");
                this.expectingClose = false;
                this.state = "awaiting seperator";
                return this.path;
            case "awaiting seperator":
                if (token.type !== "/")
                    throw error("Unexpected token");
                this.state = "awaiting element";
                return null;
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.state) {
            case "awaiting start":
                return tokenHasType(token.type, [
                    ...spaceTokens,
                    "/"
                ]);
            case "awaiting element":
                return token.type === "Keyword" || token.type === "{";
            case "awaiting close":
                return token.type === "}";
            case "awaiting seperator":
                return token.type === "/";
        }
    }
}
