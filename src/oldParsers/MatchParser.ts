import { WAIT } from ".";
import ParserError from "./ParserError";
import RuleParser, { extractRuleFromString } from "./RuleParser";
import { MatchGroup, Token, RuleHeader, RuleSet } from "../types";
import ExpressionGroupParser from "./ExpressionGroupParser";
import BaseParser from "./BaseParser";

export default class MatchParser extends BaseParser {
    rulesWritten: RuleSet = {};
    path: string[] = [];
    addingPathComponent = false;
    stage:
        | "awaiting keyword"
        | "awaiting path"
        | "building path"
        | "awaiting rule"
        | "awaiting first rule word"
        | "building rule" = "awaiting keyword";
    ruleToBuildType: RuleHeader[] = [];
    deepParser!: RuleParser | ExpressionGroupParser;
    subMatchParser?: MatchParser;
    subGroups?: MatchGroup[];
    twoBlockCloseInARow = false;

    public postConstructor() {
        this.deepParser = this.spawn(RuleParser);
    }

    public addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: "Match"; data: MatchGroup } {
        const errorBuilder = this.buildError(token);
        switch (this.stage) {
            case "awaiting keyword":
                if (
                    token.type === "Keyword" &&
                    token.value === "match"
                ) {
                    this.stage = "awaiting path";
                    return WAIT;
                }
                return errorBuilder("Keyword failed", this.stage);
            case "awaiting path":
                if (token.type === "Keyword") {
                    this.addToPath(token.value);
                    return WAIT;
                }
                if (token.type === "/") {
                    // TODO
                    // Add more checks later
                    if (this.addingPathComponent) {
                        return errorBuilder(
                            "Slash added prematurely.",
                            this.stage
                        );
                    }
                    return WAIT;
                }
                if (token.type === "{") {
                    if (!this.addingPathComponent) {
                        // We assume the path is done if not adding path component.
                        // this.stage = "awaiting token";
                        this.stage = "awaiting rule";
                        return WAIT;
                    }
                }
                if (token.type === "[") {
                    if (this.addingPathComponent) {
                        return errorBuilder(
                            "Can't open path component, when previous wasn't finished",
                            this.stage
                        );
                    }
                    this.addingPathComponent = true;
                    return WAIT;
                }
                if (token.type === "]") {
                    this.addingPathComponent = false;
                    return WAIT;
                }
                return errorBuilder(
                    "Unknown path component.",
                    this.stage
                );
            // case "awaiting block":
            //     if (block.type === "BlockOpen") {
            //         this.stage = "awaiting rule";
            //         this.ruleToBuildType = [];
            //         return WAIT;
            //     }
            //     return errorBuilder(
            //         "Expected block open, got",
            //         this.stage
            //     );
            case "awaiting rule":
                /* If the subMatchParser exists, we are building a submatch, and will just continue giving that our data untill it's done*/
                if (this.subMatchParser) {
                    const result = this.subMatchParser.addToken(
                        token,
                        nextToken
                    );
                    if (
                        result instanceof ParserError ||
                        result === "WAIT"
                    ) {
                        return result;
                    }
                    if (this.subGroups) {
                        this.subGroups.push(result.data);
                    } else {
                        this.subGroups = [result.data];
                    }
                    this.subMatchParser = undefined;
                    return WAIT;
                }
                if (token.type === "Keyword") {
                    const rule = extractRuleFromString(token.value);
                    if (rule === undefined) {
                        // We check if this keyword is the start of a new match block.
                        if (token.value === "match") {
                            this.subMatchParser = new MatchParser(
                                this.interfaces
                            );
                            this.subMatchParser.addToken(
                                token,
                                nextToken
                            );
                            return WAIT;
                        } else {
                            throw new Error(
                                `Unknown rule type ${JSON.stringify(
                                    token
                                )}`
                            );
                        }
                    }
                    this.ruleToBuildType.push(rule);
                    return WAIT;
                }
                if (token.type === ",") {
                    // We ignore this now, fix in future.
                    return WAIT;
                }
                if (token.type === ":") {
                    // We wait for the first word of the new rule to se if it's a oneliner
                    this.stage = "awaiting first rule word";
                    return WAIT;
                }
                if (token.type === "}") {
                    // Are we finishing a previous rule, or are we all done?
                    // TODO: WHY DID REMOVING THIS FIX ANYTHING?
                    // if (!this.twoBlockCloseInARow) {
                    //     this.twoBlockCloseInARow = true;
                    //     return WAIT;
                    // }
                    // This means we have completed all rules and can return our matchset.
                    return {
                        type: "Match",
                        data: {
                            rules: this.rulesWritten,
                            path: this.path,
                            pathVariables: this
                                .variablePathComponents,
                            subGroups: this.subGroups
                        }
                    };
                }
                if (token.type === ";") {
                    // We ignore this for now
                    return WAIT;
                }
                return errorBuilder(
                    "Unknown token for rule",
                    this.stage
                );
            case "awaiting first rule word":
                if (token.type !== "Keyword" && token.type !== "{") {
                    return errorBuilder("Expected keyword");
                }
                if (
                    token.type === "{" ||
                    (token.type === "Keyword" &&
                        (token.value === "if" ||
                            token.value === "return"))
                ) {
                    this.deepParser = this.spawn(RuleParser);
                } else {
                    this.deepParser = this.spawn(
                        ExpressionGroupParser
                    );
                }
                this.stage = "building rule";
            // We don't return since we want to fall into the next case.
            case "building rule":
                const parserReturn = this.deepParser.addToken(
                    token,
                    nextToken
                );
                if (
                    parserReturn === WAIT ||
                    parserReturn instanceof ParserError
                ) {
                    return parserReturn;
                }
                // Now we have a new rule to add for each header.
                this.ruleToBuildType.forEach(
                    rule =>
                        (this.rulesWritten[rule] = parserReturn.data)
                );
                // We head back to the await rule stage, since we don't know if more are comming.
                this.stage = "awaiting rule";
                // Reset the rule header
                this.ruleToBuildType = [];
                // If this rule was a one liner, we've already passed a metaphorical blockClose
                this.twoBlockCloseInARow =
                    this.deepParser instanceof ExpressionGroupParser;
                return WAIT;
            default:
                return errorBuilder(
                    "Unknown block type.",
                    this.stage
                );
        }
    }

    private buildError = (token: Token) => (
        reason: string,
        stage?: string
    ) => new ParserError(reason, token, MatchParser, stage);

    private addToPath(add: string) {
        if (this.addingPathComponent) {
            // This means we should also add to the pathComponents
            this.variablePathComponents.push(add);
        }
        this.path.push(add);
    }
}
