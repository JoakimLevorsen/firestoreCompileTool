import { BooleanLiteral } from "../../types/literals";
import { LiteralCompiler } from "./LiteralCompiler";

export const BooleanLiteralCompiler: LiteralCompiler<BooleanLiteral> = item =>
    String(item.value);
