import { TypeLiteral } from "../../types/literals";
import { LiteralCompiler } from "./LiteralCompiler";

export const TypeLiteralCompiler: LiteralCompiler<TypeLiteral> = item =>
    `${rawValues[item.value]}`;

const rawValues: { [index: string]: string } = {
    string: "string",
    boolean: "bool",
    number: "number",
    null: "null",
    timestamp: "timestamp"
};
