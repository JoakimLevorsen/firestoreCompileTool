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
    number: {},
    timestamp: {},
    Map: {},
    Array: {}
};

export const getLiteralFunction = (
    name: string
): OutsideFunctionDeclaration | null => {
    for (const key in LiteralFunctions) {
        if ((LiteralFunctions as any)[key]?.[name]) {
            return (LiteralFunctions as any)[key]?.[
                name
            ] as OutsideFunctionDeclaration;
        }
    }
    return null;
};
