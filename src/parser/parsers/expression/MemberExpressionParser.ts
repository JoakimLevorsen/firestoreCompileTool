import { MemberExpression } from "../../types/expressions";
import Identifier from "../../types/Identifier";
import Literal, {
    NumericLiteral,
    StringLiteral
} from "../../types/literal";
import { LiteralOrIdentifier } from "../../types/LiteralOrIdentifier";
import { Token } from "../../types/Token";
import IdentifierExtractor from "../IdentifierExtractor";
import LiteralOrIndentifierExtractor from "../IdentifierOrLiteralExtractor";
import LiteralParser from "../literal";
import Parser from "../Parser";

export default class MemberExpressionParser extends Parser {
    private stage:
        | "awaiting first"
        | "building first"
        | "awaiting seperator"
        | "awaiting second"
        | "building brackets"
        | "awaiting bracket close"
        | "newStart" = "awaiting first";
    private litParser?: LiteralParser;
    private bracketParser?: MemberExpressionParser;
    private firstElement?: Literal | Identifier | MemberExpression;
    private secondElement?:
        | NumericLiteral
        | StringLiteral
        | Identifier
        | MemberExpression;
    private start = NaN;
    private lastExComputed = false;
    private optionalAccess = false;

    public addToken(
        token: Token
    ): LiteralOrIdentifier | MemberExpression | null {
        const error = this.errorCreator(token);
        if (isNaN(this.start)) this.start = token.location;
        switch (this.stage) {
            case "awaiting first":
                const extracted = LiteralOrIndentifierExtractor(
                    token,
                    this.errorCreator
                );
                if (
                    extracted instanceof Literal ||
                    extracted instanceof Identifier
                ) {
                    this.firstElement = extracted;
                    this.stage = "awaiting seperator";
                    return extracted;
                }
                if (extracted instanceof Parser) {
                    this.litParser = extracted;
                    this.stage = "building first";
                    return null;
                }
                this.litParser = extracted.parser;

                this.firstElement = extracted.value;
                this.stage = "building first";
                return extracted.value;
            case "building first": {
                const returned = this.litParser!.addToken(token);
                if (returned) {
                    this.firstElement = returned;
                    return returned;
                }
                return null;
            }
            case "awaiting seperator":
                if (token.type === "." || token.type === "?.") {
                    this.stage = "awaiting second";
                    this.optionalAccess = token.type === "?.";
                    return null;
                } else if (token.type === "[") {
                    this.bracketParser = new MemberExpressionParser(
                        this.errorCreator
                    );
                    this.stage = "building brackets";
                    return null;
                }
                throw error("Unexpected token");
            case "awaiting second":
                // Since this is only for after the dot, we know only Identifiers are allowed
                this.secondElement = IdentifierExtractor(
                    token,
                    this.errorCreator
                );
                this.lastExComputed = false;
                this.stage = "newStart";
                return this.buildExpression();
            case "building brackets":
                // If this parser can't accept this token, we assume it's because it's done.
                if (this.bracketParser!.canAccept(token)) {
                    const returned = this.bracketParser!.addToken(
                        token
                    );
                    if (returned) {
                        if (
                            !(
                                returned instanceof StringLiteral ||
                                returned instanceof NumericLiteral ||
                                returned instanceof Identifier ||
                                returned instanceof MemberExpression
                            )
                        )
                            throw error("Unexpected token");
                        this.secondElement = returned;
                    }
                    return null;
                }
            case "awaiting bracket close":
                if (token.type === "]") {
                    this.stage = "newStart";
                    this.lastExComputed = true;
                    return this.buildExpression(true, token.location);
                }
                throw error("Expected ]");
            case "newStart":
                // If this token starts a new member, we wrap the current MemberExpression into the first
                if (token.type === "." || token.type === "?.") {
                    this.firstElement = this.buildExpression(
                        this.lastExComputed
                    );
                    this.optionalAccess = token.type === "?.";
                    this.stage = "awaiting second";
                    return null;
                } else if (token.type === "[") {
                    this.firstElement = this.buildExpression(
                        this.lastExComputed,
                        this.secondElement!.getEnd()
                    );
                    this.bracketParser = new MemberExpressionParser(
                        this.errorCreator
                    );
                    this.stage = "building brackets";
                    return null;
                }
                throw error("Unexpected token");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.stage) {
            // The first and second stages almost work the same
            case "awaiting first":
                try {
                    LiteralOrIndentifierExtractor(
                        token,
                        this.errorCreator
                    );
                    return true;
                } catch (e) {
                    return false;
                }

            case "awaiting second":
                try {
                    IdentifierExtractor(token, this.errorCreator);
                    return true;
                } catch (e) {
                    return false;
                }
            case "building first":
                // If the parser doesn't accept, it might be because we need to fall through
                if (this.litParser?.canAccept(token)) return true;
            // The NewStart accepts the same characters, so we repeat it
            case "awaiting seperator":
            case "newStart":
                return (
                    token.type === "." ||
                    token.type === "[" ||
                    token.type === "?."
                );
            case "building brackets":
                if (this.bracketParser?.canAccept(token)) return true;
            case "awaiting bracket close":
                return token.type === "]";
        }
    }

    private buildExpression = (computed = false, end?: number) =>
        new MemberExpression(
            {
                start: this.start,
                end: end ?? this.secondElement!.getEnd()
            },
            this.firstElement!,
            this.secondElement!,
            computed,
            this.optionalAccess
            // tslint:disable-next-line: semicolon
        );
}
