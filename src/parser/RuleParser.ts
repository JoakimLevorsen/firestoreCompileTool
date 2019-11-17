import { WAIT } from ".";
import {
    IfBlock,
    Interface,
    Rule,
    RuleHeader,
    Token
} from "../types";
import ExpressionParser from "./ExpressionParser";
import IfParser from "./IfParser";
import ParserError from "./ParserError";

const allRules: RuleHeader[] = [
    "create",
    "delete",
    "read",
    "update",
    "write"
];
// Check if input with no spaces is a rule.
export const extractRuleFromString = (input: string) =>
    allRules.find(r => r === input.replace(/\s/g, ""));

export default class RuleParser {
    private stage:
        | "awating start"
        | "building oneLiner"
        | "building rule"
        | "awating finish" = "awating start";
    private interfaces: { [id: string]: Interface };
    private deepParser: IfParser | ExpressionParser;
    private returnable?: IfBlock;

    constructor(interfaces: { [id: string]: Interface }) {
        this.interfaces = interfaces;
        // We assume we'll get a block
        this.deepParser = new IfParser(interfaces);
    }

    public addToken(
        token: Token,
        _?: any
    ): ParserError | WAIT | { type: "Rule"; data: Rule } {
        const builderError = this.buildError(token, this.stage);
        switch (this.stage) {
            case "awating start":
                if (token.type === "BlockOpen") {
                    // This means we're dealing with a normal rule block.
                    this.stage = "building rule";
                    return WAIT;
                }
                if (token.type === "Keyword") {
                    // This is a one liner, so change the parser
                    this.deepParser = new ExpressionParser(
                        this.interfaces
                    );
                    this.stage = "building oneLiner";
                    return WAIT;
                }
                return builderError("Unexpected token");
            case "building oneLiner":
                const parserReturn = this.deepParser.addToken(token);
                if (
                    parserReturn === WAIT ||
                    parserReturn instanceof ParserError
                ) {
                    return parserReturn;
                }
                return { type: "Rule", data: parserReturn.data };
            case "building rule":
                const parserReturn2 = this.deepParser.addToken(token);
                if (
                    parserReturn2 === WAIT ||
                    parserReturn2 instanceof ParserError
                ) {
                    return parserReturn2;
                }
                // If this parserReturn is not an expression and does have an else,
                // we can't return now since we need to catch the last }
                if (
                    parserReturn2.type === "Expression" ||
                    parserReturn2.data.ifFalse === undefined
                ) {
                    return { type: "Rule", data: parserReturn2.data };
                }
                this.stage = "awating finish";
                this.returnable = parserReturn2.data;
                return WAIT;
            case "awating finish":
                if (token.type === "SemiColon") {
                    // We ignore this for now.
                    return WAIT;
                }
                if (token.type === "BlockClose") {
                    if (this.returnable) {
                        return {
                            data: this.returnable,
                            type: "Rule"
                        };
                    }
                    return builderError("Internal error");
                }
                return builderError("Unexpected token");
        }
    }

    private buildError = (token: Token, stage: string) => (
        reason: string
    ) => {
        return new ParserError(reason, token, RuleParser, stage);
    };
}
