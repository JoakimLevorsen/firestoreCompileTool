import { StringLiteral } from "../../types/literals";
import { LiteralCompiler } from "./LiteralCompiler";

export const StringLiteralCompiler: LiteralCompiler<StringLiteral> = item =>
    item.type === '"'
        ? `"${item.value.replace(/"/g, "\u0022")}"`
        : `'${item.value.replace(/'/g, "\u0027")}'`;
