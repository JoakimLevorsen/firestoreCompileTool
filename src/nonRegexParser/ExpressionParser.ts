import { Interface } from "../extractionTools/interface";
import { Type, extractType } from "../extractionTools";
import { charBlock, WAIT, charType } from ".";
import ParserError from "./ParserError";

type ifIsType = [string, "is", Interface];
type ifEqual = [string, "=" | "≠", Type | string];
export type ifCondition = ifIsType | ifEqual;

export type Expression = boolean | ifCondition;

export default class ExpressionParser {
    stage:
        | "awaiting conditionVal"
        | "awaiting oprerator"
        | "awaiting conditionFin" = "awaiting conditionVal";
    allInterfaces: { [id: string]: Interface };
    conditionVal: string = "";
    operatior?: string;
    conditionFin?: string;
    count = 0;

    constructor(interfaces: { [id: string]: Interface }) {
        console.log("Expression parser created");
        this.allInterfaces = interfaces;
    }

    private buildError = (block: charBlock, stage: string) => (
        reason: string
    ) => new ParserError(reason, block, ExpressionParser, stage);

    public addChar(
        block: charBlock,
        _?: any
    ): ParserError | WAIT | { type: "Expression"; data: Expression } {
        const builderError = this.buildError(block, this.stage);
        console.log(
            `Expression parser got ${JSON.stringify(
                block
            )} with hit ${this.count++} and stage: ${this.stage}`
        );
        switch (this.stage) {
            case "awaiting conditionVal":
                if (block.type !== "Keyword")
                    return builderError("Expected keyword");
                if (
                    block.value === "true" ||
                    block.value === "false"
                ) {
                    // We got a value, so we just return that
                    if (block.value === "true")
                        return { type: "Expression", data: true };
                    return { type: "Expression", data: false };
                }
                // Then we assume that the block is an item
                // TODO: Check this
                this.conditionVal = block.value;
                this.stage = "awaiting oprerator";
                return WAIT;
            case "awaiting oprerator":
                if (
                    block.type === "Equals" ||
                    block.type === "NotEquals"
                ) {
                    this.operatior = block.type;
                    this.stage = "awaiting conditionFin";
                    return WAIT;
                }
                if (block.type !== "Keyword")
                    return builderError(
                        "Unexpected block type, condition is " +
                            this.conditionVal
                    );
                // We now check for the valid keywords
                if (block.value === "is") {
                    this.operatior = block.value;
                    this.stage = "awaiting conditionFin";
                    return WAIT;
                }
                return builderError("Unknown operator");
            case "awaiting conditionFin":
                if (block.type !== "Keyword")
                    return builderError("Expected keyword");
                if (!this.operatior)
                    return builderError("Internal error");
                // Depending on the operator our next path changes.
                if (this.operatior === "is") {
                    if (!this.allInterfaces[block.value])
                        return builderError("Unknown interface");
                    return {
                        type: "Expression",
                        data: [
                            this.conditionVal,
                            "is",
                            this.allInterfaces[block.value]
                        ]
                    };
                }
                if (
                    this.operatior === "=" ||
                    this.operatior === "≠"
                ) {
                    if (
                        block.value === "true" ||
                        block.value === "false"
                    ) {
                        // We got a value, so we just return that
                        return {
                            type: "Expression",
                            data: [
                                this.conditionVal,
                                this.operatior,
                                block.value
                            ]
                        };
                    }
                }
                // TODO: Add support for more == types than bool
                return builderError("Non valid comparison type");
        }
    }
}
