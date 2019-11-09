import {
    extractRuleFromString,
    extractLogicFromString
} from "../extractionTools/matchGroup";
import { charBlock, WAIT } from ".";
import { Interface } from "../extractionTools/interface";
import ParserError from "./ParserError";
import RuleParser, { Rule } from "./RuleParser";
import ExpressionParser from "./ExpressionParser";

export type RuleHeader =
    | "read"
    | "write"
    | "create"
    | "update"
    | "delete";
export type RuleSet = { [Header in RuleHeader]?: Rule };
export type MatchGroup = {
    path: string[];
    pathVariables: string[];
    rules: RuleSet;
};

export default class MatchParser {
    rulesWritten: RuleSet = {};
    path: string[] = [];
    pathComponents: string[] = [];
    addingPathComponent = false;
    stage:
        | "awaiting keyword"
        | "awaiting path"
        | "building path"
        | "awaiting rule"
        | "awaiting first rule word"
        | "building rule" = "awaiting keyword";
    ruleToBuildType: RuleHeader[] = [];
    deepParser: RuleParser | ExpressionParser;
    interfaces: { [id: string]: Interface };
    twoBlockCloseInARow = false;

    constructor(interfaces: { [id: string]: Interface }) {
        this.interfaces = interfaces;
        this.deepParser = new RuleParser(interfaces);
    }

    private buildError = (block: charBlock) => (
        reason: string,
        stage?: string
    ) => new ParserError(reason, block, MatchParser, stage);

    public addChar(
        block: charBlock,
        interfaces: { [id: string]: Interface }
    ): ParserError | WAIT | { type: "Match"; data: MatchGroup } {
        const errorBuilder = this.buildError(block);
        switch (this.stage) {
            case "awaiting keyword":
                if (
                    block.type === "Keyword" &&
                    block.value === "match"
                ) {
                    this.stage = "awaiting path";
                    return WAIT;
                }
                return errorBuilder("Keyword failed", this.stage);
            case "awaiting path":
                if (block.type === "Keyword") {
                    this.addToPath(block.value);
                    return WAIT;
                }
                if (block.type === "Slash") {
                    // TODO
                    // Add more checks later
                    if (this.addingPathComponent)
                        return errorBuilder(
                            "Slash added prematurely.",
                            this.stage
                        );
                    return WAIT;
                }
                if (block.type === "BlockOpen") {
                    if (!this.addingPathComponent) {
                        // We assume the path is done if not adding path component.
                        // this.stage = "awaiting block";
                        this.stage = "awaiting rule";
                        return WAIT;
                    }
                }
                if (block.type === "IndexOpen") {
                    if (this.addingPathComponent)
                        return errorBuilder(
                            "Can't open path component, when previous wasn't finished",
                            this.stage
                        );
                    this.addingPathComponent = true;
                    return WAIT;
                }
                if (block.type === "IndexClose") {
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
                if (block.type === "Keyword") {
                    const rule = extractRuleFromString(block.value);
                    if (rule === undefined)
                        throw `Unknown rule type ${block.value}`;
                    this.ruleToBuildType.push(rule);
                    return WAIT;
                }
                if (block.type === "Comma") {
                    // We ignore this now, fix in future.
                    return WAIT;
                }
                if (block.type === "Colon") {
                    // We wait for the first word of the new rule to se if it's a oneliner
                    this.stage = "awaiting first rule word";
                    return WAIT;
                }
                if (block.type === "BlockClose") {
                    // Are we finishing a previous rule, or are we all done?
                    if (!this.twoBlockCloseInARow) {
                        this.twoBlockCloseInARow = true;
                        return WAIT;
                    }
                    // This means we have completed all rules and can return our matchset.
                    return {
                        type: "Match",
                        data: {
                            rules: this.rulesWritten,
                            path: this.path,
                            pathVariables: this.pathComponents
                        }
                    };
                }
                if (block.type === "SemiColon") {
                    // We ignore this for now
                    return WAIT;
                }
                return errorBuilder(
                    "Unknown token for rule",
                    this.stage
                );
            case "awaiting first rule word":
                if (
                    block.type !== "Keyword" &&
                    block.type !== "BlockOpen"
                )
                    return errorBuilder("Expected keyword");
                if (
                    block.type === "BlockOpen" ||
                    (block.type === "Keyword" &&
                        (block.value === "if" ||
                            block.value === "return"))
                )
                    this.deepParser = new RuleParser(this.interfaces);
                else
                    this.deepParser = new ExpressionParser(
                        this.interfaces
                    );
                this.stage = "building rule";
                // If the char was a block open, we return, otherwise we fall through to the next case.
                if (block.type === "BlockOpen") return WAIT;
            case "building rule":
                const parserReturn = this.deepParser.addChar(block);
                if (
                    parserReturn === WAIT ||
                    parserReturn instanceof ParserError
                )
                    return parserReturn;
                // Now we have a new rule to add for each header.
                this.ruleToBuildType.forEach(
                    rule =>
                        (this.rulesWritten[rule] = parserReturn.data)
                );
                // We head back to the await rule stage, since we don't know if more are comming.
                this.stage = "awaiting rule";
                // If this rule was a one liner, we've already passed a metaphorical blockClose
                this.twoBlockCloseInARow =
                    this.deepParser instanceof ExpressionParser;
                return WAIT;
            default:
                return errorBuilder(
                    "Unknown block type.",
                    this.stage
                );
        }
    }

    private addToPath(add: string) {
        if (this.addingPathComponent) {
            // This means we should also add to the pathComponents
            this.pathComponents.push(add);
        }
        this.path.push(add);
    }
}
