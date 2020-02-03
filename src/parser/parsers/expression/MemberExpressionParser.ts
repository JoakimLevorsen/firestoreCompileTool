import MemberExpression from "../../types/expressions/MemberExpression";
import Indentifier from "../../types/Identifier";
import BooleanLiteral from "../../types/literal/BooleanLiteral";
import { LiteralOrIdentifier } from "../../types/LiteralOrIdentifier";
import { spaceTokens, tokenHasType } from "../../types/Token";
import LiteralOrIndentifierExtractor from "../IndentifierOrLiteralExtractor";
import LiteralParser from "../literal";
import NumericLiteralParser from "../literal/NumericLiteralParser";
import StringLiteralParser from "../literal/StringLiteralParser";
import Parser from "../Parser";

export default class MemberExpressionParser extends Parser {
    private state:
        | "awaiting first"
        | "awaiting seperator"
        | "awaiting second" = "awaiting first";
    private seperatorType?: "Dot" | "[]";
    private subParser?: LiteralParser;
    private memParser?: MemberExpressionParser;
    private firstItem?: LiteralOrIdentifier;
    private secondItem?: LiteralOrIdentifier | MemberExpression;
    private start?: number;

    public addToken(
        token: import("../../types/Token").Token
    ): LiteralOrIdentifier | MemberExpression | null {
        const error = this.errorCreator(token);
        if (this.start === undefined) this.start = token.location;
        switch (this.state) {
            case "awaiting first":
                if (!this.subParser) {
                    const result = LiteralOrIndentifierExtractor(
                        token,
                        this.errorCreator
                    );
                    if (
                        result instanceof Indentifier ||
                        result instanceof BooleanLiteral
                    ) {
                        this.state = "awaiting seperator";
                        this.firstItem = result;
                        return this.firstItem;
                    } else if (
                        result instanceof NumericLiteralParser ||
                        result instanceof StringLiteralParser
                    ) {
                        this.subParser = result;
                    } else {
                        this.firstItem = result.value;
                        this.subParser = result.parser;
                        return this.firstItem;
                    }
                    return null;
                }
                if (this.subParser.canAccept(token)) {
                    const result = this.subParser.addToken(token);
                    if (result) {
                        this.firstItem = result;
                        return result;
                    }
                    return null;
                }
                // If this token was not acceptable, we fall trough to the next case
                this.state = "awaiting seperator";
            case "awaiting seperator":
                if (token.type === "." || token.type === "[") {
                    this.seperatorType =
                        token.type === "." ? "Dot" : "[]";
                    this.state = "awaiting second";
                    this.memParser = new MemberExpressionParser(
                        this.errorCreator
                    );
                    return null;
                }
                if (tokenHasType(token.type, [...spaceTokens]))
                    return this.firstItem!;
                throw error("Unexpected token");
            case "awaiting second": {
                if (
                    !this.memParser &&
                    tokenHasType(token.type, [...spaceTokens])
                )
                    return null;
                if (!this.memParser) {
                    this.memParser = new MemberExpressionParser(
                        this.errorCreator
                    );
                }
                if (this.memParser.canAccept(token)) {
                    const result = this.memParser.addToken(token);
                    if (result) {
                        this.secondItem = result;
                        return new MemberExpression(
                            {
                                start: this.start,
                                end: this.secondItem.getEnd()
                            },
                            this.firstItem!,
                            this.secondItem
                        );
                    }
                    return null;
                }
                if (this.secondItem && this.seperatorType === "Dot") {
                    return new MemberExpression(
                        {
                            start: this.start,
                            end: this.secondItem.getEnd()
                        },
                        this.firstItem!,
                        this.secondItem!
                    );
                }
                if (
                    this.secondItem &&
                    this.seperatorType === "[]" &&
                    token.type === "]"
                )
                    return new MemberExpression(
                        {
                            start: this.start,
                            end: this.secondItem.getEnd() + 1
                        },
                        this.firstItem!,
                        this.secondItem!
                    );
                throw error("Internal error");
            }
        }
    }

    public canAccept(
        token: import("../../types/Token").Token
    ): boolean {
        switch (this.state) {
            case "awaiting first":
                if (this.subParser) {
                    return this.subParser.canAccept(token);
                }
                try {
                    LiteralOrIndentifierExtractor(
                        token,
                        this.errorCreator
                    );
                    return true;
                } catch (e) {
                    return false;
                }
            case "awaiting seperator":
                return tokenHasType(token.type, ["[", "."]);
            case "awaiting second":
                if (this.memParser) {
                    const canAccept = this.memParser.canAccept(token);
                    if (canAccept) return true;
                    if (this.seperatorType === "Dot")
                        return canAccept;
                    // If the seperator is [] we'll accept it if that is the case
                    return token.type === "]";
                }
                // If the type is [] we'll allow spaces
                if (tokenHasType(token.type, [...spaceTokens]))
                    return true;
                if (
                    this.seperatorType === "[]" &&
                    this.secondItem &&
                    token.type === "]"
                )
                    return true;
                return false;
        }
    }
}
