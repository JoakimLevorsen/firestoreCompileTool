import { RuleSet } from ".";
import { isRuleSet } from "./Rule";

export interface MatchGroup {
    path: string[];
    pathVariables: string[];
    rules: RuleSet;
    subGroups?: MatchGroup[];
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
        if (input.subGroups) {
            if (
                input.subGroups instanceof Array &&
                input.subGroups.every((sG: any) => isMatchGroup(sG))
            ) {
                return true;
            }
            return false;
        }
        return true;
    } else {
        return false;
    }
};
