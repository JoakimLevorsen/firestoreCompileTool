import { DatabaseLocation } from "..";
import { ComparisonExpression } from "../../types/expressions/comparison";
import Literal from "../../types/literals";
import { auth } from "./auth";
// import { ValueType } from "../../types";
import { CallExpression } from "../../types/expressions/CallExpression";

export interface Scope {
    [index: string]:
        | Literal
        | ComparisonExpression
        | DatabaseLocation
        | CallExpression;
}

export const intitialScope: Scope = {
    auth
};
