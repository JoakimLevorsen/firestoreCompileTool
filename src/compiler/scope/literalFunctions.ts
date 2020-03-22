import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { string } from "./string";
import { ValueType } from "../../types";

export interface LiteralFunctionWrapper {
    functions: OutsideFunctionDeclaration[];
}

export const LiteralFunctions: {
    [key in ValueType]: {
        [index: string]: OutsideFunctionDeclaration;
    };
} = {
    string,
    boolean: {},
    null: {},
    number: {},
    timestamp: {},
    Map: {},
    Array: {}
};
