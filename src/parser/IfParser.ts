import { WAIT } from ".";
import { Expression, IfBlock, Interface, Token } from "../types";
import ExpressionParser from "./ExpressionParser";
import ParserError from "./ParserError";

export default class IfParser {
    private stage:
        | "awaiting keyword"
        | "awaiting condition"
        | "awaiting true"
        | "building true"
        | "awaiting false"
        | "building false" = "awaiting keyword";
    private buildingExpression = false;
    private allInterfaces: { [id: string]: Interface };
    private deepParser: ExpressionParser | IfParser;
    private condition?: Expression;
    private trueBlock?: IfBlock | Expression;
    private hasSeenOneBlockClose = false;

    constructor(interfaces: { [id: string]: Interface }) {
        this.allInterfaces = interfaces;
        this.deepParser = new ExpressionParser(interfaces);
    }

    // NOTE, this will return one token too late if no else part exists
    public addToken(
        token: Token,
        _?: any
    ):
        | ParserError
        | WAIT
        | { type: "IfBlock"; data: IfBlock }
        | { type: "Expression"; data: Expression } {
        const builderError = this.buildError(token, this.stage);
        switch (this.stage) {
            case "awaiting keyword":
                if (token.type !== "Keyword") {
                    return builderError("Expected keyword");
                }
                if (token.value === "return") {
                    this.buildingExpression = true;
                    this.stage = "awaiting condition";
                    return WAIT;
                }
                if (token.value === "if") {
                    this.buildingExpression = false;
                    this.stage = "awaiting condition";
                    return WAIT;
                }
                return builderError("Unknown keyword");
            case "awaiting condition":
                const parserReturn = this.deepParser.addToken(token);
                // If we're only building an expression, we can return whatever the parser gave.
                if (
                    this.buildingExpression ||
                    parserReturn === WAIT ||
                    parserReturn instanceof ParserError
                ) {
                    return parserReturn;
                }
                // Since we aren't building an expression, we got our condition.
                // We have to make sure the parser isn't an IfParser
                if (parserReturn.type === "IfBlock") {
                    return builderError("Internal error");
                }
                this.condition = parserReturn.data;
                this.stage = "awaiting true";
                return WAIT;
            case "awaiting true":
                if (token.type === "BlockOpen") {
                    this.stage = "building true";
                    // Then we reset the parser
                    this.deepParser = new IfParser(
                        this.allInterfaces
                    );
                    return WAIT;
                }
                return builderError("Unexpected token");
            case "building true":
                const parserReturn2 = this.deepParser.addToken(token);
                if (
                    parserReturn2 === WAIT ||
                    parserReturn2 instanceof ParserError
                ) {
                    return parserReturn2;
                }
                this.trueBlock = parserReturn2.data;
                this.stage = "awaiting false";
                this.hasSeenOneBlockClose = false;
                return WAIT;
            case "awaiting false":
                if (token.type === "Keyword") {
                    // This means a pseudo if is present. So we start the "false" part of the if
                    this.deepParser = new IfParser(
                        this.allInterfaces
                    );
                    // The lack of a break is intentional, since we'll fall into the next case
                    this.stage = "building false";
                }
                if (token.type === "SemiColon") {
                    // We just ignore this for now
                    return WAIT;
                } else {
                    // Two BlockCloses means we arent building a false token
                    if (!this.hasSeenOneBlockClose) {
                        this.hasSeenOneBlockClose = true;
                        return WAIT;
                    }
                    // This means we aren't building a false token, so we return the condition and the true
                    if (token.type === "BlockClose") {
                        if (
                            this.condition &&
                            typeof this.condition !== "boolean" &&
                            this.trueBlock !== undefined
                        ) {
                            return {
                                data: {
                                    condition: this.condition,
                                    ifTrue: this.trueBlock
                                },
                                type: "IfBlock"
                            };
                        }

                        return builderError("Internal Error");
                    }
                }
            case "building false":
                const parserReturn3 = this.deepParser.addToken(token);
                if (
                    parserReturn3 === WAIT ||
                    parserReturn3 instanceof ParserError
                ) {
                    return parserReturn3;
                }
                // Now we got our else token, so we can return.
                if (
                    this.condition &&
                    typeof this.condition !== "boolean" &&
                    this.trueBlock
                ) {
                    return {
                        data: {
                            condition: this.condition,
                            ifFalse: parserReturn3.data,
                            ifTrue: this.trueBlock
                        },
                        type: "IfBlock"
                    };
                }

                return builderError("Internal error");
        }
    }

    private buildError = (token: Token, stage: string) => (
        reason: string
    ) => new ParserError(reason, token, IfParser, stage);
}
