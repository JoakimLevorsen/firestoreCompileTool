import { StringLiteral } from "../../types/literals";
import { LiteralCompiler } from "./LiteralCompiler";

export const StringLiteralCompiler: LiteralCompiler<StringLiteral> = item =>
    `"${item.value.replace(/"/g, "\u0022")}"`;
