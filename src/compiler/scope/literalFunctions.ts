import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { string } from "./string";
import { ValueType } from "../../types";
import { Literal } from "../../types/literals";

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

const base: {
    [index: string]: OutsideFunctionDeclaration;
} = {};

export const functionsForLiteral = (item: Literal) =>
    LiteralFunctions[item.type];

export const AllLiteralFunctions: {
    [index: string]: OutsideFunctionDeclaration;
} = Object.keys(LiteralFunctions).reduce(
    (pV, key) => ({
        ...pV,
        ...Object.keys(LiteralFunctions[key as ValueType]).reduce(
            (collection, functionName) => ({
                ...collection,
                [functionName]:
                    LiteralFunctions[key as ValueType][functionName]
            }),
            { ...base }
        )
    }),
    { ...base }
);
