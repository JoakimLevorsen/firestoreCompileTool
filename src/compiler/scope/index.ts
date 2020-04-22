import { DatabaseLocation } from "..";
import { ComparisonExpression } from "../../types/expressions/comparison";
import Literal from "../../types/literals";
import { auth } from "./auth";
// import { ValueType } from "../../types";
import { CallExpression } from "../../types/expressions/CallExpression";
import OptionalDependecyTracker from "../OptionalDependencyTracker";

export interface ScopeItem {
    value:
        | Literal
        | ComparisonExpression
        | DatabaseLocation
        | CallExpression;
    optionalChecks?: OptionalDependecyTracker;
}

export interface Scope {
    [index: string]: ScopeItem;
}

export const intitialScope: Scope = {
    auth
};
