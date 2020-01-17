import {
    Token,
    isRuleHeader,
    RuleHeader,
    PathBuilder,
    MatchBlock
} from "../../types";
import { ParserError, ParserErrorBuilder } from "../ParserError";
import { WAIT } from "../WAIT";
import ConditionParser from "../ConditionParser";
import { AbstractBlockParser, CodeBlockParser } from ".";
import { BaseParser } from "../BaseParser";

export class MatchBlockParser extends BaseParser
    implements AbstractBlockParser {
    private blockPath = new PathBuilder();
    protected block = this.parentBlock.spawnChild(MatchBlock);
    private ruleBuildingType?: RuleHeader;
    private matchDeepParser?: CodeBlockParser | ConditionParser;
    private stage:
        | "awaiting keyword"
        | "awaiting path slash"
        | "awaiting path segment"
        | "awaiting rule header"
        | "awaiting rule header colon"
        | "building rule" = "awaiting keyword";
    private partialError = ParserErrorBuilder(MatchBlockParser);
    private subMatchParser?: MatchBlockParser;
    private addingPathVariable = false;
    private hasAddedPathVariable = false;

    addToken(
        token: Token,
        nextToken: Token | null
    ): ParserError | WAIT | { type: "MatchBlock"; data: MatchBlock } {
        const errorBuilder = this.partialError(this.stage, token);
        switch (this.stage) {
            case "awaiting keyword":
                if (
                    token.type === "Keyword" &&
                    token.value === "match"
                ) {
                    this.stage = "awaiting path slash";
                    return WAIT;
                }
                return errorBuilder("Expected keyword 'match'");
            case "awaiting path slash":
                if (token.type === "/") {
                    this.stage = "awaiting path segment";
                    this.hasAddedPathVariable = false;
                    this.addingPathVariable = false;
                    return WAIT;
                }
                if (token.type === "{") {
                    this.stage = "awaiting rule header";
                    const {
                        path,
                        pathVariable
                    } = this.blockPath.exportPath();
                    const stringPath = path.reduce((pV, v) =>
                        pathVariable === v
                            ? `${pV}/[${v}]`
                            : `${pV}/${v}`
                    );
                    this.block.setPath(stringPath, pathVariable);
                    return WAIT;
                }
                return errorBuilder("Expected a / or {");
            case "awaiting path segment":
                if (token.type === "Keyword") {
                    this.blockPath.addComponent(
                        token.value,
                        this.addingPathVariable
                    );
                    if (this.addingPathVariable) {
                        this.hasAddedPathVariable = true;
                    } else this.stage = "awaiting path slash";
                    return WAIT;
                }
                if (token.type === "[") {
                    if (this.addingPathVariable)
                        return errorBuilder(
                            "Two [ in a row is not valid syntax"
                        );
                    this.addingPathVariable = true;
                    return WAIT;
                }
                if (token.type === "]") {
                    if (
                        !this.hasAddedPathVariable ||
                        !this.addingPathVariable
                    )
                        return errorBuilder("Unexpected ]");
                    this.stage = "awaiting path slash";
                    return WAIT;
                }
                return errorBuilder(`Unexpected token`);
            case "awaiting rule header":
                if (!this.subMatchParser) {
                    if (
                        token.type === "Keyword" &&
                        token.value === "match"
                    ) {
                        this.subMatchParser = this.spawn(
                            MatchBlockParser
                        );
                    }
                }
                if (this.subMatchParser) {
                    let subResponse = this.subMatchParser.addToken(
                        token,
                        nextToken
                    );
                    if (
                        subResponse === WAIT ||
                        subResponse instanceof ParserError
                    ) {
                        return subResponse;
                    }
                    this.subMatchParser = undefined;
                    this.block.addChild(subResponse.data);
                    return WAIT;
                }
                if (
                    token.type === "Keyword" &&
                    isRuleHeader(token.value)
                ) {
                    this.ruleBuildingType = token.value;
                    this.stage = "awaiting rule header colon";
                    return WAIT;
                }
                if (token.type === ";" || token.type === ",") {
                    // This is a leftover of a one liner, we ignore it
                    return WAIT;
                }
                if (token.type === "}") {
                    return {
                        type: "MatchBlock",
                        data: this.block
                    };
                }
                return errorBuilder("Unexpected token");
            case "awaiting rule header colon":
                if (token.type === ":") {
                    this.stage = "building rule";
                    return WAIT;
                }
                return errorBuilder("Unexpected token");
            case "building rule":
                if (!this.matchDeepParser) {
                    // We now assign the deepParser depending on the current token
                    if (token.type === "{") {
                        console.log("Content is block");
                        this.matchDeepParser = this.spawn(
                            CodeBlockParser
                        );
                        // We now return since the codeBlock wont be fed the first {
                        return WAIT;
                    }
                    console.log("Content isn´t block");
                    this.matchDeepParser = this.spawn(
                        ConditionParser
                    );
                }
                const deepParserReturn = this.matchDeepParser.addToken(
                    token,
                    nextToken
                );
                if (
                    deepParserReturn instanceof ParserError ||
                    deepParserReturn === WAIT
                ) {
                    return deepParserReturn;
                }
                if (deepParserReturn.type === "CodeBlock") {
                    // First we ensure the codeblock actually returns
                    if (!deepParserReturn.data.allPathsReturn()) {
                        return errorBuilder(
                            "Not all paths in the Rule body returns a value"
                        );
                    }
                }
                this.block.addRule(
                    this.ruleBuildingType!,
                    deepParserReturn.data
                );
                this.ruleBuildingType = undefined;
                this.stage = "awaiting rule header";
                this.matchDeepParser = undefined;
                return WAIT;
        }
    }
}
