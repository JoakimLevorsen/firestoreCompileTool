import { charBlock, WAIT } from ".";
import { Expression, Interface } from "../types";
import ParserError from "./ParserError";

export default class ExpressionParser {
    private stage:
        | "awaiting conditionVal"
        | "awaiting oprerator"
        | "awaiting conditionFin" = "awaiting conditionVal";
    private allInterfaces: { [id: string]: Interface };
    private conditionVal: string = "";
    private operatior?: string;
    private conditionFin?: string;

    constructor(interfaces: { [id: string]: Interface }) {
        this.allInterfaces = interfaces;
    }

    public addChar(
        block: charBlock,
        _?: any
    ): ParserError | WAIT | { type: "Expression"; data: Expression } {
        const builderError = this.buildError(block, this.stage);
        switch (this.stage) {
            case "awaiting conditionVal":
                if (block.type !== "Keyword") {
                    return builderError("Expected keyword");
                }
                if (
                    block.value === "true" ||
                    block.value === "false"
                ) {
                    // We got a value, so we just return that
                    if (block.value === "true") {
                        return { type: "Expression", data: true };
                    }
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
                if (block.type !== "Keyword") {
                    return builderError(
                        "Unexpected block type, condition is " +
                            this.conditionVal
                    );
                }
                // We now check for the valid keywords
                if (block.value === "is") {
                    this.operatior = block.value;
                    this.stage = "awaiting conditionFin";
                    return WAIT;
                }
                return builderError("Unknown operator");
            case "awaiting conditionFin":
                if (block.type !== "Keyword") {
                    return builderError("Expected keyword");
                }
                if (!this.operatior) {
                    return builderError("Internal error");
                }
                // Depending on the operator our next path changes.
                if (this.operatior === "is") {
                    if (!this.allInterfaces[block.value]) {
                        return builderError("Unknown interface");
                    }
                    return {
                        data: [
                            this.conditionVal,
                            "is",
                            this.allInterfaces[block.value]
                        ],
                        type: "Expression"
                    };
                }
                if (
                    this.operatior === "Equals" ||
                    this.operatior === "NotEquals"
                ) {
                    if (
                        block.value === "true" ||
                        block.value === "false"
                    ) {
                        // We got a value, so we just return that
                        return {
                            data: [
                                this.conditionVal,
                                this.operatior === "Equals"
                                    ? "="
                                    : "≠",
                                block.value
                            ],
                            type: "Expression"
                        };
                    }
                }
                // TODO: Add support for more == types than bool
                return builderError("Non valid comparison type");
        }
    }

    private buildError = (block: charBlock, stage: string) => (
        reason: string
    ) => new ParserError(reason, block, ExpressionParser, stage);
}
