import { RuleSet } from ".";
import { isRuleSet } from "./Rule";

export interface MatchGroup {
    path: string[];
    pathVariables: string[];
    rules: RuleSet;
}

export const isMatchGroup = (input: any): input is MatchGroup => {
    if (typeof input !== "object") {
        return false;
    }
    const { path, pathVariables, rules } = input;
    if (!path || !pathVariables || !rules) {
        return false;
    }
    if (
        !(path instanceof Array) ||
        !path.every(p => typeof p === "string")
    ) {
        return false;
    }
    if (
        !(pathVariables instanceof Array) ||
        !pathVariables.every(p => typeof p === "string")
    ) {
        return false;
    }
    if (isRuleSet(rules)) {
        return true;
    } else {
        return false;
    }
};
