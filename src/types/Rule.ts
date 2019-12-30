import { Expression, isExpression, IfBlock, CodeBlock } from ".";
import { Condition, isCondition } from "./conditions";

export type Rule = Condition | CodeBlock;

export type RuleHeader =
    | "read"
    | "write"
    | "create"
    | "update"
    | "delete";

export type RuleSet = { [Header in RuleHeader]?: Rule };

export const isRule = (input: any): input is Rule =>
    isCondition(input) || input instanceof CodeBlock;

export const isRuleHeader = (input: any): input is RuleHeader => {
    if (typeof input !== "string") {
        return false;
    }
    if (
        input === "read" ||
        input === "write" ||
        input === "create" ||
        input === "delete" ||
        input === "delete"
    ) {
        return true;
    }
    return false;
};

export const isRuleSet = (input: any): input is RuleSet => {
    if (typeof input !== "object") {
        return false;
    }
    // Check all the keys are valid
    if (!Object.keys(input).every(r => isRuleHeader(r))) {
        return false;
    }
    // Check all the values are valid
    if (!Object.values(input).every(r => isRule(r))) {
        return false;
    }
    return true;
};
