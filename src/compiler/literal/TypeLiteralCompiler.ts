import { TypeLiteral } from "../../types/literals";
import { LiteralCompiler } from "./LiteralCompiler";
import { ValueType } from "../../types";

export const TypeLiteralCompiler: LiteralCompiler<TypeLiteral> = item =>
    `${rawValues[item.value]}`;

const rawValues: { [index in ValueType]: string } = {
    string: "string",
    boolean: "bool",
    number: "number",
    timestamp: "timestamp",
    Array: "list",
    Map: "map"
};
