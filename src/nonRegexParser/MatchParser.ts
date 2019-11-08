import {
    RuleSet,
    MatchGroup,
    RuleHeader,
    extractRuleFromString,
    extractLogicFromString,
    Logic
} from "../extractionTools/matchGroup";
import { charBlock, WAIT } from ".";
import { Interface } from "../extractionTools/interface";
import ParserError from "./ParserError";

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
        | "building rule" = "awaiting keyword";
    ruleToBuildType: RuleHeader[] = [];

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
                    // This means the block has started.
                    this.stage = "building rule";
                    this.ruleHasEncounteredABlock = false;
                    return WAIT;
                }
                return errorBuilder(
                    "Unknown token for rule",
                    this.stage
                );
            case "building rule":
                return this.buildingRule(block, interfaces);
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

    ruleHasEncounteredABlock = false;
    logicStringBuilder = "";
    private buildingRule(
        block: charBlock,
        interfaces: { [id: string]: Interface }
    ): ParserError | WAIT | { type: "Match"; data: MatchGroup } {
        console.log("Told to build rule for ", block);
        const errorBuilder = this.buildError(block);
        switch (block.type) {
            case "BlockOpen":
                if (!this.ruleHasEncounteredABlock) {
                    this.ruleHasEncounteredABlock = true;
                    return WAIT;
                }
                // Deeper blocks are a future feature
                return errorBuilder(
                    "Blocks are not yet allowed to exist within other blocks.",
                    this.stage
                );
            case "BlockClose":
                if (this.ruleHasEncounteredABlock) {
                    // Add check if code has returned
                    this.ruleHasEncounteredABlock = false;
                    this.stage = "awaiting rule";
                    return WAIT;
                } else {
                    return {
                        type: "Match",
                        data: {
                            path: this.path,
                            pathVariables: this.pathComponents,
                            rules: this.rulesWritten
                        }
                    };
                }
                return errorBuilder(
                    "Unexpected block close.",
                    this.stage
                );
            case "Keyword":
                console.log("Got keyword", JSON.stringify(block));
                if (this.logicStringBuilder === "")
                    this.logicStringBuilder = block.value;
                else this.logicStringBuilder += " " + block.value;
                return WAIT;
            case "SemiColon":
                console.log(
                    "Got semicolon building logic for",
                    JSON.stringify(this.logicStringBuilder)
                );
                // First we check if the previous statement was just a booklean
                let logic: Logic;
                if (
                    this.logicStringBuilder === "true" ||
                    this.logicStringBuilder === "false"
                ) {
                    if (this.logicStringBuilder === "true")
                        logic = true;
                    else logic = false;
                } else {
                    logic = extractLogicFromString(
                        this.logicStringBuilder,
                        interfaces,
                        this.ruleHasEncounteredABlock
                    );
                }
                this.logicStringBuilder = "";
                this.ruleToBuildType.forEach(
                    t => (this.rulesWritten[t] = logic)
                );
                // Then reset the rule type
                this.ruleToBuildType = [];
                return WAIT;
            default:
                return errorBuilder(
                    "Unknown block type for building rule.",
                    this.stage
                );
        }
    }
}
