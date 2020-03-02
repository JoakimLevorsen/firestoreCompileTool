import { StringLiteral } from "../../parser/types/literal";
import { LiteralCompiler } from "./LiteralCompiler";

export const StringLiteralCompiler: LiteralCompiler<StringLiteral> = item =>
    `"${item.value.replace(/"/g, "\u0022")}"`;
